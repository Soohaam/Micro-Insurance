"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uploadDocuments, fetchDashboardStats } from "@/store/slices/companySlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Package, FileCheck, TrendingUp, Plus, Building2 } from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { stats, loading } = useAppSelector((state) => state.company);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated || user?.role !== "company") {
      router.push("/login");
      return;
    }

    if (user?.status === "approved") {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAuthenticated, user, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const result = await dispatch(uploadDocuments(acceptedFiles));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Documents uploaded successfully! Awaiting admin approval.");
      }
    } catch (error) {
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    disabled: uploading || user?.status === "approved",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // PENDING STATUS - Show document upload
  if (user?.status === "pending") {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold">Company Registration Pending</h1>
                  <p className="text-sm text-slate-400 font-normal mt-1">
                    Upload your company documents for admin verification
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⏳ Your company registration is pending approval. Please upload the required documents below.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : uploading
                    ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed'
                    : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'
                }`}
              >
                <input {...getInputProps()} disabled={uploading} />
                
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <p className="text-lg font-semibold">Uploading Documents...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    {isDragActive ? (
                      <p className="text-lg text-blue-400">Drop your documents here...</p>
                    ) : (
                      <>
                        <p className="text-lg mb-2 font-semibold">
                          Upload Company Documents
                        </p>
                        <p className="text-sm text-slate-400 mb-2">
                          Drag & drop or click to select files
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-4">
                          <span>PDF, JPG, PNG</span>
                          <span>•</span>
                          <span>Max 10MB per file</span>
                          <span>•</span>
                          <span>Multiple files allowed</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 mb-2 font-semibold">📋 Required Documents:</p>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>Company Registration Certificate</li>
                  <li>Insurance License</li>
                  <li>Tax Registration (GST/PAN)</li>
                  <li>Director's ID Proof</li>
                  <li>Office Address Proof</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // APPROVED STATUS - Show dashboard
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Company Dashboard</h1>
          <p className="text-slate-400">Manage your insurance products and policies</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Total Products</CardTitle>
              <Package className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-blue-300 mt-1">
                {stats?.activeProducts || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Active Policies</CardTitle>
              <FileCheck className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.activePolicies || 0}</div>
              <p className="text-xs text-emerald-300 mt-1">
                {stats?.totalPolicies || 0} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Total Premiums</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ₹{(stats?.totalPremiums || 0).toLocaleString()}
              </div>
              <p className="text-xs text-purple-300 mt-1">Collected</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Pool Balance</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ₹{(stats?.poolBalance || 0).toLocaleString()}
              </div>
              <p className="text-xs text-orange-300 mt-1">Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard/company/products/create')}
                className="w-full bg-blue-500 hover:bg-blue-600 justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Product
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/company/products')}
                className="w-full justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/company/policies')}
                className="w-full justify-start"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                View Policies
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Company Name</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                  {user?.status?.toUpperCase()}
                </span>
              </div>
              {user?.walletAddress && (
                <div>
                  <p className="text-slate-400">Wallet Address</p>
                  <p className="font-mono text-xs">{user.walletAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
