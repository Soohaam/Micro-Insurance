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
import { Loader2 } from "lucide-react";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client } from "../client";

const userSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address").optional().or(z.literal("")),
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

const companySchema = z.object({
  companyName: z.string().min(3, "Company name required"),
  companyEmail: z.string().email("Invalid email address"),
  companyPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  registrationNumber: z.string().min(5, "Registration number required"),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address").optional().or(z.literal("")),
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
      password: "",
      confirmPassword: "",
      walletAddress: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
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
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    console.log("Wallet detection effect triggered:", account);
    if (account?.address) {
      console.log("Setting wallet address:", account.address);
      userForm.setValue("walletAddress", account.address);
      toast.success(`Wallet connected: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`);
    }
  }, [account, userForm]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Register as a user or insurance company
          </CardDescription>
          <div className="flex justify-center mt-4">
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Micro Insurance Platform",
                url: "https://example.com",
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="user" className="data-[state=active]:bg-emerald-500">
                User Registration
              </TabsTrigger>
              <TabsTrigger value="company" className="data-[state=active]:bg-blue-500">
                Company Registration
              </TabsTrigger>
            </TabsList>

            {/* Wallet Connection Status */}
            {account?.address && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-sm text-emerald-400">
                  Wallet Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </p>
              </div>
            )}

            {/* USER REGISTRATION */}
            <TabsContent value="user">
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("fullName")}
                    />
                    {userForm.formState.errors.fullName && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("email")}
                    />
                    {userForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("phone")}
                    />
                    {userForm.formState.errors.phone && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x..."
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("walletAddress")}
                    />
                    {userForm.formState.errors.walletAddress && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.walletAddress.message}
                      </p>
                    )}
                    {account?.address && (
                      <p className="text-emerald-400 text-xs mt-1">
                        ✓ Auto-filled from connected wallet
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("address.street")}
                    />
                    {userForm.formState.errors.address?.street && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.address.street.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("address.city")}
                    />
                    {userForm.formState.errors.address?.city && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.address.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("address.state")}
                    />
                    {userForm.formState.errors.address?.state && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("address.pincode")}
                    />
                    {userForm.formState.errors.address?.pincode && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.address.pincode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("password")}
                    />
                    {userForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700"
                      {...userForm.register("confirmPassword")}
                    />
                    {userForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        {userForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as User"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* COMPANY REGISTRATION */}
            <TabsContent value="company">
              <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="ABC Insurance Ltd"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("companyName")}
                    />
                    {companyForm.formState.errors.companyName && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.companyName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyEmail">Company Email *</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="contact@abcinsurance.com"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("companyEmail")}
                    />
                    {companyForm.formState.errors.companyEmail && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.companyEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyPhone">Phone *</Label>
                    <Input
                      id="companyPhone"
                      placeholder="1234567890"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("companyPhone")}
                    />
                    {companyForm.formState.errors.companyPhone && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.companyPhone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="CIN123456789"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("registrationNumber")}
                    />
                    {companyForm.formState.errors.registrationNumber && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.registrationNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x..."
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("walletAddress")}
                    />
                    {companyForm.formState.errors.walletAddress && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.walletAddress.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyStreet">Street Address *</Label>
                    <Input
                      id="companyStreet"
                      placeholder="456 Business Park"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("address.street")}
                    />
                    {companyForm.formState.errors.address?.street && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.address.street.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyCity">City *</Label>
                    <Input
                      id="companyCity"
                      placeholder="Delhi"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("address.city")}
                    />
                    {companyForm.formState.errors.address?.city && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.address.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyState">State *</Label>
                    <Input
                      id="companyState"
                      placeholder="Delhi"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("address.state")}
                    />
                    {companyForm.formState.errors.address?.state && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyPincode">Pincode *</Label>
                    <Input
                      id="companyPincode"
                      placeholder="110001"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("address.pincode")}
                    />
                    {companyForm.formState.errors.address?.pincode && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.address.pincode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyPassword">Password *</Label>
                    <Input
                      id="companyPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("password")}
                    />
                    {companyForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyConfirmPassword">Confirm Password *</Label>
                    <Input
                      id="companyConfirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700"
                      {...companyForm.register("confirmPassword")}
                    />
                    {companyForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        {companyForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as Company"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-emerald-400 hover:underline font-medium">
              Login here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
