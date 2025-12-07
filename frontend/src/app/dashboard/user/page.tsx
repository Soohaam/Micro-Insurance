"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Calendar, ArrowRight, FileText, Wallet, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Policy {
    _id: string;
    policyNumber: string;
    product: {
        productName: string;
        coverageType: string;
    };
    company: {
        name: string;
    };
    sumInsured: number;
    premiumPaid: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'claimed';
    daysRemaining: number;
}

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            // Check if token exists first
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                // Use correct endpoint: /auth/profile instead of /auth/me
                const response = await api.get("/auth/profile");
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                localStorage.removeItem("token");
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    useEffect(() => {
        const fetchPolicies = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                setLoadingPolicies(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/policies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolicies(response.data.policies || []);
            } catch (error) {
                console.error('Error fetching policies:', error);
            } finally {
                setLoadingPolicies(false);
            }
        };

        if (user) {
            fetchPolicies();
        }
    }, [user]);

    const formatEth = (value: number) => {
        return value.toFixed(4);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case 'expired': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
            case 'claimed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    const activePolicies = policies.filter(p => p.status === 'active').length;
    const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user.fullName}</h1>
                        <p className="text-slate-400 text-lg">Manage your insurance portfolio</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            router.push("/login");
                        }}
                        className="px-6 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 font-medium"
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Total Policies</p>
                                    <p className="text-3xl font-bold text-white">{policies.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Active Policies</p>
                                    <p className="text-3xl font-bold text-emerald-400">{activePolicies}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Total Coverage</p>
                                    <p className="text-2xl font-bold text-purple-400">{formatEth(totalCoverage)} ETH</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">KYC Status</p>
                                    <Badge className={`text-sm font-semibold ${user.kycStatus === "verified"
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                            : user.kycStatus === "rejected"
                                                ? "bg-red-500/20 text-red-400 border-red-500/50"
                                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                                        }`}>
                                        {user.kycStatus?.toUpperCase() || "PENDING"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Details */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Profile Details</CardTitle>
                        <CardDescription className="text-slate-400">Your account information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Email</p>
                                <p className="text-white">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Phone</p>
                                <p className="text-white">{user.phone || "N/A"}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-slate-400 text-sm mb-1">Wallet Address</p>
                                <p className="font-mono text-xs bg-slate-900/70 p-3 rounded border border-slate-700/50 break-all text-emerald-400">
                                    {user.walletAddress || "Not connected"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Role</p>
                                <p className="capitalize text-white">{user.role || "User"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KYC Warning if not verified */}
                {user.kycStatus !== "verified" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
                        <div className="flex items-start">
                            <div className="text-2xl mr-3">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-400 mb-2">KYC Verification Required</h3>
                                <p className="text-slate-300 text-sm mb-3">
                                    {user.kycStatus === "pending"
                                        ? "Your KYC is under review. Please wait for admin approval."
                                        : "Please complete KYC verification to purchase insurance policies."
                                    }
                                </p>
                                {user.kycStatus === "pending" ? null : (
                                    <Button
                                        onClick={() => router.push("/kyc")}
                                        className="bg-yellow-500 text-slate-900 hover:bg-yellow-400"
                                    >
                                        Complete KYC
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => router.push("/products")}
                        className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-left hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-3xl mb-2">🛡️</div>
                        <h3 className="font-semibold mb-1 text-lg">Browse Products</h3>
                        <p className="text-sm text-emerald-100">Explore insurance policies</p>
                    </button>

                    <button
                        onClick={() => router.push("/dashboard/user/policies")}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-3xl mb-2">📋</div>
                        <h3 className="font-semibold mb-1 text-lg">My Policies</h3>
                        <p className="text-sm text-blue-100">View active policies</p>
                    </button>

                    <button
                        onClick={() => router.push("/kyc")}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-left hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-3xl mb-2">🆔</div>
                        <h3 className="font-semibold mb-1 text-lg">KYC Status</h3>
                        <p className="text-sm text-purple-100">Manage verification</p>
                    </button>
                </div>

                {/* My Policies Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">My Policies</h2>
                            <p className="text-slate-400">Your recent insurance policies</p>
                        </div>
                        {policies.length > 0 && (
                            <Button
                                onClick={() => router.push("/dashboard/user/policies")}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {loadingPolicies ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                        </div>
                    ) : policies.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm text-center py-12">
                            <CardContent>
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 mb-4">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">No policies yet</h3>
                                <p className="text-slate-400 mb-6">You haven't purchased any insurance policies yet.</p>
                                <Button
                                    onClick={() => router.push("/products")}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Shield className="mr-2 h-5 w-5" />
                                    Browse Products
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {policies.slice(0, 3).map((policy) => (
                                <Card
                                    key={policy._id}
                                    className="flex flex-col bg-slate-800/50 border-slate-700/50 backdrop-blur-sm group hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge
                                                variant="outline"
                                                className={`capitalize font-semibold ${getStatusColor(policy.status)}`}
                                            >
                                                {policy.status}
                                            </Badge>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                                                #{policy.policyNumber}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors">
                                            {policy.product.productName}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 flex items-center gap-2 mt-2">
                                            <Shield className="h-4 w-4" />
                                            {policy.company.name}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                                    <Wallet className="h-3 w-3" />
                                                    Coverage
                                                </p>
                                                <p className="font-bold text-lg text-emerald-400">{formatEth(policy.sumInsured)} ETH</p>
                                            </div>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    Premium
                                                </p>
                                                <p className="font-bold text-lg text-blue-400">{formatEth(policy.premiumPaid)} ETH</p>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 p-4 rounded-lg border border-slate-700/50 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span>Expires: {new Date(policy.endDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>
                                            {policy.status === 'active' && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all"
                                                            style={{ width: `${Math.min((policy.daysRemaining / 365) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-emerald-400 font-semibold whitespace-nowrap">
                                                        {policy.daysRemaining}d
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4">
                                        <Button
                                            asChild
                                            className="w-full bg-slate-700 hover:bg-emerald-600 text-white transition-all group-hover:bg-emerald-600"
                                        >
                                            <Link href={`/dashboard/user/policies/${policy._id}`}>
                                                View Details
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}