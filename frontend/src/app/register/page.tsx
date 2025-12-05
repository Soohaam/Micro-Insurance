"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function Register() {
    const [role, setRole] = useState<"user" | "company">("user");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const endpoint = role === "user" ? "/auth/register/user" : "/auth/register/company";
            await api.post(endpoint, data);
            toast.success(`${role === "user" ? "User" : "Company"} registered successfully!`);
            router.push("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>

                {/* Role Selection Panel */}
                <div className="flex bg-slate-800 rounded-lg p-1 mb-8">
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${role === "user" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        onClick={() => {
                            setRole("user");
                            reset();
                        }}
                    >
                        User
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${role === "company" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        onClick={() => {
                            setRole("company");
                            reset();
                        }}
                    >
                        Company
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {role === "user" ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    {...register("fullName", { required: "Full name is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { required: "Email is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    {...register("phone", { required: "Phone is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    {...register("address", { required: "Address is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Wallet Address</label>
                                <input
                                    {...register("walletAddress", { required: "Wallet Address is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                <input
                                    {...register("companyName", { required: "Company name is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Email</label>
                                <input
                                    type="email"
                                    {...register("companyEmail", { required: "Email is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Phone</label>
                                <input
                                    {...register("companyPhone", { required: "Phone is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    {...register("address", { required: "Address is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Registration Number</label>
                                <input
                                    {...register("registrationNumber", { required: "Registration Number is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Wallet Address</label>
                                <input
                                    {...register("walletAddress", { required: "Wallet Address is required" })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${role === "user" ? "focus:ring-emerald-500" : "focus:ring-blue-500"
                                }`}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-bold transition-all ${role === "user"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                    >
                        Register as {role === "user" ? "User" : "Company"}
                    </button>
                </form>

                <p className="mt-4 text-center text-slate-400 text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="text-emerald-400 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
