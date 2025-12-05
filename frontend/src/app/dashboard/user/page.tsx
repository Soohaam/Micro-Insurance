"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch (error) {
                router.push("/login");
            }
        };
        fetchProfile();
    }, [router]);

    if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;

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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.kycStatus === "verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                            KYC: {user.kycStatus.toUpperCase()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Email</p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Phone</p>
                            <p>{user.phone}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Wallet Address</p>
                            <p className="font-mono text-xs bg-slate-800 p-2 rounded">{user.walletAddress}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Address</p>
                            <p>{user.address}</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder for future features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            🛡️
                        </div>
                        <h3 className="font-semibold mb-2">My Policies</h3>
                        <p className="text-slate-400 text-sm">You haven't purchased any insurance policies yet.</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
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
