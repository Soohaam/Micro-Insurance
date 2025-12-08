'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, FileText, ArrowLeft, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'claimed';
}

export default function CompanyPolicies() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchPolicies();
  }, [token, page, statusFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const statusQuery = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/company/policies?page=${page}&limit=10${statusQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolicies(response.data.policies || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (error: any) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      policy.policyNumber.toLowerCase().includes(searchLower) ||
      policy.product.productName.toLowerCase().includes(searchLower) ||
      policy.user.name.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      expired: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      claimed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return (
      <Badge variant="outline" className={`border ${styles[status]} font-normal uppercase text-xs px-2`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/company")}
              className="mb-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 inline-block">
              Policies Management
            </h1>
            <p className="text-muted-foreground text-lg">View and track all sold policies</p>
          </div>
          <Button variant="outline" className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded-xl hover:text-blue-300 transition-all">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/40 border-border/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <CardTitle className="font-display text-lg">Active Policies</CardTitle>
                  <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20">{pagination.total}</Badge>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policy, product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full md:w-[300px] bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      className="h-10 pl-9 pr-4 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-background/80 transition-colors"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="claimed">Claimed</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="text-muted-foreground font-semibold py-4 pl-6">Policy Number</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Product</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">User</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Sum Insured</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Premium</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Duration</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPolicies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <FileText className="w-10 h-10" />
                              <p>No policies found matching your filters.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPolicies.map((policy) => (
                          <TableRow key={policy._id} className="hover:bg-blue-500/5 transition-colors border-b border-border/50">
                            <TableCell className="font-mono text-foreground font-medium py-4 pl-6">{policy.policyNumber}</TableCell>
                            <TableCell className="font-medium text-foreground">{policy.product.productName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{policy.user.name}</span>
                                <span className="text-xs text-muted-foreground">{policy.user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono">{policy.sumInsured.toLocaleString()} ETH</TableCell>
                            <TableCell className="font-bold text-blue-400 font-mono">{policy.premiumPaid.toLocaleString()} ETH</TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {new Date(policy.startDate).toLocaleDateString()}</p>
                                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {new Date(policy.endDate).toLocaleDateString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(policy.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 py-6 border-t border-border/50">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="bg-card border-border/50 hover:bg-secondary/50 rounded-xl"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center text-sm font-medium px-4">
                        Page {page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="bg-card border-border/50 hover:bg-secondary/50 rounded-xl"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
