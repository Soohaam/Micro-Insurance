// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleMicroInsurance {
    struct Policy {
        address holder;
        uint256 premium;
        uint256 coverageAmount;
        bool isActive;
        uint256 createdAt;
    }
    
    mapping(uint256 => Policy) public policies;
    uint256 public policyCount;
    
    event PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 premium, uint256 coverageAmount);
    event PolicyClaimed(uint256 indexed policyId, address indexed holder, uint256 amount);
    
    // Create a new policy
    function createPolicy(uint256 _coverageAmount) external payable {
        require(msg.value > 0, "Premium must be greater than 0");
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        
        policyCount++;
        
        policies[policyCount] = Policy({
            holder: msg.sender,
            premium: msg.value,
            coverageAmount: _coverageAmount,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit PolicyCreated(policyCount, msg.sender, msg.value, _coverageAmount);
    }
    
    // Get policy details
    function getPolicy(uint256 _policyId) external view returns (
        address holder,
        uint256 premium,
        uint256 coverageAmount,
        bool isActive,
        uint256 createdAt
    ) {
        Policy memory policy = policies[_policyId];
        return (
            policy.holder,
            policy.premium,
            policy.coverageAmount,
            policy.isActive,
            policy.createdAt
        );
    }
    
    // Get total policies count
    function getTotalPolicies() external view returns (uint256) {
        return policyCount;
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}