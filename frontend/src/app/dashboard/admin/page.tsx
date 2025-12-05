"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [companies, setCompanies] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get("/admin/companies");
            setCompanies(response.data);
        } catch (error) {
            toast.error("Failed to fetch companies");
        }
    };

    const updateStatus = async (companyId: string, status: string) => {
        try {
            await api.post("/admin/company/status", { companyId, status });
            toast.success(`Company ${status} successfully`);
            fetchCompanies();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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

                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-semibold">Registered Companies</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-slate-400">
                                <tr>
                                    <th className="p-4">Company Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Reg. Number</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {companies.map((company) => (
                                    <tr key={company.companyId} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium">{company.companyName}</td>
                                        <td className="p-4 text-slate-400">{company.companyEmail}</td>
                                        <td className="p-4 text-slate-400">{company.registrationNumber}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${company.status === "approved"
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : company.status === "rejected"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : "bg-yellow-500/10 text-yellow-400"
                                                    }`}
                                            >
                                                {company.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {company.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(company.companyId, "approved")}
                                                            className="px-3 py-1 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(company.companyId, "rejected")}
                                                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {company.status === "approved" && (
                                                    <button
                                                        onClick={() => updateStatus(company.companyId, "suspended")}
                                                        className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
