'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Package, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface CompanyStats {
  totalProducts: number;
  activePolicies: number;
  totalPremiums: number;
  totalPayouts: number;
  poolBalance: number;
  riskExposure: number;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [companyStatus, setCompanyStatus] = useState<string>('pending');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'company') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/company/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data.stats);
      setCompanyStatus(response.data.companyStatus || 'pending');
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('documents', file);
    });

    try {
      setUploading(true);
      setUploadMessage('');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/company/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMessage('Documents uploaded successfully! Awaiting admin approval.');
      fetchDashboardData();
    } catch (error: any) {
      setUploadMessage(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: true,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending Approval' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      blocked: { variant: 'destructive', label: 'Blocked' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // if (companyStatus === 'pending') {
  //   return (
  //     <div className="container mx-auto p-6 max-w-4xl">
  //       <Card className="border-2 border-dashed">
  //         <CardHeader>
  //           <div className="flex items-center justify-between">
  //             <div>
  //               <CardTitle className="text-2xl">Company Verification</CardTitle>
  //               <CardDescription>Your company registration is pending approval</CardDescription>
  //             </div>
  //             {getStatusBadge(companyStatus)}
  //           </div>
  //         </CardHeader>
  //         <CardContent className="space-y-6">
  //           <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
  //             <div className="flex items-start gap-3">
  //               <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
  //               <div>
  //                 <h3 className="font-semibold text-blue-900 dark:text-blue-100">
  //                   Upload Required Documents
  //                 </h3>
  //                 <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
  //                   Please upload your company registration documents, business license, and any other
  //                   relevant certificates to proceed with verification.
  //                 </p>
  //               </div>
  //             </div>
  //           </div>

  //           <div
  //             {...getRootProps()}
  //             className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
  //               isDragActive
  //                 ? 'border-primary bg-primary/5'
  //                 : 'border-gray-300 dark:border-gray-700 hover:border-primary'
  //             }`}
  //           >
  //             <input {...getInputProps()} />
  //             <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
  //             {uploading ? (
  //               <div className="flex items-center justify-center gap-2">
  //                 <Loader2 className="h-5 w-5 animate-spin" />
  //                 <p>Uploading documents...</p>
  //               </div>
  //             ) : (
  //               <>
  //                 <p className="text-lg font-medium mb-2">
  //                   {isDragActive ? 'Drop files here' : 'Drag & drop documents here'}
  //                 </p>
  //                 <p className="text-sm text-gray-500">or click to browse files</p>
  //                 <p className="text-xs text-gray-400 mt-2">Supported: PDF, PNG, JPG (Max 10MB each)</p>
  //               </>
  //             )}
  //           </div>

  //           {uploadMessage && (
  //             <div
  //               className={`p-4 rounded-lg ${
  //                 uploadMessage.includes('success')
  //                   ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
  //                   : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
  //               }`}
  //             >
  //               {uploadMessage}
  //             </div>
  //           )}
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // if (companyStatus === 'rejected' || companyStatus === 'blocked') {
  //   return (
  //     <div className="container mx-auto p-6 max-w-4xl">
  //       <Card className="border-destructive">
  //         <CardHeader>
  //           <div className="flex items-center justify-between">
  //             <CardTitle className="text-2xl">Company Status</CardTitle>
  //             {getStatusBadge(companyStatus)}
  //           </div>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg border border-red-200 dark:border-red-800">
  //             <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
  //               {companyStatus === 'rejected' ? 'Application Rejected' : 'Account Blocked'}
  //             </h3>
  //             <p className="text-red-700 dark:text-red-300">
  //               {companyStatus === 'rejected'
  //                 ? 'Your company registration has been rejected. Please contact support for more information.'
  //                 : 'Your company account has been blocked. Please contact support to resolve this issue.'}
  //             </p>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage your insurance products and policies</p>
        </div>
        {getStatusBadge(companyStatus)}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Insurance products created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePolicies || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premiums</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalPremiums?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Collected from policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalPayouts?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Claims paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.poolBalance?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Exposure</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.riskExposure?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total insured amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your insurance business</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button onClick={() => router.push('/dashboard/company/products/create')} className="h-24">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span>Create New Product</span>
            </div>
          </Button>
          <Button onClick={() => router.push('/dashboard/company/products')} variant="outline" className="h-24">
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>View Products</span>
            </div>
          </Button>
          <Button onClick={() => router.push('/dashboard/company/policies')} variant="outline" className="h-24">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Policies</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
