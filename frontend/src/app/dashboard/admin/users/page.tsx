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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Search, MoreHorizontal, UserCheck, UserX, ArrowLeft, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'none';
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AdminUsers() {
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter;

    return matchesSearch && matchesKyc;
  });

  const getKycBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      none: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
      <Badge variant="outline" className={`border ${styles[status] || styles.none}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/admin")}
              className="mb-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 inline-block">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage platform users and view their status</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5" />
            Total Users: {users.length}
          </div>
        </div>

        <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl">All Registered Users</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-[300px] bg-secondary/30 border-border/50 focus:ring-purple-500"
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                >
                  <option value="all">All KYC Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="none">Not Submitted</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                      <TableHead className="py-4">User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p>No users found matching your filters.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user._id} className="hover:bg-purple-500/5 border-b border-border/50 transition-colors">
                          <TableCell className="py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">{user.role}</TableCell>
                          <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                            >
                              {user.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-400">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border backdrop-blur-xl">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'inactive' : 'active')}
                                  className="cursor-pointer focus:bg-purple-500/20"
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4 text-red-400" /> <span className="text-red-400">Deactivate Account</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4 text-green-400" /> <span className="text-green-400">Activate Account</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
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
      </div>
    </div>
  );
}
