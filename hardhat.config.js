
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337
    },
    // Pharos testnet - adjust values accordingly when Pharos testnet is available
    pharosTestnet: {
      url: process.env.PHAROS_TESTNET_URL || "https://testnet-rpc.pharoschain.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 7771 // example chain ID, adjust to the actual Pharos testnet chain ID
    }
  },
  etherscan: {
    // For contract verification - adjust API key and URL when Pharos block explorer is available
    apiKey: process.env.EXPLORER_API_KEY || "",
    customChains: [
      {
        network: "pharosTestnet",
        chainId: 7771, // example, adjust to actual chain ID
        urls: {
          apiURL: "https://testnet-api.pharosscan.io/api",
          browserURL: "https://testnet.pharosscan.io"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
