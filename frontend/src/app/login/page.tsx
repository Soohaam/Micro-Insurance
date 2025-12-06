"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState<"user" | "company" | "admin">("user");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Check if already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    
    if (token && userRole && isAuthenticated && user) {
      // Already logged in, redirect to appropriate dashboard
      if (userRole === "admin") {
        router.push("/dashboard/admin");
      } else if (userRole === "company") {
        router.push("/dashboard/company");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Login successful!");
      // Redirect based on role
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (user.role === "company") {
        router.push("/dashboard/company");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: any) => {
    const payload = {
      email: data.email,
      password: data.password,
      role,
    };
    dispatch(login(payload));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate- 950 text-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Login to access your micro insurance platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-md transition-all text-sm font-medium ${
                role === "user"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRole("user")}
            >
              User
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-md transition-all text-sm font-medium ${
                role === "company"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRole("company")}
            >
              Company
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-md transition-all text-sm font-medium ${
                role === "admin"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          {/* Admin Credentials Info */}
          {role === "admin" && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 text-sm">
              <p className="font-semibold text-purple-400 mb-1">Demo Admin Credentials:</p>
              <p className="text-slate-300">Email: admin@microinsurance.com</p>
              <p className="text-slate-300">Password: adminpassword123</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="bg-slate-800/50 border-slate-700 focus:border-emerald-500"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 focus:border-emerald-500"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message as string}</p>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full ${
                role === "user"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : role === "company"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white font-semibold`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <a href="/register" className="text-emerald-400 hover:underline font-medium">
              Register here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
