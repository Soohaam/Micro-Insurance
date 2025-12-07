'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Calendar, ArrowRight, FileText, Wallet, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Policy {
  _id: string;
  policyNumber: string;
  product: {
    productName: string;
    coverageType: string;
  };
  company: {
    name: string;
  };
  sumInsured: number;
  premiumPaid: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'claimed';
  daysRemaining: number;
}

export default function MyPolicies() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPolicies();
  }, [token]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicies(response.data.policies || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'expired': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      case 'claimed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const formatEth = (value: number) => {
    return value.toFixed(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">My Policies</h1>
              <p className="text-slate-400 text-lg">Manage your insurance portfolio on the blockchain</p>
            </div>
            <Button
              onClick={() => router.push('/products')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              size="lg"
            >
              <Shield className="mr-2 h-5 w-5" />
              Browse New Products
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Policies</p>
                    <p className="text-3xl font-bold text-white">{totalPolicies}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Active Policies</p>
                    <p className="text-3xl font-bold text-emerald-400">{activePolicies}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Coverage</p>
                    <p className="text-3xl font-bold text-purple-400">{formatEth(totalCoverage)} ETH</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              All ({totalPolicies})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
              size="sm"
              className={filter === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              Active ({policies.filter(p => p.status === 'active').length})
            </Button>
            <Button
              variant={filter === 'expired' ? 'default' : 'outline'}
              onClick={() => setFilter('expired')}
              size="sm"
              className={filter === 'expired' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              Expired ({policies.filter(p => p.status === 'expired').length})
            </Button>
            <Button
              variant={filter === 'claimed' ? 'default' : 'outline'}
              onClick={() => setFilter('claimed')}
              size="sm"
              className={filter === 'claimed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              Claimed ({policies.filter(p => p.status === 'claimed').length})
            </Button>
          </div>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm text-center py-16">
            <CardContent>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">No policies found</h3>
              <p className="text-slate-400 mb-6 text-lg">
                {filter === 'all'
                  ? "You haven't purchased any insurance policies yet."
                  : `You don't have any ${filter} policies.`}
              </p>
              <Button
                onClick={() => router.push('/products')}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Find Insurance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolicies.map((policy) => (
              <Card
                key={policy._id}
                className="flex flex-col bg-slate-800/50 border-slate-700/50 backdrop-blur-sm group hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge
                      variant="outline"
                      className={`capitalize font-semibold ${getStatusColor(policy.status)}`}
                    >
                      {policy.status}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                      #{policy.policyNumber}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors">
                    {policy.product.productName}
                  </CardTitle>
                  <CardDescription className="text-slate-400 flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4" />
                    {policy.company.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Coverage & Premium */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Sum Insured
                      </p>
                      <p className="font-bold text-lg text-emerald-400">{formatEth(policy.sumInsured)} ETH</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Premium
                      </p>
                      <p className="font-bold text-lg text-blue-400">{formatEth(policy.premiumPaid)} ETH</p>
                    </div>
                  </div>

                  {/* Policy Duration */}
                  <div className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 p-4 rounded-lg border border-slate-700/50 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Expires: {new Date(policy.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {policy.status === 'active' && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min((policy.daysRemaining / 365) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-semibold whitespace-nowrap">
                          {policy.daysRemaining}d left
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coverage Type Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">
                      {policy.product.coverageType}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    asChild
                    className="w-full bg-slate-700 hover:bg-emerald-600 text-white transition-all group-hover:bg-emerald-600"
                  >
                    <Link href={`/dashboard/user/policies/${policy._id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}