"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function Login() {
    const [role, setRole] = useState<"user" | "company" | "admin">("user");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const payload = { ...data, role };
            const response = await api.post("/auth/login", payload);
            const { token, role: userRole } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", userRole);

            toast.success("Login successful!");

            if (userRole === "admin") {
                router.push("/dashboard/admin");
            } else if (userRole === "company") {
                router.push("/dashboard/company");
            } else {
                router.push("/dashboard/user");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

                {/* Role Selection Panel */}
                <div className="flex bg-slate-800 rounded-lg p-1 mb-8">
                    <button
                        className={`flex-1 py-2 rounded-md transition-all text-sm ${role === "user" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        onClick={() => setRole("user")}
                    >
                        User
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md transition-all text-sm ${role === "company" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        onClick={() => setRole("company")}
                    >
                        Company
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md transition-all text-sm ${role === "admin" ? "bg-purple-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        onClick={() => setRole("admin")}
                    >
                        Admin
                    </button>
                </div>

                {role === "admin" && (
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300">
                        <p className="font-semibold text-purple-400 mb-1">Mock Admin Credentials:</p>
                        <p>Email: admin@microinsurance.com</p>
                        <p>Password: adminpassword123</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            {...register("email", { required: "Email is required" })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message as string}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-bold transition-all ${role === "user"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : role === "company"
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-purple-500 hover:bg-purple-600 text-white"
                            }`}
                    >
                        Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                </form>

                <p className="mt-4 text-center text-slate-400 text-sm">
                    Don't have an account?{" "}
                    <a href="/register" className="text-emerald-400 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
