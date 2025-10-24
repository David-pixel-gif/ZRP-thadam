/**
 * @title Truffle Configuration for ZRP Thadam Blockchain System
 * @notice Configuration for deploying and testing the blockchain-based
 * criminal record system with local Ganache, Infura (Sepolia), and private networks.
 *
 * Features:
 *  - Local development with Ganache (port 8545)
 *  - Optional remote testing via Infura (Sepolia)
 *  - Solidity ^0.8.20 compiler support
 *  - Contracts output stored in client/src/contracts for React integration
 */

const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

// 🔐 Infura project API key (optional, used for remote deployment)
const INFURA_API_KEY = "f2477b75edf34b4999896ce9ef3b585c";

// ⚠️ Mnemonic (development only — never use real phrases for production)
const MNEMONIC =
  "size alley piece zone erosion decide royal foam sentence lava erosion eyebrow";

module.exports = {
  // --- 🌐 Network Configurations ---
  networks: {
    // 🚀 Local Ganache CLI / GUI development network
    development: {
      host: "127.0.0.1",
      port: 8545, // ✅ Matches your current Ganache CLI instance
      network_id: "*", // ✅ Matches Chain ID from your Ganache output
    },

    // 🌍 Optional: Infura testnet for remote testing (Sepolia recommended)
    sepolia: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: MNEMONIC,
          },
          providerOrUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
        }),
      network_id: 11155111, // Sepolia Network ID
      gas: 5500000,
      gasPrice: 20000000000, // 20 Gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    // 🛡️ Private / Permissioned Blockchain (Phase 5)
    private_network: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6000000,
      gasPrice: 0,
    },
  },

  // --- 📁 Directory for compiled contract artifacts (for React frontend) ---
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  // --- ⚙️ Solidity Compiler Configuration ---
  compilers: {
    solc: {
      version: "0.8.20", // ✅ Matches the pragma solidity ^0.8.0 in all contracts
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  // --- 🧪 Mocha Testing Settings ---
  mocha: {
    timeout: 100000, // Increase timeout for slow test networks
  },
};
