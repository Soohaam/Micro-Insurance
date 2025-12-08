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
import { Loader2, Search, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
      active: 'bg-primary/10 text-primary border-primary/20',
      expired: 'bg-muted text-muted-foreground border-border',
      claimed: 'bg-accent/10 text-accent border-accent/20',
    };
    return (
      <Badge variant="outline" className={`border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto p-6 space-y-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Policies Management</h1>
          <p className="text-muted-foreground">View and track all sold policies</p>
        </div>
        <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="font-display">All Policies</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search policy, product, or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[300px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow className="hover:bg-secondary/30 border-border/50">
                        <TableHead className="text-muted-foreground font-semibold">Policy Number</TableHead>
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
                          <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                            No policies found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPolicies.map((policy) => (
                          <TableRow key={policy._id} className="hover:bg-card/60 transition-colors border-border/50">
                            <TableCell className="font-mono text-foreground">{policy.policyNumber}</TableCell>
                            <TableCell className="font-medium text-foreground">{policy.product.productName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{policy.user.name}</span>
                                <span className="text-xs text-muted-foreground">{policy.user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{policy.sumInsured.toLocaleString()} ETH</TableCell>
                            <TableCell className="font-bold text-foreground">{policy.premiumPaid.toLocaleString()} ETH</TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                <p>Start: {new Date(policy.startDate).toLocaleDateString()}</p>
                                <p>End: {new Date(policy.endDate).toLocaleDateString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(policy.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="bg-card border-border/50 hover:bg-secondary/50"
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
                      className="bg-card border-border/50 hover:bg-secondary/50"
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
  );
}
