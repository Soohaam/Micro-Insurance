"use client";

import { useState, useMemo } from "react";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { getContract, prepareContractCall } from "thirdweb";
import { toWei } from "thirdweb/utils";
import { useRouter } from "next/navigation";                     // <-- ADDED
import { Button } from "@/components/ui/button";                  // <-- SHADCN
import { ArrowLeft } from "lucide-react";                         // <-- ICON

// Replace with your deployed contract address after deployment
const CONTRACT_ADDRESS = "0xae39f8734faee1f4514c1a5203d0a0eaef1dd069";

const POLICIES_PER_PAGE = 5;

const contract = getContract({
  client,
  chain: sepolia,
  address: CONTRACT_ADDRESS,
});

// Component to display a single policy
function PolicyCard({ policyId, account }: { policyId: number; account: any }) {
  const { data: policyData, isLoading } = useReadContract({
    contract,
    method: "function getPolicy(uint256) view returns (address holder, uint256 premium, uint256 coverageAmount, bool isActive, uint256 createdAt)",
    params: [BigInt(policyId)],
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  if (!policyData) return null;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatEth = (wei: bigint) => {
    return (Number(wei) / 1e18).toFixed(4);
  };

  const isUserPolicy = account && policyData[0].toLowerCase() === account.address.toLowerCase();

  return (
    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Policy #{policyId}
          </span>
          <span className={`ml-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${policyData[3]
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {policyData[3] ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(policyData[4])}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Policy Holder</p>
          <p className="text-sm font-mono text-gray-800 break-all">
            {policyData[0].slice(0, 6)}...{policyData[0].slice(-4)}
          </p>
          {isUserPolicy && (
            <span className="text-xs text-green-600 font-semibold">Your Policy</span>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Premium Paid</p>
          <p className="text-lg font-bold text-indigo-600">
            {formatEth(policyData[1])} ETH
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Coverage Amount</p>
          <p className="text-lg font-bold text-purple-600">
            {formatEth(policyData[2])} ETH
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TestContract() {
  const router = useRouter();                                    // <-- ADDED
  const account = useActiveAccount();
  const [premium, setPremium] = useState("0.001");
  const [coverage, setCoverage] = useState("1");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Read total policies
  const { data: totalPolicies, isLoading: loadingTotal, refetch: refetchTotal } = useReadContract({
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

  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const policyIds = useMemo(() => {
    if (!totalPolicies) return [];
    const total = Number(totalPolicies);
    const allIds = Array.from({ length: total }, (_, i) => total - i);
    return allIds;
  }, [totalPolicies]);

  const totalPages = Math.ceil(policyIds.length / POLICIES_PER_PAGE);
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE;
  const endIndex = startIndex + POLICIES_PER_PAGE;
  const currentPolicyIds = policyIds.slice(startIndex, endIndex);

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
          setTimeout(() => {
            refetchTotal();
          }, 3000);
        },
        onError: (error) => {
          setStatus(`Error: ${error.message}`);
        },
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* 🔙 SHADCN BACK BUTTON WITH ARROW */}
        <Button
          onClick={() => router.back()}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>


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
              <a
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
              >
                View on Etherscan →
              </a>
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

        {/* All Policies */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Step 4: All Policy Transactions</h2>

          {loadingTotal ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading policies...</p>
            </div>
          ) : policyIds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No policies created yet. Create your first policy above!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentPolicyIds.map((policyId) => (
                  <PolicyCard key={policyId} policyId={policyId} account={account} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg transition ${currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {startIndex + 1} - {Math.min(endIndex, policyIds.length)} of {policyIds.length} policies
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Make sure you have Sepolia test ETH in your MetaMask</li>
            <li>Connect your wallet using the button above</li>
            <li>Create a policy with a small premium (e.g., 0.001 ETH)</li>
            <li>Wait for the transaction to confirm (check MetaMask)</li>
            <li>View all policy transactions below (automatically updates)</li>
            <li>Check Sepolia Etherscan to see your transaction on the blockchain</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
