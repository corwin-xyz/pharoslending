
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharosLending", function () {
  let pharosToken;
  let usdpToken;
  let creditScoring;
  let restaking;
  let lending;
  let owner;
  let user1;
  let user2;
  
  const initialMint = ethers.utils.parseEther("10000"); // 10,000 tokens
  const depositAmount = ethers.utils.parseEther("1000"); // 1,000 USDP
  const borrowAmount = ethers.utils.parseEther("500");   // 500 USDP
  const collateralAmount = ethers.utils.parseEther("100"); // 100 PHAR (assuming 1 PHAR = 10 USDP)
  
  beforeEach(async function () {
    // Deploy contracts
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy tokens
    const PharosToken = await ethers.getContractFactory("PharosToken");
    pharosToken = await PharosToken.deploy(owner.address);
    
    const USDPToken = await ethers.getContractFactory("USDPToken");
    usdpToken = await USDPToken.deploy(owner.address);
    
    // Deploy credit scoring
    const CreditScoring = await ethers.getContractFactory("CreditScoring");
    creditScoring = await CreditScoring.deploy(owner.address, pharosToken.address);
    
    // Deploy restaking
    const RestakingIntegration = await ethers.getContractFactory("RestakingIntegration");
    restaking = await RestakingIntegration.deploy(owner.address, pharosToken.address);
    
    // Deploy lending
    const PharosLending = await ethers.getContractFactory("PharosLending");
    lending = await PharosLending.deploy(
      owner.address,
      usdpToken.address,
      pharosToken.address,
      creditScoring.address,
      restaking.address
    );
    
    // Transfer ownership to lending contract
    await creditScoring.transferOwnership(lending.address);
    await restaking.transferOwnership(lending.address);
    
    // Mint tokens to users for testing
    await pharosToken.mint(user1.address, initialMint);
    await pharosToken.mint(user2.address, initialMint);
    await usdpToken.mint(user1.address, initialMint);
    await usdpToken.mint(user2.address, initialMint);
    
    // Approve lending contract to spend tokens
    await pharosToken.connect(user1).approve(lending.address, initialMint);
    await pharosToken.connect(user2).approve(lending.address, initialMint);
    await usdpToken.connect(user1).approve(lending.address, initialMint);
    await usdpToken.connect(user2).approve(lending.address, initialMint);
    
    // Also approve for restaking
    await pharosToken.connect(user1).approve(restaking.address, initialMint);
    await pharosToken.connect(user2).approve(restaking.address, initialMint);
  });
  
  describe("Deposit and Withdrawal", function () {
    it("Should allow users to deposit USDP", async function () {
      await lending.connect(user1).deposit(depositAmount);
      
      const userLending = await lending.userLending(user1.address);
      expect(userLending.deposited).to.equal(depositAmount);
      
      const totalDeposited = await lending.totalDeposited();
      expect(totalDeposited).to.equal(depositAmount);
    });
    
    it("Should allow users to withdraw their USDP", async function () {
      // First deposit
      await lending.connect(user1).deposit(depositAmount);
      
      // Then withdraw
      await lending.connect(user1).withdraw(depositAmount);
      
      const userLending = await lending.userLending(user1.address);
      expect(userLending.deposited).to.equal(0);
      
      const totalDeposited = await lending.totalDeposited();
      expect(totalDeposited).to.equal(0);
    });
    
    it("Should not allow withdrawal more than deposited", async function () {
      await lending.connect(user1).deposit(depositAmount);
      
      await expect(
        lending.connect(user1).withdraw(depositAmount.mul(2))
      ).to.be.revertedWith("Insufficient deposited balance");
    });
  });
  
  describe("Borrowing and Repayment", function () {
    beforeEach(async function () {
      // Deposit liquidity first
      await lending.connect(user2).deposit(depositAmount);
    });
    
    it("Should allow users to borrow with sufficient collateral", async function () {
      await lending.connect(user1).borrow(borrowAmount, collateralAmount);
      
      const userBorrowing = await lending.userBorrowing(user1.address);
      expect(userBorrowing.borrowed).to.equal(borrowAmount);
      expect(userBorrowing.collateral).to.equal(collateralAmount);
      expect(userBorrowing.active).to.equal(true);
      
      const totalBorrowed = await lending.totalBorrowed();
      expect(totalBorrowed).to.equal(borrowAmount);
      
      const totalCollateral = await lending.totalCollateral();
      expect(totalCollateral).to.equal(collateralAmount);
    });
    
    it("Should allow users to fully repay loans", async function () {
      // First borrow
      await lending.connect(user1).borrow(borrowAmount, collateralAmount);
      
      // Then repay
      await lending.connect(user1).repay(borrowAmount);
      
      const userBorrowing = await lending.userBorrowing(user1.address);
      expect(userBorrowing.borrowed).to.equal(0);
      expect(userBorrowing.collateral).to.equal(0); // Collateral should be returned
      expect(userBorrowing.active).to.equal(false);
      
      const totalBorrowed = await lending.totalBorrowed();
      expect(totalBorrowed).to.equal(0);
      
      const totalCollateral = await lending.totalCollateral();
      expect(totalCollateral).to.equal(0);
    });
    
    it("Should not allow borrowing without sufficient collateral", async function () {
      // Try to borrow with insufficient collateral
      const smallCollateral = ethers.utils.parseEther("1"); // Very small amount
      
      await expect(
        lending.connect(user1).borrow(borrowAmount, smallCollateral)
      ).to.be.revertedWith("Insufficient collateral for requested loan");
    });
  });
  
  describe("Interest Calculation", function () {
    it("Should accrue interest for lenders over time", async function () {
      await lending.connect(user1).deposit(depositAmount);
      
      // Move time forward 365 days (1 year)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Check accrued interest (should be ~5% of deposit)
      const accrued = await lending.getTotalAccruedInterest(user1.address);
      const expectedInterest = depositAmount.mul(5).div(100);
      
      // Allow for small precision differences
      const diff = accrued.sub(expectedInterest).abs();
      expect(diff.lt(ethers.utils.parseEther("1"))).to.be.true;
    });
    
    it("Should accrue interest for borrowers over time", async function () {
      // Deposit liquidity first
      await lending.connect(user2).deposit(depositAmount);
      
      // Borrow
      await lending.connect(user1).borrow(borrowAmount, collateralAmount);
      
      // Move time forward 365 days (1 year)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Check accrued interest (should be ~8% of borrowed amount)
      const interestOwed = await lending.getTotalInterestOwed(user1.address);
      const expectedInterest = borrowAmount.mul(8).div(100);
      
      // Allow for small precision differences
      const diff = interestOwed.sub(expectedInterest).abs();
      expect(diff.lt(ethers.utils.parseEther("1"))).to.be.true;
    });
  });
});
