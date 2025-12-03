"use client"

import thirdwebIcon from "@public/thirdweb.svg"
import Image from "next/image"
import { ConnectButton } from "thirdweb/react"
import { client } from "./client"

export default function Home() {
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
            <a href="#" className="text-slate-300 hover:text-slate-100 transition-colors">
              Home
            </a>
            <a href="#" className="text-slate-300 hover:text-slate-100 transition-colors">
              About
            </a>
            <a href="#" className="text-slate-300 hover:text-slate-100 transition-colors">
              Docs
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
          <div className="flex flex-col gap-8">
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
                href="#resources"
                className="px-8 py-3 rounded-full border-2 border-slate-700 text-slate-100 font-medium hover:bg-slate-800/50 transition-colors text-center"
              >
                Explore Resources
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/50">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400">100K+</p>
                <p className="text-sm text-slate-400">Developers</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400">50+</p>
                <p className="text-sm text-slate-400">Chains</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-emerald-400">$10M+</p>
                <p className="text-sm text-slate-400">In volume</p>
              </div>
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

      {/* Resources Section */}
      <section id="resources" className="container max-w-screen-xl mx-auto px-4 py-20 border-t border-slate-800/30">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started</h2>
        <p className="text-slate-300 mb-12 text-lg">
          Read the README.md file and explore our comprehensive documentation.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <ArticleCard
            title="thirdweb SDK Docs"
            href="https://portal.thirdweb.com/typescript/v5"
            description="Complete TypeScript SDK documentation with examples and best practices"
          />
          <ArticleCard
            title="React Components"
            href="https://portal.thirdweb.com/typescript/v5/react"
            description="Pre-built React components and hooks for common web3 interactions"
          />
          <ArticleCard
            title="Dashboard"
            href="https://thirdweb.com/dashboard"
            description="Deploy and manage your smart contracts from the dashboard"
          />
        </div>
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
