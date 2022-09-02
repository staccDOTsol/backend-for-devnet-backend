import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "dotenv/config";

const arbTest = {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: ["0x0306a2a199653dc06bf3dd463a27a9351b4e29af30abd0013163722c77a7dc1f"],
};

const mainnet = {
  url: "https://bsc-dataseed.binance.org/",
  chainId: 56,
  accounts: ["0x0306a2a199653dc06bf3dd463a27a9351b4e29af30abd0013163722c77a7dc1f"],
  gas: 5000000000
};

const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
     testnet: arbTest,
     mainnet: mainnet,
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 99999,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: false,
  },
};

export default config;
