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
import { Loader2, ArrowRight, ShieldCheck, Building2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Dynamic Theme Colors based on Role
  const theme = {
    user: {
      primary: "emerald",
      gradient: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      button: "bg-emerald-500 hover:bg-emerald-600",
      icon: User
    },
    company: {
      primary: "blue",
      gradient: "from-blue-400 to-indigo-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      button: "bg-blue-500 hover:bg-blue-600",
      icon: Building2
    },
    admin: {
      primary: "purple",
      gradient: "from-purple-400 to-pink-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      button: "bg-purple-500 hover:bg-purple-600",
      icon: ShieldCheck
    }
  };

  const currentTheme = theme[role];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token && userRole && isAuthenticated && user) {
      if (userRole === "admin") router.push("/dashboard/admin");
      else if (userRole === "company") router.push("/dashboard/company");
      else router.push("/dashboard/user");
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
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "company") router.push("/dashboard/company");
      else router.push("/dashboard/user");
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              `radial-gradient(circle at 50% 50%, ${role === 'user' ? 'rgba(16, 185, 129, 0.05)' : role === 'company' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)'} 0%, transparent 50%)`
            ]
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        />
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ${role === 'user' ? 'bg-emerald-500' : role === 'company' ? 'bg-blue-500' : 'bg-purple-500'
          }`} />
        <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ${role === 'user' ? 'bg-teal-500' : role === 'company' ? 'bg-indigo-500' : 'bg-pink-500'
          }`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card/40 border-border/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className={`h-2 w-full bg-gradient-to-r ${currentTheme.gradient}`} />

          <CardHeader className="space-y-2 text-center pb-2">
            <motion.div
              key={role}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mx-auto w-16 h-16 rounded-2xl ${currentTheme.bg} flex items-center justify-center mb-2`}
            >
              <currentTheme.icon className={`w-8 h-8 ${currentTheme.text}`} />
            </motion.div>
            <CardTitle className="text-3xl font-bold font-display tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Login to your <span className={`font-semibold ${currentTheme.text} capitalize`}>{role}</span> account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Switcher */}
            <div className="bg-secondary/30 p-1.5 rounded-xl flex gap-1 relative">
              {(['user', 'company', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 capitalize ${role === r ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {r}
                  {role === r && (
                    <motion.div
                      layoutId="activeRole"
                      className={`absolute inset-0 rounded-lg -z-10 ${r === 'user' ? 'bg-emerald-500' : r === 'company' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Admin Hint */}
            <AnimatePresence>
              {role === "admin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm"
                >
                  <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Demo Credentials
                  </div>
                  <div className="space-y-1 text-muted-foreground font-mono text-xs">
                    <p>Email: admin@microinsurance.com</p>
                    <p>Pass: adminpassword123</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-background/50 border-border/50 focus:ring-2 transition-all"
                  style={{
                    // @ts-ignore
                    '--tw-ring-color': `var(--${currentTheme.primary}-500)`,
                  }}
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 focus:ring-2 transition-all"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password.message as string}</p>
                )}
              </div>

              <Button
                type="submit"
                className={`w-full py-6 text-lg font-semibold shadow-xl shadow-${currentTheme.primary}-500/20 transition-all ${currentTheme.button}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    Login to Dashboard <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/register" className={`font-semibold hover:underline ${currentTheme.text}`}>
                Register Now
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
