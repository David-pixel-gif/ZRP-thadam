// migrations/1_initial_migration.js
const Migrations = artifacts.require("Migrations");

module.exports = async function (deployer, network, accounts) {
  console.log("🚀 Deploying Migrations contract on network:", network);

  await deployer.deploy(Migrations);
  const instance = await Migrations.deployed();

  console.log("✅ Migrations contract deployed at:", instance.address);
  console.log("🧩 Deployment completed by:", accounts[0]);
};
