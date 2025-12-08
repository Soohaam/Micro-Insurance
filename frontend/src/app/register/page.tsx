"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, registerCompany, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Building2, CheckCircle, ArrowLeft } from "lucide-react";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { motion } from "framer-motion";

// Fixed User Schema
const userSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  walletAddress: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  address: z.object({
    street: z.string().min(5, "Street address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Company Schema
const companySchema = z.object({
  companyName: z.string().min(3, "Company name required"),
  companyEmail: z.string().email("Invalid email address"),
  companyPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  registrationNumber: z.string().min(5, "Registration number required"),
  walletAddress: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  address: z.object({
    street: z.string().min(5, "Street address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  documents: z.any().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [tab, setTab] = useState("user");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const account = useActiveAccount();

  const userForm = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      walletAddress: "",
      password: "",
      confirmPassword: "",
      address: { street: "", city: "", state: "", pincode: "" },
    },
  });

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      registrationNumber: "",
      walletAddress: "",
      password: "",
      confirmPassword: "",
      address: { street: "", city: "", state: "", pincode: "" },
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (account?.address) {
      const walletAddr = account.address;
      userForm.setValue("walletAddress", walletAddr, { shouldValidate: true });
      companyForm.setValue("walletAddress", walletAddr, { shouldValidate: true });
      toast.success("Wallet connected successfully!");
    }
  }, [account?.address, userForm, companyForm]);

  const onUserSubmit = async (data: any) => {
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Registration successful! Please complete KYC verification.");
      router.push("/kyc");
    }
  };

  const onCompanySubmit = async (data: any) => {
    const { confirmPassword, ...companyData } = data;
    const result = await dispatch(registerCompany(companyData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Company registered! Please login and upload documents for approval.");
      router.push("/login");
    }
  };

  const isWalletConnected = !!account?.address;
  const activeColor = tab === "user" ? "emerald" : "blue";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden py-10">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${tab === 'user' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${tab === 'user' ? 'bg-teal-500' : 'bg-indigo-500'}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className="bg-card/40 border-border/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Top Border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-colors duration-500 ${tab === 'user' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'}`} />

          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <ConnectButton
                client={client}
                appMetadata={{
                  name: "FarmShield",
                  url: "https://example.com",
                }}
              />
            </div>

            <CardTitle className="text-4xl font-bold font-display tracking-tight mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-lg">
              Join the future of decentralized insurance
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-10">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/30 p-1 rounded-xl">
                <TabsTrigger
                  value="user"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all py-3 rounded-lg text-md font-medium"
                >
                  <User className="w-4 h-4 mr-2" /> User Registration
                </TabsTrigger>
                <TabsTrigger
                  value="company"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all py-3 rounded-lg text-md font-medium"
                >
                  <Building2 className="w-4 h-4 mr-2" /> Company Registration
                </TabsTrigger>
              </TabsList>

              {isWalletConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${tab === 'user' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold">Wallet Connected:</span>
                    <span className="font-mono text-xs sm:text-sm text-foreground/80">{account.address}</span>
                  </div>
                </motion.div>
              )}

              {/* USER FORM */}
              <TabsContent value="user">
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="section-title text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                      Personal Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="John Doe" className="input-field" {...userForm.register("fullName")} />
                        {userForm.formState.errors.fullName && <p className="error-text">{userForm.formState.errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="9876543210" className="input-field" {...userForm.register("phone")} />
                        {userForm.formState.errors.phone && <p className="error-text">{userForm.formState.errors.phone.message}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" className="input-field" {...userForm.register("email")} />
                        {userForm.formState.errors.email && <p className="error-text">{userForm.formState.errors.email.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4 pt-2">
                    <h3 className="section-title text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                      Address Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street Address</Label>
                        <Input placeholder="123 Main St" className="input-field" {...userForm.register("address.street")} />
                        {userForm.formState.errors.address?.street && <p className="error-text">{userForm.formState.errors.address.street.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="Mumbai" className="input-field" {...userForm.register("address.city")} />
                        {userForm.formState.errors.address?.city && <p className="error-text">{userForm.formState.errors.address.city.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input placeholder="Maharashtra" className="input-field" {...userForm.register("address.state")} />
                        {userForm.formState.errors.address?.state && <p className="error-text">{userForm.formState.errors.address.state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input placeholder="400001" className="input-field" {...userForm.register("address.pincode")} />
                        {userForm.formState.errors.address?.pincode && <p className="error-text">{userForm.formState.errors.address.pincode.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4 pt-2">
                    <h3 className="section-title text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                      Security
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" placeholder="••••••••" className="input-field" {...userForm.register("password")} />
                        {userForm.formState.errors.password && <p className="error-text">{userForm.formState.errors.password.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input type="password" placeholder="••••••••" className="input-field" {...userForm.register("confirmPassword")} />
                        {userForm.formState.errors.confirmPassword && <p className="error-text">{userForm.formState.errors.confirmPassword.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="hidden">
                    <Input {...userForm.register("walletAddress")} disabled />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-6 mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                  </Button>
                </form>
              </TabsContent>

              {/* COMPANY FORM */}
              <TabsContent value="company">
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                  {/* Company Info */}
                  <div className="space-y-4">
                    <h3 className="section-title text-blue-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      Company Info
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input placeholder="ABC Insurance" className="input-field" {...companyForm.register("companyName")} />
                        {companyForm.formState.errors.companyName && <p className="error-text">{companyForm.formState.errors.companyName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input placeholder="CIN123456" className="input-field" {...companyForm.register("registrationNumber")} />
                        {companyForm.formState.errors.registrationNumber && <p className="error-text">{companyForm.formState.errors.registrationNumber.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="9876543210" className="input-field" {...companyForm.register("companyPhone")} />
                        {companyForm.formState.errors.companyPhone && <p className="error-text">{companyForm.formState.errors.companyPhone.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="contact@abc.com" className="input-field" {...companyForm.register("companyEmail")} />
                        {companyForm.formState.errors.companyEmail && <p className="error-text">{companyForm.formState.errors.companyEmail.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4 pt-2">
                    <h3 className="section-title text-blue-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      Headquarters Address
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street Address</Label>
                        <Input placeholder="Business Park" className="input-field" {...companyForm.register("address.street")} />
                        {companyForm.formState.errors.address?.street && <p className="error-text">{companyForm.formState.errors.address.street.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="City" className="input-field" {...companyForm.register("address.city")} />
                        {companyForm.formState.errors.address?.city && <p className="error-text">{companyForm.formState.errors.address.city.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input placeholder="State" className="input-field" {...companyForm.register("address.state")} />
                        {companyForm.formState.errors.address?.state && <p className="error-text">{companyForm.formState.errors.address.state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input placeholder="110001" className="input-field" {...companyForm.register("address.pincode")} />
                        {companyForm.formState.errors.address?.pincode && <p className="error-text">{companyForm.formState.errors.address.pincode.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4 pt-2">
                    <h3 className="section-title text-blue-400 font-semibold flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      Security
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" placeholder="••••••••" className="input-field" {...companyForm.register("password")} />
                        {companyForm.formState.errors.password && <p className="error-text">{companyForm.formState.errors.password.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input type="password" placeholder="••••••••" className="input-field" {...companyForm.register("confirmPassword")} />
                        {companyForm.formState.errors.confirmPassword && <p className="error-text">{companyForm.formState.errors.confirmPassword.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="hidden">
                    <Input {...companyForm.register("walletAddress")} disabled />
                  </div>

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-lg py-6 mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Register Company"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <a
                href="/login"
                className={`font-semibold hover:underline ${tab === 'user' ? 'text-emerald-400' : 'text-blue-400'}`}
              >
                Login here
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx global>{`
        .input-field {
            @apply bg-background/50 border-border/50 focus:ring-2 transition-all;
        }
        .error-text {
            @apply text-destructive text-xs mt-1;
        }
      `}</style>
    </div>
  );
}