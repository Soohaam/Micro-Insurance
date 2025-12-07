"use client"

import { useState, useMemo } from "react"
import thirdwebIcon from "@public/thirdweb.svg"
import Image from "next/image"
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react"
import { client } from "./client"
import { sepolia } from "thirdweb/chains"
import { getContract } from "thirdweb"

const CONTRACT_ADDRESS = "0xae39f8734faee1f4514c1a5203d0a0eaef1dd069"
const POLICIES_PER_PAGE = 5

const contract = getContract({
  client,
  chain: sepolia,
  address: CONTRACT_ADDRESS,
})

// Component to display a single policy
function PolicyCard({ policyId, account }: { policyId: number; account: any }) {
  const { data: policyData, isLoading } = useReadContract({
    contract,
    method: "function getPolicy(uint256) view returns (address holder, uint256 premium, uint256 coverageAmount, bool isActive, uint256 createdAt)",
    params: [BigInt(policyId)],
  })

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 p-5 rounded-lg border border-slate-700/50 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      </div>
    )
  }

  if (!policyData) return null

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  const formatEth = (wei: bigint) => {
    return (Number(wei) / 1e18).toFixed(4)
  }

  const isUserPolicy = account && policyData[0].toLowerCase() === account.address.toLowerCase()

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-5 rounded-lg border border-slate-700/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="inline-block bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
            Policy #{policyId}
          </span>
          <span className={`ml-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${policyData[3]
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
            {policyData[3] ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {formatDate(policyData[4])}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Policy Holder</p>
          <p className="text-sm font-mono text-slate-200 break-all">
            {policyData[0].slice(0, 6)}...{policyData[0].slice(-4)}
          </p>
          {isUserPolicy && (
            <span className="text-xs text-emerald-400 font-semibold">Your Policy</span>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-1">Premium Paid</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatEth(policyData[1])} ETH
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-1">Coverage Amount</p>
          <p className="text-lg font-bold text-blue-400">
            {formatEth(policyData[2])} ETH
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const account = useActiveAccount()
  const [currentPage, setCurrentPage] = useState(1)

  // Read total policies
  const { data: totalPolicies, isLoading: loadingTotal } = useReadContract({
    contract,
    method: "function getTotalPolicies() view returns (uint256)",
    params: [],
  })

  const policyIds = useMemo(() => {
    if (!totalPolicies) return []
    const total = Number(totalPolicies)
    const allIds = Array.from({ length: total }, (_, i) => total - i)
    return allIds
  }, [totalPolicies])

  const totalPages = Math.ceil(policyIds.length / POLICIES_PER_PAGE)
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE
  const endIndex = startIndex + POLICIES_PER_PAGE
  const currentPolicyIds = policyIds.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-400" />
            <span className="text-xl font-bold">Thirdweb</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-slate-300 hover:text-slate-100 transition-colors">
              Home
            </a>
            <a href="/test-blockchain" className="text-slate-300 hover:text-slate-100 transition-colors">
              Blockchain Test
            </a>
          </nav>
          <div className="hidden md:block">
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example App",
                url: "https://example.com",
              }}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-screen-xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8 mb-28">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight text-balance">
                Build web3 experiences
                <span className="block text-emerald-400 mt-2">with ease</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed text-balance">
                The complete SDK for building web3 applications. Connect wallets, interact with smart contracts, and
                create seamless experiences for your users.
              </p>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <ConnectButton
                  client={client}
                  appMetadata={{
                    name: "Example App",
                    url: "https://example.com",
                  }}
                />
              </div>
              <a
                href="/register"
                className="px-8 py-3 rounded-full border-2 border-emerald-500 text-emerald-400 font-medium hover:bg-emerald-500/10 transition-colors text-center"
              >
                Register
              </a>
              <a
                href="/login"
                className="px-8 py-3 rounded-full border-2 border-slate-700 text-slate-100 font-medium hover:bg-slate-800/50 transition-colors text-center"
              >
                Login
              </a>
            </div>


          </div>

          {/* Right Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-slate-700/50 p-8 backdrop-blur-sm">
                <Image
                  src={thirdwebIcon || "/placeholder.svg"}
                  alt="Thirdweb"
                  className="w-32 h-32 mx-auto mb-6"
                  style={{
                    filter: "drop-shadow(0px 0px 24px #34d39966)",
                  }}
                />
                <h3 className="text-center text-lg font-semibold mb-2">Thirdweb SDK</h3>
                <p className="text-center text-sm text-slate-400">Production-ready web3 toolkit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="container max-w-screen-xl mx-auto px-4 py-20 border-t border-slate-800/30">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Active Policies</h2>
          <p className="text-slate-300 text-lg">
            View all insurance policies on the blockchain
          </p>
        </div>

        {loadingTotal ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Loading policies...</p>
          </div>
        ) : policyIds.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-slate-400">No policies created yet. Be the first to create one!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {currentPolicyIds.map((policyId) => (
                <PolicyCard key={policyId} policyId={policyId} account={account} />
              ))}
            </div>

            {totalPages > 1 && (
              <>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 border border-slate-700/50 transition"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg transition ${currentPage === page
                          ? 'bg-emerald-500 text-slate-900 font-semibold'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 border border-slate-700/50 transition"
                  >
                    Next
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-slate-400">
                  Showing {startIndex + 1} - {Math.min(endIndex, policyIds.length)} of {policyIds.length} policies
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/30 py-12 mt-20">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400">© 2025 Thirdweb. Built with Next.js and Tailwind CSS.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                GitHub
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ArticleCard(props: {
  title: string
  href: string
  description: string
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      className="group flex flex-col p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all duration-300"
      rel="noreferrer"
    >
      <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{props.title}</h3>
      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{props.description}</p>
      <div className="mt-4 flex items-center gap-2 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium">Learn more</span>
        <span>→</span>
      </div>
    </a>
  )
}