"use client"

import { useState, useMemo, Suspense } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react"
import { client } from "./client"
import { sepolia } from "thirdweb/chains"
import { getContract } from "thirdweb"
import ParticleLeaf from "@/components/ParticleLeaf"
import FloatingParticles from "@/components/FloatingParticles"

const CONTRACT_ADDRESS = "0xae39f8734faee1f4514c1a5203d0a0eaef1dd069"
const POLICIES_PER_PAGE = 5

const contract = getContract({
  client,
  chain: sepolia,
  address: CONTRACT_ADDRESS,
})

// Component to display a single policy with real data
function PolicyCard({ policyId, index, account }: { policyId: number; index: number; account: any }) {
  const { data: policyData, isLoading } = useReadContract({
    contract,
    method: "function getPolicy(uint256) view returns (address holder, uint256 premium, uint256 coverageAmount, bool isActive, uint256 createdAt)",
    params: [BigInt(policyId)],
  })

  // Format helpers
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const formatEth = (wei: bigint) => {
    return (Number(wei) / 1e18).toFixed(4)
  }

  if (isLoading) {
    return (
      <div className="bg-card/50 p-6 rounded-2xl border border-border/50 animate-pulse h-48">
        <div className="h-4 bg-muted/50 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
      </div>
    )
  }

  if (!policyData) return null

  // Mapping API data to UI structure
  const policy = {
    id: policyId,
    holder: policyData[0],
    premium: formatEth(policyData[1]),
    coverage: formatEth(policyData[2]),
    active: policyData[3],
    date: formatDate(policyData[4])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative overflow-hidden"
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative bg-gradient-to-br from-card via-card to-card/80 p-6 rounded-2xl border border-border/50 backdrop-blur-xl m-[1px]">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-primary/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                Policy #{policy.id}
              </motion.span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${policy.active
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-destructive/15 text-destructive border border-destructive/30'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${policy.active ? 'bg-primary' : 'bg-destructive'}`} />
                {policy.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">
              {policy.date}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Farmer Address</p>
              <p className="text-sm font-mono text-foreground/90 bg-secondary/30 px-3 py-2 rounded-lg truncate">
                {policy.holder}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Premium Paid</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {policy.premium}
                </p>
                <span className="text-sm text-muted-foreground">ETH</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Coverage Amount</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-foreground">
                  {policy.coverage}
                </p>
                <span className="text-sm text-muted-foreground">ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, index }: { icon: string; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-3xl blur opacity-0 group-hover:opacity-75 transition-all duration-500" />

      <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-card via-card to-secondary/20 border border-border/50 backdrop-blur-xl overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

        <div className="relative z-10">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-5xl mb-6 inline-block"
          >
            {icon}
          </motion.div>
          <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="text-center group"
    >
      <motion.p
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]"
        animate={{ backgroundPosition: ["0% center", "200% center"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{label}</p>
    </motion.div>
  );
}

export default function Home() {
  const account = useActiveAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -100]);

  // Read total policies
  const { data: totalPolicies, isLoading: loadingTotal } = useReadContract({
    contract,
    method: "function getTotalPolicies() view returns (uint256)",
    params: [],
  })

  // Calculate policy IDs
  const policyIds = useMemo(() => {
    if (!totalPolicies) return []
    const total = Number(totalPolicies)
    const allIds = Array.from({ length: total }, (_, i) => total - i)
    return allIds
  }, [totalPolicies])

  const totalPages = Math.ceil(policyIds.length / POLICIES_PER_PAGE);
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE;
  const endIndex = startIndex + POLICIES_PER_PAGE;
  // Use real policy IDs instead of mock policies
  const currentPolicyIds = policyIds.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <FloatingParticles />

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-primary/15 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[150px]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-8 z-10 order-2 lg:order-1"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-8 backdrop-blur-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm text-primary font-semibold tracking-wide">Blockchain-Powered Protection</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1]"
                >
                  <span className="text-foreground">Protecting</span>
                  <br />
                  <motion.span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] inline-block"
                    animate={{ backgroundPosition: ["0% center", "200% center"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    Farmers
                  </motion.span>
                  <br />
                  <span className="text-foreground">Worldwide</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl"
                >
                  Affordable microinsurance for small-scale farmers. Secure your harvest against
                  climate risks with transparent, instant payouts powered by blockchain technology.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4 items-center"
              >
                {/* Thirdweb Connect Button - Functionality Preserved */}
                <div className="relative">
                  <ConnectButton
                    client={client}
                    appMetadata={{
                      name: "FarmShield",
                      url: "https://example.com",
                    }}
                    connectButton={{
                      label: "Connect Wallet",
                      className: "!bg-gradient-to-r !from-primary !to-accent !text-primary-foreground !font-semibold !px-8 !py-4 !rounded-full !h-auto !text-lg !border-none !shadow-2xl !shadow-primary/30 hover:!scale-105 transition-transform"
                    }}
                  />
                </div>

                <Link href="/register" passHref>
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary))" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-full border-2 border-primary/50 text-primary font-semibold text-lg hover:bg-primary/10 transition-all duration-300"
                  >
                    Register
                  </motion.button>
                </Link>

                <Link href="/login" passHref>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-full border-2 border-border text-foreground font-semibold text-lg hover:bg-secondary transition-all duration-300"
                  >
                    Login
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-8 sm:gap-12 pt-8 border-t border-border/50"
              >
                <StatCard value="Secure" label="Blockchain Protection" delay={1} />
                <StatCard value="Instant" label="Automated Claims" delay={1.1} />
                <StatCard value="Global" label="Accessible Coverage" delay={1.2} />
              </motion.div>
            </motion.div>

            {/* Right - 3D Leaf - Seamlessly blended */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="relative h-[500px] sm:h-[600px] lg:h-[700px] order-1 lg:order-2 -mr-8 lg:-mr-20"
            >
              {/* Soft ambient glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.2, 0.35, 0.2]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[500px] h-[600px] bg-gradient-radial from-primary/25 via-primary/5 to-transparent rounded-full blur-[100px]"
                />
              </div>

              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-primary/50 border-t-transparent rounded-full"
                  />
                </div>
              }>
                <ParticleLeaf />
              </Suspense>

              {/* Floating info cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
                transition={{
                  opacity: { delay: 1.5 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-16 right-4 lg:right-0 px-5 py-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10"
              >
                <p className="text-xs text-muted-foreground mb-1">Platform Status</p>
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Completed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0, y: [0, 15, 0] }}
                transition={{
                  opacity: { delay: 1.7 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
                className="absolute bottom-24 left-4 lg:left-0 px-5 py-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10"
              >
                <p className="text-xs text-muted-foreground mb-1">System</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground">Contracts</p>
                  <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">Ready</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            <span className="text-sm font-medium">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6"
            >
              Why Choose Us
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">FarmShield</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering farmers with accessible, transparent, and instant insurance coverage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              index={0}
              icon="🌱"
              title="Affordable Premiums"
              description="Micro-payments starting from as low as 0.01 ETH. Insurance that fits every farmer's budget."
            />
            <FeatureCard
              index={1}
              icon="⚡"
              title="Instant Payouts"
              description="Smart contracts automatically trigger payments when weather conditions are verified."
            />
            <FeatureCard
              index={2}
              icon="🔒"
              title="Fully Transparent"
              description="Every transaction is recorded on the blockchain. No hidden fees, no fine print."
            />
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="relative py-32 px-4">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full mb-6"
            >
              Live on Blockchain
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Policies</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              View all insurance policies secured on the blockchain. Full transparency for every farmer.
            </p>
          </motion.div>

          {loadingTotal ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mb-4"></div>
              <p className="text-muted-foreground">Syncing with blockchain...</p>
            </div>
          ) : policyIds.length === 0 ? (
            <div className="text-center py-16 bg-card/50 rounded-3xl border border-border">
              <p className="text-muted-foreground text-lg">No policies active yet. Join us and be the first!</p>
            </div>
          ) : (
            <div className="space-y-6 mb-12">
              {currentPolicyIds.map((policyId, index) => (
                <PolicyCard key={policyId} policyId={policyId} index={index} account={account} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 border border-border transition-all font-medium"
              >
                Previous
              </motion.button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 rounded-xl font-semibold transition-all ${currentPage === page
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                      }`}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 border border-border transition-all font-medium"
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/30 py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-2xl">🌿</span>
              </div>
              <span className="text-2xl font-display font-bold">FarmShield</span>
            </motion.div>

            <p className="text-muted-foreground text-center">
              © 2025 FarmShield. Protecting farmers with blockchain technology.
            </p>

            <div className="flex gap-6">
              {["Twitter", "Discord", "GitHub"].map((social, i) => (
                <motion.a
                  key={social}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -3, color: "hsl(var(--primary))" }}
                  href="#"
                  className="text-muted-foreground transition-colors font-medium"
                >
                  {social}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}