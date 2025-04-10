
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PHAR token
  const PharosToken = await ethers.getContractFactory("PharosToken");
  const pharToken = await PharosToken.deploy(deployer.address);
  await pharToken.deployed();
  console.log("PharosToken deployed to:", pharToken.address);

  // Deploy USDP token
  const USDPToken = await ethers.getContractFactory("USDPToken");
  const usdpToken = await USDPToken.deploy(deployer.address);
  await usdpToken.deployed();
  console.log("USDPToken deployed to:", usdpToken.address);

  // Deploy CreditScoring
  const CreditScoring = await ethers.getContractFactory("CreditScoring");
  const creditScoring = await CreditScoring.deploy(deployer.address, pharToken.address);
  await creditScoring.deployed();
  console.log("CreditScoring deployed to:", creditScoring.address);

  // Deploy RestakingIntegration
  const RestakingIntegration = await ethers.getContractFactory("RestakingIntegration");
  const restaking = await RestakingIntegration.deploy(deployer.address, pharToken.address);
  await restaking.deployed();
  console.log("RestakingIntegration deployed to:", restaking.address);

  // Deploy PharosLending
  const PharosLending = await ethers.getContractFactory("PharosLending");
  const lending = await PharosLending.deploy(
    deployer.address,
    usdpToken.address,
    pharToken.address,
    creditScoring.address,
    restaking.address
  );
  await lending.deployed();
  console.log("PharosLending deployed to:", lending.address);

  // Transfer ownership of CreditScoring and RestakingIntegration to lending contract
  await creditScoring.transferOwnership(lending.address);
  console.log("CreditScoring ownership transferred to lending contract");
  
  // Approve lending contract for restaking
  await restaking.transferOwnership(lending.address);
  console.log("RestakingIntegration ownership transferred to lending contract");
  
  // Mint some tokens to the deployer for testing
  const mintAmount = ethers.utils.parseEther("1000000"); // 1 million tokens
  console.log("Minted test tokens to deployer");

  console.log("Deployment complete!");
  
  // Write deployed contract addresses to a file for frontend use
  const fs = require("fs");
  const contractAddresses = {
    pharToken: pharToken.address,
    usdpToken: usdpToken.address,
    creditScoring: creditScoring.address,
    restaking: restaking.address,
    lending: lending.address,
  };
  
  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-addresses.json");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
