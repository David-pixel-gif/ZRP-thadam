// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZRP Thadam - SimpleStorage (Crime Registry Core)
 * @notice Base blockchain module for crime registry records.
 * 
 * Objectives:
 *  1️⃣ Tamper-proof crime record anchoring
 *  2️⃣ Role-based access (Police, Forensic, Admin)
 *  3️⃣ Full event audit trail
 *  4️⃣ Off-chain encrypted IPFS linkage
 *  5️⃣ Consent tracking for compliance
 * 
 * @dev Works as the foundational storage contract in the ZRP Thadam system.
 * Compatible with MetaMask, Web3.js, and private PoA networks (Geth / Besu).
 */
contract SimpleStorage {
    // ------------------------
    // 🔐 ROLE MANAGEMENT
    // ------------------------
    enum Role { None, Police, Forensic, Admin }
    mapping(address => Role) private roles;
    address public contractOwner;

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Access denied: not contract owner");
        _;
    }

    modifier onlyRole(Role required) {
        require(
            roles[msg.sender] == required || roles[msg.sender] == Role.Admin,
            "Access denied: insufficient privileges"
        );
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        roles[msg.sender] = Role.Admin; // Deployer = Admin
    }

    // ------------------------
    // 🧩 DATA STRUCTURES
    // ------------------------
    struct CrimeDetails {
        uint256 crimeId;       // Unique identifier
        string timestamp;      // Time of creation
        string offenseCode;    // Offense category/code
        string ipfsHash;       // Encrypted off-chain data (CID)
        bytes32 dataHash;      // SHA256 hash of off-chain encrypted data
        address addedBy;       // Police officer submitting the record
    }

    CrimeDetails[] private crimeReports;

    // Consent tracking
    struct ConsentRecord {
        address user;
        bytes32 consentHash;
        uint256 timestamp;
    }

    mapping(address => ConsentRecord[]) public consentLogs;

    // ------------------------
    // 📢 EVENTS
    // ------------------------
    event RoleAssigned(address indexed user, Role role);
    event CrimeReportAdded(
        uint256 indexed crimeId,
        address indexed addedBy,
        string ipfsHash,
        bytes32 dataHash
    );
    event CrimeReportAccessed(uint256 indexed index, address indexed accessedBy, uint256 timestamp);
    event ConsentLogged(address indexed user, bytes32 consentHash, uint256 timestamp);
    event DataTamperCheck(uint256 indexed crimeId, bool verified, uint256 timestamp);

    // ------------------------
    // ⚙️ ROLE ASSIGNMENT
    // ------------------------
    function assignRole(address user, Role role) external onlyRole(Role.Admin) {
        require(user != address(0), "Invalid address");
        require(role != Role.None, "Cannot assign 'None' role");
        roles[user] = role;
        emit RoleAssigned(user, role);
    }

    function getUserRole(address user) external view returns (Role) {
        return roles[user];
    }

    // ------------------------
    // 🧾 CRIME REPORT STORAGE
    // ------------------------
    /**
     * @notice Add a new crime report (Police only).
     * @param _crimeId Unique case identifier
     * @param _timestamp Time created
     * @param _offenseCode Offense category or section code
     * @param _ipfsHash CID reference to encrypted data
     * @param _dataHash SHA256 hash of the encrypted data
     */
    function addCrimeReport(
        uint256 _crimeId,
        string memory _timestamp,
        string memory _offenseCode,
        string memory _ipfsHash,
        bytes32 _dataHash
    ) external onlyRole(Role.Police) returns (uint256) {
        crimeReports.push(
            CrimeDetails({
                crimeId: _crimeId,
                timestamp: _timestamp,
                offenseCode: _offenseCode,
                ipfsHash: _ipfsHash,
                dataHash: _dataHash,
                addedBy: msg.sender
            })
        );

        emit CrimeReportAdded(_crimeId, msg.sender, _ipfsHash, _dataHash);
        return crimeReports.length;
    }

    function getCrimeCount() external view returns (uint256) {
        return crimeReports.length;
    }

    /**
     * @notice Retrieve a specific report (Forensic or Admin).
     */
    function getCrimeBlock(uint256 index)
        external
        onlyRole(Role.Forensic)
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            bytes32,
            address
        )
    {
        require(index < crimeReports.length, "Invalid index");
        CrimeDetails storage c = crimeReports[index];
        emit CrimeReportAccessed(index, msg.sender, block.timestamp);
        return (
            c.crimeId,
            c.timestamp,
            c.offenseCode,
            c.ipfsHash,
            c.dataHash,
            c.addedBy
        );
    }

    /**
     * @notice Verify the hash integrity of a specific crime report.
     * @param index Index of the report to verify.
     * @param providedHash The SHA256 hash to compare against.
     * @return verified True if hashes match.
     */
    function verifyDataIntegrity(uint256 index, bytes32 providedHash)
        external
        returns (bool verified)
    {
        require(index < crimeReports.length, "Invalid index");
        verified = (crimeReports[index].dataHash == providedHash);
        emit DataTamperCheck(crimeReports[index].crimeId, verified, block.timestamp);
        return verified;
    }

    /**
     * @notice Retrieve all stored reports (Admin only).
     */
    function getAllCrimeDetails()
        external
        view
        onlyRole(Role.Admin)
        returns (CrimeDetails[] memory)
    {
        return crimeReports;
    }

    // ------------------------
    // ⚖️ CONSENT LOGGING
    // ------------------------
    function logConsent(bytes32 consentHash) external {
        ConsentRecord memory consent = ConsentRecord({
            user: msg.sender,
            consentHash: consentHash,
            timestamp: block.timestamp
        });
        consentLogs[msg.sender].push(consent);
        emit ConsentLogged(msg.sender, consentHash, block.timestamp);
    }

    function getConsentLogs(address user)
        external
        view
        returns (ConsentRecord[] memory)
    {
        return consentLogs[user];
    }
}
