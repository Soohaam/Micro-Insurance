"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, Calendar, ArrowRight, FileText, Wallet, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import Link from "next/link"

interface Policy {
  _id: string
  policyNumber: string
  product: {
    productName: string
    coverageType: string
  }
  company: {
    name: string
  }
  sumInsured: number
  premiumPaid: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "claimed"
  daysRemaining: number
}

export default function MyPolicies() {
  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchPolicies()
  }, [token])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPolicies(response.data.policies || [])
    } catch (error) {
      console.error("Error fetching policies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPolicies = policies.filter((p) => {
    if (filter === "all") return true
    return p.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary border-primary/20"
      case "expired":
        return "bg-slate-500/20 text-slate-400 border-slate-500/20"
      case "claimed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/20"
    }
  }

  const formatEth = (value: number) => {
    return value.toFixed(4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalPolicies = policies.length
  const activePolicies = policies.filter((p) => p.status === "active").length
  const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[180px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-2">
                My Policies
              </h1>
              <p className="text-muted-foreground text-lg">Manage your insurance portfolio on the blockchain</p>
            </div>
            <Button
              onClick={() => router.push("/products")}
              className="bg-primary hover:bg-primary/90 px-6 h-auto py-3"
            >
              <Shield className="mr-2 h-5 w-5" />
              Browse New Products
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Policies</p>
                      <p className="text-3xl font-bold font-display">{totalPolicies}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active Policies</p>
                      <p className="text-3xl font-bold font-display text-primary">{activePolicies}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Coverage</p>
                      <p className="text-3xl font-bold font-display text-purple-400">{formatEth(totalCoverage)} ETH</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {["all", "active", "expired", "claimed"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={
                filter === status
                  ? "bg-primary hover:bg-primary/90"
                  : "border-border/50 text-muted-foreground hover:bg-secondary/50"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {policies.filter((p) => status === "all" || p.status === status).length})
            </Button>
          ))}
        </motion.div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl text-center py-16">
              <CardContent>
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-semibold font-display mb-2">No policies found</h3>
                <p className="text-muted-foreground mb-6">
                  {filter === "all"
                    ? "You haven't purchased any insurance policies yet."
                    : `You don't have any ${filter} policies.`}
                </p>
                <Button onClick={() => router.push("/products")} className="bg-primary hover:bg-primary/90">
                  <Shield className="mr-2 h-5 w-5" />
                  Find Insurance
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolicies.map((policy, index) => (
              <motion.div
                key={policy._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex flex-col bg-card/40 border-border/50 backdrop-blur-xl group hover:bg-card/60 hover:border-primary/30 transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <Badge
                        variant="outline"
                        className={`capitalize font-semibold border-border/50 ${getStatusColor(policy.status)}`}
                      >
                        {policy.status}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                        #{policy.policyNumber}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                      {policy.product.productName}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground flex items-center gap-2 mt-2">
                      <Shield className="h-4 w-4" />
                      {policy.company.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          Sum Insured
                        </p>
                        <p className="font-bold text-lg text-primary">{formatEth(policy.sumInsured)} ETH</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Premium
                        </p>
                        <p className="font-bold text-lg text-blue-400">{formatEth(policy.premiumPaid)} ETH</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-secondary/30 to-secondary/20 p-4 rounded-lg border border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {new Date(policy.endDate).toLocaleDateString()}</span>
                      </div>
                      {policy.status === "active" && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-secondary/50 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                              style={{ width: `${Math.min((policy.daysRemaining / 365) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-primary font-semibold whitespace-nowrap text-sm">
                            {policy.daysRemaining}d
                          </span>
                        </div>
                      )}
                    </div>

                    <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground border-border/50">
                      {policy.product.coverageType}
                    </Badge>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href={`/dashboard/user/policies/${policy._id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
