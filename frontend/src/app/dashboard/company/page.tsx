'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, FileText, DollarSign, TrendingUp, Shield, Wallet, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Thirdweb Imports
import { ConnectButton } from "thirdweb/react";
import { client } from "../../client";

interface Product {
  _id: string;
  productName: string;
  policyType: string;
  coverageType: string;
  baseRate: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Policy {
  _id: string;
  policyNumber: string;
  product: {
    productName: string;
  };
  user: {
    name: string;
    email: string;
  };
  sumInsured: number;
  premiumPaid: number;
  status: 'active' | 'expired' | 'claimed';
}

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [companyStatus, setCompanyStatus] = useState<string>('pending');
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'company') {
      router.push('/login');
      return;
    }
    fetchCompanyStatus();
    fetchProducts();
    fetchPolicies();
  }, [user, router, token]);

  const fetchCompanyStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/company/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompanyStatus(response.data.companyStatus || 'pending');
    } catch (error: any) {
      console.error('Error fetching company status:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/company/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedProducts = (response.data.products || []).map((p: any) => {
        let status = p.approvalStatus;
        if (!p.isActive) {
          status = 'inactive';
        } else if (p.approvalStatus === 'approved') {
          status = 'active';
        }
        return { ...p, status };
      });

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/company/policies?page=1&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolicies(response.data.policies || []);
    } catch (error: any) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const formatEth = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.0000' : num.toFixed(4);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'Pending Approval' },
      approved: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', label: 'Approved' },
      rejected: { className: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'Rejected' },
      blocked: { className: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'Blocked' },
    };
    const cfg = config[status] || config.pending;
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  if (loading && loadingProducts && loadingPolicies) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Calculate stats from real data
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremiums = policies.reduce((sum, p) => sum + p.premiumPaid, 0);
  const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      {/* Header with ConnectButton */}
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

            {/* ConnectButton */}
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title & Mobile Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Company Dashboard</h1>
            <p className="text-slate-400 text-lg">Manage your insurance products and policies</p>
          </div>
          <div className="sm:hidden">
            {getStatusBadge(companyStatus)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Products</CardTitle>
              <Package className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loadingProducts ? <Loader2 className="h-8 w-8 animate-spin" /> : totalProducts}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeProducts} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Policies</CardTitle>
              <FileText className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">
                {loadingPolicies ? <Loader2 className="h-8 w-8 animate-spin" /> : activePolicies}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {policies.length} total policies
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Premiums</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {loadingPolicies ? <Loader2 className="h-8 w-8 animate-spin" /> : `${formatEth(totalPremiums)} ETH`}
              </div>
              <p className="text-xs text-slate-500 mt-1">Collected</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Coverage</CardTitle>
              <Shield className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {loadingPolicies ? <Loader2 className="h-8 w-8 animate-spin" /> : `${formatEth(totalCoverage)} ETH`}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total insured</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">Manage your insurance operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={() => router.push('/dashboard/company/products/create')}
              size="lg"
              className="h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              <div className="flex flex-col items-center gap-3">
                <Package className="h-8 w-8" />
                <span className="text-base font-medium">Create Product</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/company/products')}
              variant="outline"
              size="lg"
              className="h-32 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-8 w-8" />
                <span className="text-base font-medium">View Products</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/company/policies')}
              variant="outline"
              size="lg"
              className="h-32 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <div className="flex flex-col items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                <span className="text-base font-medium">View Policies</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Products Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Recent Products</h2>
              <p className="text-slate-400">Your latest insurance products</p>
            </div>
            {products.length > 0 && (
              <Button
                onClick={() => router.push('/dashboard/company/products')}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {loadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : products.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm text-center py-12">
              <CardContent>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">No products yet</h3>
                <p className="text-slate-400 mb-6">Create your first insurance product to get started.</p>
                <Button
                  onClick={() => router.push('/dashboard/company/products/create')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Create Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <Card
                  key={product._id}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant="outline"
                        className={
                          product.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : product.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{product.productName}</CardTitle>
                    <CardDescription className="text-slate-400 capitalize">
                      {product.policyType} • {product.coverageType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Base Rate</p>
                        <p className="font-bold text-blue-400">{product.baseRate}%</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Min Coverage</p>
                        <p className="font-bold text-emerald-400">{formatEth(product.sumInsuredMin)} ETH</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/dashboard/company/products/${product._id}`)}
                      className="w-full bg-slate-700 hover:bg-emerald-600"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}