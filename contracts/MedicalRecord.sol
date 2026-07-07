// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicalRecordV2 {

    struct Record {
        string recordHash;
        string category;
        uint256 timestamp;
        address owner;
    }

    Record[] public records;

    // Fast lookup for verification
    mapping(string => bool) private verifiedHashes;

    // Get record ID from hash
    mapping(string => uint256) private hashToRecordId;

    event RecordAdded(
        uint256 indexed id,
        string recordHash,
        string category,
        address indexed owner,
        uint256 timestamp
    );

    function addRecord(
        string memory recordHash,
        string memory category
    ) public {

        require(
            !verifiedHashes[recordHash],
            "Record already exists"
        );

        records.push(
            Record({
                recordHash: recordHash,
                category: category,
                timestamp: block.timestamp,
                owner: msg.sender
            })
        );

        uint256 recordId = records.length - 1;

        verifiedHashes[recordHash] = true;
        hashToRecordId[recordHash] = recordId;

        emit RecordAdded(
            recordId,
            recordHash,
            category,
            msg.sender,
            block.timestamp
        );
    }

    function getRecord(
        uint256 id
    )
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            address
        )
    {
        Record memory r = records[id];

        return (
            r.recordHash,
            r.category,
            r.timestamp,
            r.owner
        );
    }

    // Verify if a record exists
    function verifyRecord(
        string memory recordHash
    )
        public
        view
        returns (bool)
    {
        return verifiedHashes[recordHash];
    }

    // Get record ID from hash
    function getRecordId(
        string memory recordHash
    )
        public
        view
        returns (uint256)
    {
        require(
            verifiedHashes[recordHash],
            "Record not found"
        );

        return hashToRecordId[recordHash];
    }

    function totalRecords()
        public
        view
        returns (uint256)
    {
        return records.length;
    }
}