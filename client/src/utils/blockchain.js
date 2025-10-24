// client/src/utils/blockchain.js

import Web3 from "web3";
import SimpleStorageArtifact from "../contracts/SimpleStorage.json";
import ForensicContractArtifact from "../contracts/ForensicContract.json";

/**
 * Connects to MetaMask and returns Web3 + contract instances.
 * This is your unified entry point for blockchain interaction.
 */
export const loadBlockchainData = async () => {
  try {
    // ✅ 1. Check if MetaMask (window.ethereum) is available
    if (typeof window.ethereum === "undefined") {
      alert("⚠️ Please install MetaMask to use this DApp.");
      throw new Error("MetaMask not installed");
    }

    // ✅ 2. Create Web3 instance using MetaMask provider
    const web3 = new Web3(window.ethereum);

    // ✅ 3. Request account access from MetaMask
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    console.log("🦊 Connected account:", account);

    // ✅ 4. Get current network ID (Ganache usually uses 5777)
    const networkId = await web3.eth.net.getId();
    console.log("🌐 Network ID:", networkId);

    // ✅ 5. Load contract ABIs & Deployed Addresses from artifacts
    const simpleStorageData = SimpleStorageArtifact.networks[networkId];
    const forensicData = ForensicContractArtifact.networks[networkId];

    if (!simpleStorageData || !forensicData) {
      throw new Error(
        "❌ Contracts not deployed to the current network. Please check Ganache or truffle-config.js"
      );
    }

    // ✅ 6. Create contract instances
    const simpleStorage = new web3.eth.Contract(
      SimpleStorageArtifact.abi,
      simpleStorageData.address
    );

    const forensicContract = new web3.eth.Contract(
      ForensicContractArtifact.abi,
      forensicData.address
    );

    console.log("✅ SimpleStorage at:", simpleStorageData.address);
    console.log("✅ ForensicContract at:", forensicData.address);

    // ✅ 7. Return useful blockchain context
    return {
      web3,
      account,
      simpleStorage,
      forensicContract,
    };
  } catch (err) {
    console.error("❌ Blockchain initialization error:", err);
    return null;
  }
};
