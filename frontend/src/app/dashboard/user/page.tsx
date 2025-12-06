"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user.fullName}</h1>
                        <p className="text-slate-400">User Dashboard</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            router.push("/login");
                        }}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Profile Details</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.kycStatus === "verified" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : user.kycStatus === "rejected"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                            KYC: {user.kycStatus?.toUpperCase() || "PENDING"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Email</p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Phone</p>
                            <p>{user.phone || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Wallet Address</p>
                            <p className="font-mono text-xs bg-slate-800 p-2 rounded break-all">
                                {user.walletAddress || "Not connected"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Role</p>
                            <p className="capitalize">{user.role || "User"}</p>
                        </div>
                    </div>
                </div>

                {/* KYC Warning if not verified */}
                {user.kycStatus !== "verified" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                        <div className="flex items-start">
                            <div className="text-2xl mr-3">⚠️</div>
                            <div>
                                <h3 className="font-semibold text-yellow-400 mb-2">KYC Verification Required</h3>
                                <p className="text-slate-300 text-sm mb-3">
                                    {user.kycStatus === "pending" 
                                        ? "Your KYC is under review. Please wait for admin approval."
                                        : "Please complete KYC verification to purchase insurance policies."
                                    }
                                </p>
                                {user.kycStatus === "pending" ? null : (
                                    <button 
                                        onClick={() => router.push("/kyc")}
                                        className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                                    >
                                        Complete KYC
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button 
                        onClick={() => router.push("/products")}
                        className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-left hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                    >
                        <div className="text-3xl mb-2">🛡️</div>
                        <h3 className="font-semibold mb-1">Browse Products</h3>
                        <p className="text-sm text-emerald-100">Explore insurance policies</p>
                    </button>
                    
                    <button 
                        onClick={() => router.push("/dashboard/user/policies")}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                        <div className="text-3xl mb-2">📋</div>
                        <h3 className="font-semibold mb-1">My Policies</h3>
                        <p className="text-sm text-blue-100">View active policies</p>
                    </button>
                    
                    <button 
                        onClick={() => router.push("/kyc")}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-left hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        <div className="text-3xl mb-2">🆔</div>
                        <h3 className="font-semibold mb-1">KYC Status</h3>
                        <p className="text-sm text-purple-100">Manage verification</p>
                    </button>
                </div>

                {/* Placeholder for future features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
                            🛡️
                        </div>
                        <h3 className="font-semibold mb-2">My Policies</h3>
                        <p className="text-slate-400 text-sm">You haven't purchased any insurance policies yet.</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
                            💰
                        </div>
                        <h3 className="font-semibold mb-2">Claims</h3>
                        <p className="text-slate-400 text-sm">No active claims found.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
