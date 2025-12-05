"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
    const [company, setCompany] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me");
                setCompany(response.data);
            } catch (error) {
                router.push("/login");
            }
        };
        fetchProfile();
    }, [router]);

    if (!company) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;

    if (company.status === "pending" || company.status === "rejected") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${company.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                        }`}>
                        {company.status === "pending" ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        {company.status === "pending" ? "Registration Pending" : "Registration Rejected"}
                    </h1>
                    <p className="text-slate-400 mb-6">
                        {company.status === "pending"
                            ? "Your account is currently under review by the administrator. Please check back later."
                            : "Your registration has been rejected. Please contact support for more information."}
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/login");
                        }}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{company.companyName}</h1>
                        <p className="text-slate-400">Company Dashboard</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-sm mb-1">Pool Balance</p>
                        <p className="text-2xl font-bold text-emerald-400">${company.poolBalance}</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-sm mb-1">Premiums Collected</p>
                        <p className="text-2xl font-bold text-blue-400">${company.totalPremiumsCollected}</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <p className="text-slate-400 text-sm mb-1">Payouts Made</p>
                        <p className="text-2xl font-bold text-purple-400">${company.totalPayoutsMade}</p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h2 className="text-xl font-semibold mb-4">Company Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400">Email</p>
                            <p>{company.companyEmail}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Phone</p>
                            <p>{company.companyPhone}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Registration Number</p>
                            <p>{company.registrationNumber}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Wallet Address</p>
                            <p className="font-mono text-xs bg-slate-800 p-1 rounded">{company.walletAddress}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
