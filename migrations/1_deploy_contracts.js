// migrations/2_deploy_contracts.js
const SimpleStorage = artifacts.require("SimpleStorage");
const ForensicContract = artifacts.require("ForensicContract");

module.exports = async function (deployer, network, accounts) {
  console.log("==============================================");
  console.log("🚀 ZRP Thadam System — Smart Contract Deployment");
  console.log("🔗 Network:", network);
  console.log("👤 Deployer account:", accounts[0]);
  console.log("==============================================");

  // --- 🧱 Deploy SimpleStorage ---
  await deployer.deploy(SimpleStorage);
  const simpleStorage = await SimpleStorage.deployed();
  console.log("✅ SimpleStorage deployed at:", simpleStorage.address);

  // --- 🧬 Deploy ForensicContract ---
  await deployer.deploy(ForensicContract);
  const forensicContract = await ForensicContract.deployed();
  console.log("✅ ForensicContract deployed at:", forensicContract.address);

  // --- 🧩 Post-Deployment Summary ---
  console.log("----------------------------------------------");
  console.log("🎯 Deployment Complete");
  console.log("   🔹 SimpleStorage:", simpleStorage.address);
  console.log("   🔹 ForensicContract:", forensicContract.address);
  console.log("📦 Contracts available under: client/src/contracts/");
  console.log("----------------------------------------------");
};
