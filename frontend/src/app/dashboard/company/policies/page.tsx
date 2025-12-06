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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      claimed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    };
    return (
      <Badge variant="outline" className={`border-0 ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policies Management</h1>
          <p className="text-muted-foreground">View and track all sold policies</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Policies</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policy, product, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Sum Insured</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                          No policies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPolicies.map((policy) => (
                        <TableRow key={policy._id}>
                          <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                          <TableCell>{policy.product.productName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{policy.user.name}</span>
                              <span className="text-xs text-muted-foreground">{policy.user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>₹{policy.sumInsured.toLocaleString()}</TableCell>
                          <TableCell>₹{policy.premiumPaid.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-xs">
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
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
