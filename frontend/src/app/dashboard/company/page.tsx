'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, FileText, DollarSign, Shield, ArrowRight, Activity, Users, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

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
      pending: { className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending Approval' },
      approved: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Verified Company' },
      rejected: { className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
      blocked: { className: 'bg-red-900/10 text-red-500 border-red-900/20', label: 'Blocked' },
    };
    const cfg = config[status] || config.pending;
    return <Badge variant="outline" className={`${cfg.className} backdrop-blur-md px-4 py-1.5 text-sm`}>{cfg.label}</Badge>;
  };

  if (loading && loadingProducts && loadingPolicies) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-blue-500">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremiums = policies.reduce((sum, p) => sum + p.premiumPaid, 0);
  const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0);

  const stats = [
    {
      label: 'Products',
      value: totalProducts,
      subValue: `${activeProducts} Active`,
      icon: Package,
      delay: 0.1,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: 'Active Policies',
      value: activePolicies,
      subValue: `${policies.length} Total Sold`,
      icon: FileText,
      delay: 0.2,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      label: 'Premiums',
      value: formatEth(totalPremiums),
      suffix: 'ETH',
      subValue: 'Total Collected',
      icon: DollarSign,
      delay: 0.3,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      label: 'Coverage',
      value: formatEth(totalCoverage),
      suffix: 'ETH',
      subValue: 'Total Insured Value',
      icon: Shield,
      delay: 0.4,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  Company Portal
                </h1>
                <p className="text-muted-foreground">Overview of your insurance business</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {getStatusBadge(companyStatus)}
              <ConnectButton
                client={client}
                appMetadata={{
                  name: "FarmShield",
                  url: "https://example.com",
                }}
                connectButton={{
                  label: "Connect Wallet",
                  className: "!bg-blue-500/10 !text-blue-400 !border !border-blue-500/20 !font-semibold !px-4 !py-2 !rounded-xl hover:!bg-blue-500/20 transition-all !h-10"
                }}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}
              >
                <div className={`group relative overflow-hidden rounded-3xl bg-card/40 border ${stat.border} p-6 hover:bg-card/60 transition-all duration-300 backdrop-blur-xl hover:shadow-lg hover:shadow-blue-500/5`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-display tracking-tight text-foreground">
                        {stat.value}
                      </span>
                      {stat.suffix && (
                        <span className={`text-sm font-medium ${stat.color}`}>{stat.suffix}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/60 pt-2 border-t border-border/50 mt-3">{stat.subValue}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Button
                onClick={() => router.push('/dashboard/company/products/create')}
                className="h-auto py-8 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-2xl group relative overflow-hidden shadow-lg shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="flex flex-col items-center gap-3 relative z-10 text-white">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-semibold">Create Product</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push('/dashboard/company/products')}
                variant="outline"
                className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-blue-500/30 rounded-2xl text-foreground group transition-all"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                    <Package className="h-6 w-6 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-lg font-semibold">Manage Products</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push('/dashboard/company/policies')}
                variant="outline"
                className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-indigo-500/30 rounded-2xl text-foreground group transition-all"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                    <FileText className="h-6 w-6 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className="text-lg font-semibold">View Policies</span>
                </div>
              </Button>
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Recent Products</h2>
                <p className="text-muted-foreground">Your latest deployed insurance contracts</p>
              </div>
              {products.length > 0 && (
                <Button
                  onClick={() => router.push('/dashboard/company/products')}
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {loadingProducts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-card/30 rounded-3xl border border-blue-500/20 border-dashed backdrop-blur-sm">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 mb-6">
                  <Package className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Start by creating your first insurance product to protect farmers against risks.</p>
                <Button
                  onClick={() => router.push('/dashboard/company/products/create')}
                  className="rounded-full px-8 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                >
                  Create Product
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 3).map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                  >
                    <div
                      onClick={() => router.push(`/dashboard/company/products/${product._id}`)}
                      className="group relative bg-card/40 border border-border/50 rounded-3xl p-6 hover:bg-card/60 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                            <Shield className="w-6 h-6" />
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              product.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : product.status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  : 'bg-secondary text-muted-foreground border-border'
                            }
                          >
                            {product.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{product.productName}</h3>
                          <div className="flex gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground capitalize border border-border/50">
                              {product.policyType.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground capitalize border border-border/50">
                              {product.coverageType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-background/40 p-3 rounded-xl border border-border/30">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Base Rate</p>
                            <p className="font-bold text-lg text-blue-200">{product.baseRate}%</p>
                          </div>
                          <div className="bg-background/40 p-3 rounded-xl border border-border/30">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Min Coverage</p>
                            <p className="font-bold text-lg text-indigo-200">{formatEth(product.sumInsuredMin)} <span className="text-xs font-normal text-muted-foreground">ETH</span></p>
                          </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Imported Building2 icon needs to be added from lucide-react */}
    </div>
  );
}

// Helper to add missing import if needed (I noticed I used Building2 but imported it above, double checking)
import { Building2 } from 'lucide-react';