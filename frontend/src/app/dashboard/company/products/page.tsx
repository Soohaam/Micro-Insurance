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
import { Loader2, MoreHorizontal, Plus, Search, Filter, ArrowLeft, Package } from 'lucide-react';
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
      approved: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
      inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
      <Badge variant="outline" className={`border ${styles[status] || styles.pending} uppercase text-xs px-2.5 py-0.5`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
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
            <h1 className="text-3xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 inline-block">
              Manage Products
            </h1>
            <p className="text-muted-foreground text-lg">View and manage your insurance products</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/company/products/create')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/20 h-10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Product
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
                  <Package className="w-5 h-5 text-blue-400" />
                  <CardTitle className="font-display text-lg">All Products</CardTitle>
                  <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20">{filteredProducts.length}</Badge>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full md:w-[280px] bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      className="h-10 pl-9 pr-4 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-background/80 transition-colors w-[150px]"
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="text-muted-foreground font-semibold py-4 pl-6">Product Name</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Coverage</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Base Rate</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Sum Insured Range</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-right text-muted-foreground font-semibold pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <Package className="w-10 h-10" />
                              <p>No products found matching your criteria.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product._id} className="hover:bg-blue-500/5 transition-colors border-b border-border/50">
                            <TableCell className="font-medium text-foreground py-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/10">
                                  <Package className="w-4 h-4 text-blue-400" />
                                </div>
                                <span>{product.productName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize text-muted-foreground">
                              <Badge variant="secondary" className="bg-secondary/50 font-normal">
                                {product.policyType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize text-muted-foreground">
                              <Badge variant="secondary" className="bg-secondary/50 font-normal">
                                {product.coverageType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-blue-400 font-medium">{product.baseRate}%</TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              <span className="text-foreground">{product.sumInsuredMin}</span> - <span className="text-foreground">{product.sumInsuredMax}</span> ETH
                            </TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell className="text-right pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-400">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border backdrop-blur-xl">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/company/products/${product._id}`)}
                                    className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  {product.status !== 'active' && product.status !== 'rejected' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/dashboard/company/products/${product._id}/edit`)
                                      }
                                      className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                    >
                                      Edit Product
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-border/50" />
                                  {product.status === 'active' && (
                                    <DropdownMenuItem
                                      className="text-red-400 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
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
    </div>
  );
}
