"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { getContract, prepareContractCall } from "thirdweb";
import { toWei } from "thirdweb/utils";

// Replace with your deployed contract address after deployment
const CONTRACT_ADDRESS = "0xae39f8734faee1f4514c1a5203d0a0eaef1dd069";

const contract = getContract({
  client,
  chain: sepolia,
  address: CONTRACT_ADDRESS,
});

export default function TestContract() {
  const account = useActiveAccount();
  const [premium, setPremium] = useState("0.001");
  const [coverage, setCoverage] = useState("1");
  const [policyId, setPolicyId] = useState("1");
  const [status, setStatus] = useState("");

  // Read total policies
  const { data: totalPolicies, isLoading: loadingTotal } = useReadContract({
    contract,
    method: "function getTotalPolicies() view returns (uint256)",
    params: [],
  });

  // Read contract balance
  const { data: contractBalance, isLoading: loadingBalance } = useReadContract({
    contract,
    method: "function getContractBalance() view returns (uint256)",
    params: [],
  });

  // Read specific policy
  const { data: policyData, isLoading: loadingPolicy } = useReadContract({
    contract,
    method: "function getPolicy(uint256) view returns (address holder, uint256 premium, uint256 coverageAmount, bool isActive, uint256 createdAt)",
    params: [BigInt(policyId)],
  });

  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const createPolicy = async () => {
    if (!account) {
      setStatus("Please connect your wallet first");
      return;
    }

    try {
      setStatus("Creating policy...");
      
      const transaction = prepareContractCall({
        contract,
        method: "function createPolicy(uint256 _coverageAmount) payable",
        params: [toWei(coverage)],
        value: toWei(premium),
      });

      sendTransaction(transaction, {
        onSuccess: (result) => {
          setStatus(`Policy created! Transaction: ${result.transactionHash}`);
        },
        onError: (error) => {
          setStatus(`Error: ${error.message}`);
        },
      });
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Micro Insurance Contract Test
        </h1>

        {/* Connect Wallet */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Step 1: Connect Wallet</h2>
          <ConnectButton client={client} chain={sepolia} />
          {account && (
            <p className="mt-4 text-sm text-green-600">
              ✓ Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          )}
        </div>

        {/* Contract Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Step 2: Contract Information</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Contract Address:</p>
              <p className="font-mono text-xs break-all">{CONTRACT_ADDRESS}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Policies:</p>
              <p className="text-xl font-bold text-indigo-600">
                {loadingTotal ? "Loading..." : totalPolicies?.toString() || "0"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Contract Balance:</p>
              <p className="text-xl font-bold text-indigo-600">
                {loadingBalance ? "Loading..." : `${contractBalance ? (Number(contractBalance) / 1e18).toFixed(4) : "0"} ETH`}
              </p>
            </div>
          </div>
        </div>

        {/* Create Policy */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Step 3: Create Policy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                placeholder="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Amount (ETH)
              </label>
              <input
                type="number"
                step="0.1"
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                placeholder="1.0"
              />
            </div>
            <button
              onClick={createPolicy}
              disabled={!account || isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isPending ? "Creating..." : "Create Policy"}
            </button>
            {status && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 break-all">{status}</p>
              </div>
            )}
          </div>
        </div>

        {/* View Policy */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Step 4: View Policy Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy ID
              </label>
              <input
                type="number"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                placeholder="1"
              />
            </div>
            {policyData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm"><span className="font-semibold">Holder:</span> {policyData[0]}</p>
                <p className="text-sm"><span className="font-semibold">Premium:</span> {(Number(policyData[1]) / 1e18).toFixed(4)} ETH</p>
                <p className="text-sm"><span className="font-semibold">Coverage:</span> {(Number(policyData[2]) / 1e18).toFixed(4)} ETH</p>
                <p className="text-sm"><span className="font-semibold">Active:</span> {policyData[3] ? "Yes" : "No"}</p>
                <p className="text-sm"><span className="font-semibold">Created:</span> {new Date(Number(policyData[4]) * 1000).toLocaleString()}</p>
              </div>
            )}
            {loadingPolicy && <p className="text-gray-600">Loading policy data...</p>}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Make sure you have Sepolia test ETH in your MetaMask</li>
            <li>Connect your wallet using the button above</li>
            <li>Create a policy with a small premium (e.g., 0.001 ETH)</li>
            <li>Wait for the transaction to confirm (check MetaMask)</li>
            <li>View your policy details using the policy ID (starts at 1)</li>
            <li>Check Sepolia Etherscan to see your transaction on the blockchain</li>
          </ol>
        </div>
      </div>
    </div>
  );
}