// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicalRecord {

    struct Record {
        string recordHash;
        string category;
        uint256 timestamp;
        address owner;
    }

    Record[] public records;

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

        records.push(
            Record({
                recordHash: recordHash,
                category: category,
                timestamp: block.timestamp,
                owner: msg.sender
            })
        );

        emit RecordAdded(
            records.length - 1,
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

    function totalRecords()
        public
        view
        returns (uint256)
    {
        return records.length;
    }
}