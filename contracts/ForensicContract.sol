// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZRP Thadam - Forensic Contract
 * @notice Full blockchain-based forensic registry for Zimbabwe Republic Police (ZRP)
 * Implements tamper-proof evidence tracking, secure sharing, and legal compliance.
 * 
 * Objectives covered:
 *  1️⃣ Tamper-proof record storage with RBAC
 *  2️⃣ Secure data sharing among agencies
 *  3️⃣ Event logging for accountability
 *  4️⃣ PII encryption anchoring (off-chain)
 *  5️⃣ Consent & data-protection compliance
 */
contract ForensicContract {
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

    modifier onlyRole(Role r) {
        require(
            roles[msg.sender] == r || roles[msg.sender] == Role.Admin,
            "Access denied: insufficient privileges"
        );
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        roles[msg.sender] = Role.Admin; // Deployer = Admin
    }

    // ------------------------
    // 🧩 STRUCTURES
    // ------------------------
    struct CrimeDetails {
        uint256 crimeId;
        string exhibitName;
        string desc;          // short desc or reference
        string timestamp;
        string ipfsHash;      // CID of encrypted JSON
        address addedBy;
    }

    struct FIRRecord {
        uint256 firId;
        string description;
        string ipfsHash;      // Encrypted FIR data
        address createdBy;
        string timestamp;
    }

    // Storage
    CrimeDetails[] private forensicRecords;
    FIRRecord[] private firRecords;

    // Shared Access: (caseId => address => accessGranted)
    mapping(uint256 => mapping(address => bool)) public sharedAccess;

    // Consent logs
    struct ConsentRecord {
        address user;
        bytes32 consentHash;
        uint256 timestamp;
    }

    mapping(address => ConsentRecord[]) public consentLogs;

    // ------------------------
    // 🧾 EVENTS
    // ------------------------
    event RoleAssigned(address indexed user, Role role);
    event ReportAdded(uint256 indexed crimeId, address indexed addedBy, string ipfsHash);
    event ReportAccessed(uint256 indexed index, address indexed accessedBy, uint256 timestamp);
    event FIRCreated(uint256 indexed firId, address indexed createdBy, string ipfsHash);
    event FIRAccessed(uint256 indexed firId, address indexed accessedBy, uint256 timestamp);
    event AccessGranted(uint256 indexed caseId, address indexed grantee, address indexed grantedBy);
    event AccessRevoked(uint256 indexed caseId, address indexed revokedFrom, address indexed revokedBy);
    event ConsentLogged(address indexed user, bytes32 consentHash, uint256 timestamp);

    // ------------------------
    // ⚙️ ROLE MANAGEMENT
    // ------------------------
    function assignRole(address user, Role role) external onlyRole(Role.Admin) {
        require(user != address(0), "Invalid address");
        require(role != Role.None, "Cannot assign 'None'");
        roles[user] = role;
        emit RoleAssigned(user, role);
    }

    function getUserRole(address user) external view returns (Role) {
        return roles[user];
    }

    // ------------------------
    // 📜 FIR MANAGEMENT
    // ------------------------
    function createFIR(
        uint256 _firId,
        string memory _description,
        string memory _timestamp,
        string memory _ipfsHash
    ) external onlyRole(Role.Police) returns (uint256) {
        firRecords.push(FIRRecord({
            firId: _firId,
            description: _description,
            ipfsHash: _ipfsHash,
            createdBy: msg.sender,
            timestamp: _timestamp
        }));

        emit FIRCreated(_firId, msg.sender, _ipfsHash);
        return firRecords.length;
    }

    function getFIR(uint256 index)
        external
        onlyRole(Role.Police)
        returns (
            uint256,
            string memory,
            string memory,
            address,
            string memory
        )
    {
        require(index < firRecords.length, "Invalid index");
        FIRRecord storage record = firRecords[index];
        emit FIRAccessed(record.firId, msg.sender, block.timestamp);
        return (
            record.firId,
            record.description,
            record.ipfsHash,
            record.createdBy,
            record.timestamp
        );
    }

    function getAllFIRs() external view onlyRole(Role.Admin) returns (FIRRecord[] memory) {
        return firRecords;
    }

    // ------------------------
    // 🔬 FORENSIC REPORT MANAGEMENT
    // ------------------------
    function addReport(
        uint256 _crimeId,
        string memory _exhibitName,
        string memory _desc,
        string memory _timestamp,
        string memory _ipfsHash
    ) external onlyRole(Role.Forensic) returns (uint256) {
        forensicRecords.push(CrimeDetails({
            crimeId: _crimeId,
            exhibitName: _exhibitName,
            desc: _desc,
            timestamp: _timestamp,
            ipfsHash: _ipfsHash,
            addedBy: msg.sender
        }));

        emit ReportAdded(_crimeId, msg.sender, _ipfsHash);
        return forensicRecords.length;
    }

    function getReport(uint256 index)
        external
        onlyRole(Role.Police)
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            address
        )
    {
        require(index < forensicRecords.length, "Invalid index");
        CrimeDetails storage record = forensicRecords[index];
        emit ReportAccessed(index, msg.sender, block.timestamp);
        return (
            record.crimeId,
            record.exhibitName,
            record.desc,
            record.timestamp,
            record.ipfsHash,
            record.addedBy
        );
    }

    function getAllReports()
        external
        view
        onlyRole(Role.Admin)
        returns (CrimeDetails[] memory)
    {
        return forensicRecords;
    }

    // ------------------------
    // 🔗 SHARED ACCESS CONTROL
    // ------------------------
    function grantAccess(uint256 caseId, address agency)
        external
        onlyRole(Role.Admin)
    {
        sharedAccess[caseId][agency] = true;
        emit AccessGranted(caseId, agency, msg.sender);
    }

    function revokeAccess(uint256 caseId, address agency)
        external
        onlyRole(Role.Admin)
    {
        sharedAccess[caseId][agency] = false;
        emit AccessRevoked(caseId, agency, msg.sender);
    }

    function hasAccess(uint256 caseId, address agency)
        external
        view
        returns (bool)
    {
        return sharedAccess[caseId][agency];
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
