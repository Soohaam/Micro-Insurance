"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, ArrowRight, FileText, Wallet, TrendingUp, LogOut, Copy, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"

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

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [policies, setPolicies] = useState<Policy[]>([])
    const [loadingPolicies, setLoadingPolicies] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                router.push("/login")
                return
            }

            try {
                const response = await api.get("/auth/profile")
                setUser(response.data)
            } catch (error) {
                console.error("Failed to fetch profile:", error)
                localStorage.removeItem("token")
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    useEffect(() => {
        const fetchPolicies = async () => {
            const token = localStorage.getItem("token")
            if (!token) return

            try {
                setLoadingPolicies(true)
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/policies`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setPolicies(response.data.policies || [])
            } catch (error) {
                console.error("Error fetching policies:", error)
            } finally {
                setLoadingPolicies(false)
            }
        }

        if (user) {
            fetchPolicies()
        }
    }, [user])

    const formatEth = (value: number) => {
        return value.toFixed(4)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Wallet address copied!")
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
            case "expired":
                return "bg-slate-500/20 text-slate-400 border-slate-500/50"
            case "claimed":
                return "bg-blue-500/20 text-blue-400 border-blue-500/50"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/50"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const activePolicies = policies.filter((p) => p.status === "active").length
    const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0)

    const stats = [
        {
            label: "Total Policies",
            value: policies.length,
            icon: FileText,
            color: "bg-blue-500/20 text-blue-400",
            delay: 0.1,
        },
        { label: "Active Policies", value: activePolicies, icon: Shield, color: "bg-primary/20 text-primary", delay: 0.2 },
        {
            label: "Total Coverage",
            value: `${formatEth(totalCoverage)} ETH`,
            icon: TrendingUp,
            color: "bg-purple-500/20 text-purple-400",
            delay: 0.3,
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[180px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px]" />
            </div>

            <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80 relative z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-primary-foreground font-bold text-lg">U</span>
                        </div>
                        <span className="text-xl font-display font-bold text-foreground">User Dashboard</span>
                    </div>

                    <Button
                        onClick={() => {
                            localStorage.removeItem("token")
                            localStorage.removeItem("role")
                            router.push("/login")
                        }}
                        variant="outline"
                        className="border-border/50 hover:bg-secondary/50 gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Welcome Section */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-2 text-foreground">
                        Welcome,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {user.fullName}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg">Manage your insurance portfolio on the blockchain</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stat.delay }}
                        >
                            <Card className="bg-card/40 border-border/50 backdrop-blur-xl group hover:bg-card/60 transition-all">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                            <p className="text-3xl font-bold font-display text-foreground">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Profile & Wallet Details Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-10"
                >
                    <h2 className="text-2xl font-display font-bold mb-6">Account Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Details Card */}
                        <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="font-display">Profile Information</CardTitle>
                                <CardDescription>Your account details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                                    <p className="text-foreground font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                                    <p className="text-foreground font-medium">{user.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                                    <p className="text-foreground font-medium capitalize">{user.role}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">KYC Status</p>
                                    <Badge
                                        className={`${user.kycStatus === "verified"
                                                ? "bg-primary/20 text-primary border-primary/20"
                                                : user.kycStatus === "rejected"
                                                    ? "bg-destructive/20 text-destructive border-destructive/20"
                                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                                            }`}
                                    >
                                        {user.kycStatus?.toUpperCase() || "PENDING"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Wallet Address Card */}
                        <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="font-display flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-primary" />
                                    Wallet Address
                                </CardTitle>
                                <CardDescription>Your connected blockchain wallet</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.walletAddress ? (
                                    <div className="space-y-3">
                                        <div className="bg-secondary/30 border border-border/50 p-4 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-2 font-semibold">Address</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="text-xs sm:text-sm font-mono text-primary/80 break-all flex-1">
                                                    {user.walletAddress}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(user.walletAddress)}
                                                    className="hover:bg-secondary"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                            <span>Your wallet is verified and connected to your account</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground mb-3">No wallet connected yet</p>
                                        <Button onClick={() => router.push("/connect-wallet")} className="bg-primary hover:bg-primary/90">
                                            Connect Wallet
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* KYC Warning */}
                {user.kycStatus !== "verified" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-10 backdrop-blur-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-2xl mt-1">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-semibold font-display text-yellow-400 mb-2">KYC Verification Required</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    {user.kycStatus === "pending"
                                        ? "Your KYC is under review. Please wait for admin approval."
                                        : "Complete KYC verification to purchase insurance policies."}
                                </p>
                                {user.kycStatus !== "pending" && (
                                    <Button
                                        onClick={() => router.push("/kyc")}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                                    >
                                        Complete KYC
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-10"
                >
                    <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Button
                            onClick={() => router.push("/products")}
                            className="h-auto py-8 bg-gradient-to-br from-primary/80 to-accent/80 hover:from-primary hover:to-accent border-0 rounded-2xl group relative overflow-hidden"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-white">Browse Products</span>
                            </div>
                        </Button>

                        <Button
                            onClick={() => router.push("/dashboard/user/policies")}
                            variant="outline"
                            className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-primary/30 rounded-2xl text-foreground group"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-6 w-6 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-lg font-semibold">My Policies</span>
                            </div>
                        </Button>

                        <Button
                            onClick={() => router.push("/kyc")}
                            variant="outline"
                            className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-primary/30 rounded-2xl text-foreground group"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                    <Shield className="h-6 w-6 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-lg font-semibold">KYC Status</span>
                            </div>
                        </Button>
                    </div>
                </motion.div>

                {/* Recent Policies */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-display font-bold">Recent Policies</h2>
                            <p className="text-muted-foreground">Your active insurance coverage</p>
                        </div>
                        {policies.length > 0 && (
                            <Button
                                onClick={() => router.push("/dashboard/user/policies")}
                                variant="ghost"
                                className="hover:bg-secondary/50"
                            >
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {loadingPolicies ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : policies.length === 0 ? (
                        <Card className="bg-card/40 border-border/50 backdrop-blur-xl text-center py-16">
                            <CardContent>
                                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold font-display mb-2">No policies yet</h3>
                                <p className="text-muted-foreground mb-6">Start protecting your farm today</p>
                                <Button onClick={() => router.push("/products")} className="bg-primary hover:bg-primary/90">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Browse Products
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {policies.slice(0, 3).map((policy, i) => (
                                <motion.div
                                    key={policy._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + i * 0.1 }}
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
                                                        Coverage
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
                                        </CardContent>

                                        <CardFooter>
                                            <Button asChild className="w-full bg-primary hover:bg-primary/90">
                                                <Link href={`/dashboard/user/policies/${policy._id}`}>
                                                    View Details
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
