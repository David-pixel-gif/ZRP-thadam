/**
 * @file Web3Context.js
 * @description Provides a React Context for Web3, MetaMask, and smart contract instances.
 * It automatically connects to MetaMask and loads deployed contracts from the Truffle build folder.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";

// Import the compiled contract artifacts (from truffle-config output)
import ForensicContract from "../contracts/ForensicContract.json";
import SimpleStorage from "../contracts/SimpleStorage.json";

const Web3Context = createContext();

// ✅ Custom hook for easy access to the Web3 context
export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [contracts, setContracts] = useState({
    forensic: null,
    simpleStorage: null,
  });

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // 🦊 Check if MetaMask is available
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const userAccounts = await web3Instance.eth.getAccounts();
          const networkId = await web3Instance.eth.net.getId();

          console.log("Connected to network:", networkId);

          // 🧱 Load deployed contracts dynamically based on network ID
          const forensicData = ForensicContract.networks[networkId];
          const storageData = SimpleStorage.networks[networkId];

          let forensic = null;
          let simpleStorage = null;

          if (forensicData) {
            forensic = new web3Instance.eth.Contract(
              ForensicContract.abi,
              forensicData.address
            );
          } else {
            console.warn("⚠️ ForensicContract not deployed on this network.");
          }

          if (storageData) {
            simpleStorage = new web3Instance.eth.Contract(
              SimpleStorage.abi,
              storageData.address
            );
          } else {
            console.warn("⚠️ SimpleStorage not deployed on this network.");
          }

          // ✅ Set states
          setWeb3(web3Instance);
          setAccounts(userAccounts);
          setNetworkId(networkId);
          setContracts({ forensic, simpleStorage });

          // 🔁 Listen for account / network changes
          window.ethereum.on("accountsChanged", (accs) => setAccounts(accs));
          window.ethereum.on("chainChanged", () => window.location.reload());
        } else {
          alert("⚠️ Please install MetaMask to use this DApp.");
        }
      } catch (err) {
        console.error("❌ Web3 initialization failed:", err);
      }
    };

    initWeb3();
  }, []);

  // 📦 Provide context to entire app
  return (
    <Web3Context.Provider
      value={{
        web3,
        accounts,
        networkId,
        contracts,
        isReady: web3 && accounts.length > 0,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
