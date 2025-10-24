// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZRP Thadam - Migrations
 * @notice Tracks deployment versions of the ZRP Thadam blockchain-based registry.
 * 
 * Purpose:
 *  - Ensures upgrade traceability across deployments.
 *  - Provides secure ownership transfer for controlled updates.
 *  - Emits auditable events for migration transparency.
 * 
 * Features:
 *  ✅ Ownership control
 *  ✅ Migration index tracking
 *  ✅ Timestamped migration events
 *  ✅ Supports private / PoA networks
 * 
 * @dev Used internally by Truffle or Hardhat deployment scripts.
 */
contract Migrations {
    // ------------------------
    // 🔐 STATE VARIABLES
    // ------------------------
    address public owner;
    uint256 public lastCompletedMigration;
    uint256 public lastMigrationTimestamp;

    // ------------------------
    // ⚙️ MODIFIERS
    // ------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Access denied: not contract owner");
        _;
    }

    // ------------------------
    // 🏗️ EVENTS
    // ------------------------
    event MigrationCompleted(uint256 indexed migrationId, address indexed by, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ------------------------
    // 🚀 CONSTRUCTOR
    // ------------------------
    constructor() {
        owner = msg.sender;
        lastMigrationTimestamp = block.timestamp;
    }

    // ------------------------
    // 🧩 MIGRATION MANAGEMENT
    // ------------------------
    /**
     * @notice Marks a migration as completed.
     * @param completed The migration index or version number.
     */
    function setCompleted(uint256 completed) external onlyOwner {
        lastCompletedMigration = completed;
        lastMigrationTimestamp = block.timestamp;
        emit MigrationCompleted(completed, msg.sender, block.timestamp);
    }

    /**
     * @notice Upgrades to a new migration contract.
     * @param newAddress The address of the new Migrations contract.
     */
    function upgrade(address newAddress) external onlyOwner {
        require(newAddress != address(0), "Invalid upgrade address");
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }

    // ------------------------
    // 🔄 OWNERSHIP CONTROL
    // ------------------------
    /**
     * @notice Transfers ownership to another account.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
