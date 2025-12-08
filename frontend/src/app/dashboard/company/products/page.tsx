'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

export default function ManageProducts() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/company/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedProducts = (response.data.products || []).map((p: any) => {
        let status = p.approvalStatus; // pending, approved, rejected
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
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (productId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/company/products/${productId}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Product deactivated successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      approved: 'bg-primary/10 text-primary border-primary/20',
      active: 'bg-accent/10 text-accent border-accent/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      inactive: 'bg-muted text-muted-foreground border-border',
    };
    return (
      <Badge variant="outline" className={`border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto p-6 space-y-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Manage Products</h1>
          <p className="text-muted-foreground">View and manage your insurance products</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/company/products/create')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Product
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
              <CardTitle className="font-display">Products List</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
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
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow className="hover:bg-secondary/30 border-border/50">
                      <TableHead className="text-muted-foreground font-semibold">Product Name</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Coverage</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Base Rate</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Sum Insured Range</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                          No products found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product._id} className="hover:bg-card/60 transition-colors border-border/50">
                          <TableCell className="font-medium text-foreground">{product.productName}</TableCell>
                          <TableCell className="capitalize text-muted-foreground">{product.policyType}</TableCell>
                          <TableCell className="capitalize text-muted-foreground">{product.coverageType}</TableCell>
                          <TableCell className="font-mono text-foreground">{product.baseRate}%</TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.sumInsuredMin.toLocaleString()} - {product.sumInsuredMax.toLocaleString()} ETH
                          </TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-secondary/50">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border/50 backdrop-blur-xl">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/company/products/${product._id}`)}
                                  className="cursor-pointer focus:bg-primary/10"
                                >
                                  View Details
                                </DropdownMenuItem>
                                {product.status !== 'active' && product.status !== 'rejected' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/dashboard/company/products/${product._id}/edit`)
                                    }
                                    className="cursor-pointer focus:bg-primary/10"
                                  >
                                    Edit Product
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-border/50" />
                                {product.status === 'active' && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                    onClick={() => handleDeactivate(product._id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
