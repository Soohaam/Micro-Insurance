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

// Thirdweb Imports - Same as your working reference
import { ConnectButton } from "thirdweb/react";
import { client } from "../../client"; // Make sure this path is correct (same as your working page)

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
      setStats(response.data.stats || null);
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
      await axios.post(
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
    maxSize: 10 * 1024 * 1024,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending Approval' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      blocked: { variant: 'destructive', label: 'Blocked' },
    };
    const cfg = config[status] || config.pending;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  // PENDING: Show document upload screen (kept commented as requested)
  // if (companyStatus === 'pending') { ... }

  // REJECTED OR BLOCKED (kept commented as requested)
  // if (companyStatus === 'rejected' || companyStatus === 'blocked') { ... }

  return (
    <>
      {/* Header with ConnectButton - EXACTLY like your reference Home page */}
      <header className="border-b border-slate-800/30 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-white">Company Portal</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Company Status */}
            <div className="hidden sm:block">
              {getStatusBadge(companyStatus)}
            </div>

            {/* ConnectButton - Same as your working Home page */}
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Micro Insurance Platform",
                url: "https://yourdomain.com",
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="container mx-auto p-6 pt-10 space-y-8">
        {/* Page Title & Mobile Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your insurance products and policies</p>
          </div>
          <div className="sm:hidden">
            {getStatusBadge(companyStatus)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Products created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activePolicies || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Premiums</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(stats?.totalPremiums || 0).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">Collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(stats?.totalPayouts || 0).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">Claims paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pool Balance</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(stats?.poolBalance || 0).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">Available funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Exposure</CardTitle>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(stats?.riskExposure || 0).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">Total insured</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your insurance operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Button onClick={() => router.push('/dashboard/company/products/create')} size="lg" className="h-32">
              <div className="flex flex-col items-center gap-3">
                <Package className="h-8 w-8" />
                <span className="text-base font-medium">Create Product</span>
              </div>
            </Button>

            <Button onClick={() => router.push('/dashboard/company/products')} variant="outline" size="lg" className="h-32">
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-8 w-8" />
                <span className="text-base font-medium">View Products</span>
              </div>
            </Button>

            <Button onClick={() => router.push('/dashboard/company/policies')} variant="outline" size="lg" className="h-32">
              <div className="flex flex-col items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                <span className="text-base font-medium">View Policies</span>
              </div>
            </Button>

            <Button onClick={() => router.push('/dashboard/company/analytics')} variant="outline" size="lg" className="h-32">
              <div className="flex flex-col items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <span className="text-base font-medium">Analytics</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}