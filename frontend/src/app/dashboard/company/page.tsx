'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, FileText, DollarSign, Shield, ArrowRight, Activity, Users } from 'lucide-react';
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
      approved: { className: 'bg-primary/10 text-primary border-primary/20', label: 'Approved' },
      rejected: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Rejected' },
      blocked: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Blocked' },
    };
    const cfg = config[status] || config.pending;
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
  };

  if (loading && loadingProducts && loadingPolicies) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
      label: 'Total Products',
      value: totalProducts,
      subValue: `${activeProducts} active`,
      icon: Package,
      delay: 0.1
    },
    {
      label: 'Active Policies',
      value: activePolicies,
      subValue: `${policies.length} total`,
      icon: FileText,
      delay: 0.2
    },
    {
      label: 'Total Premiums',
      value: formatEth(totalPremiums),
      suffix: 'ETH',
      subValue: 'Collected',
      icon: DollarSign,
      delay: 0.3
    },
    {
      label: 'Total Coverage',
      value: formatEth(totalCoverage),
      suffix: 'ETH',
      subValue: 'Insured',
      icon: Shield,
      delay: 0.4
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[180px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
          <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-display font-bold">Company Portal</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block">
                {getStatusBadge(companyStatus)}
              </div>
              <ConnectButton
                client={client}
                appMetadata={{
                  name: "FarmShield",
                  url: "https://example.com",
                }}
                connectButton={{
                  label: "Connect Wallet",
                  className: "!bg-primary/10 !text-primary !border !border-primary/20 !font-semibold !px-4 !py-2 !rounded-full hover:!bg-primary/20 transition-all"
                }}
              />
            </div>
          </div>
        </header>

        <main className="container max-w-7xl mx-auto px-4 py-10 space-y-12">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
                Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Manage your insurance products, track policies, and monitor performance.
              </p>
            </motion.div>
            <div className="sm:hidden">
              {getStatusBadge(companyStatus)}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}
              >
                <div className="group relative overflow-hidden rounded-3xl bg-card/40 border border-border/50 p-6 hover:bg-card/60 transition-colors backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="relative space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-display tracking-tight">
                        {stat.value}
                      </span>
                      {stat.suffix && (
                        <span className="text-sm font-medium text-muted-foreground">{stat.suffix}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-xs text-primary/80 pt-2">{stat.subValue}</p>
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
            <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Button
                onClick={() => router.push('/dashboard/company/products/create')}
                className="h-auto py-8 bg-gradient-to-br from-primary/80 to-accent/80 hover:from-primary hover:to-accent border-0 rounded-3xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Create Product</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push('/dashboard/company/products')}
                variant="outline"
                className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-primary/30 rounded-3xl text-foreground group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                    <FileText className="h-6 w-6 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-lg font-semibold">View Products</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push('/dashboard/company/policies')}
                variant="outline"
                className="h-auto py-8 bg-card/40 border-border/50 hover:bg-card/60 hover:border-primary/30 rounded-3xl text-foreground group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                    <Activity className="h-6 w-6 group-hover:text-primary transition-colors" />
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
                <h2 className="text-2xl font-display font-bold mb-1">Recent Products</h2>
                <p className="text-muted-foreground">Your latest insurance offerings</p>
              </div>
              {products.length > 0 && (
                <Button
                  onClick={() => router.push('/dashboard/company/products')}
                  variant="ghost"
                  className="hover:bg-secondary/50"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {loadingProducts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-card/30 rounded-3xl border border-border/50 border-dashed">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first insurance product to get started with protecting farmers.</p>
                <Button
                  onClick={() => router.push('/dashboard/company/products/create')}
                  className="rounded-full px-6"
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
                      className="group relative bg-card/40 border border-border/50 rounded-3xl p-6 hover:bg-card/60 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="outline"
                          className={
                            product.status === 'active'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : product.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                : 'bg-secondary text-muted-foreground border-border'
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{product.productName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {product.policyType.replace('_', ' ')} • {product.coverageType.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-secondary/30 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Base Rate</p>
                          <p className="font-bold text-lg">{product.baseRate}%</p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Min Coverage</p>
                          <p className="font-bold text-lg">{formatEth(product.sumInsuredMin)} <span className="text-xs font-normal text-muted-foreground">ETH</span></p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}