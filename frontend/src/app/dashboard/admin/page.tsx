"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Building2, FileCheck, Package, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage platform operations and approvals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Total Users</CardTitle>
              <Users className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.users?.total || 0}</div>
              <p className="text-xs text-purple-300 mt-1">
                {stats?.users?.verified || 0} verified
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Companies</CardTitle>
              <Building2 className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.companies?.total || 0}</div>
              <p className="text-xs text-blue-300 mt-1">
                {stats?.companies?.approved || 0} approved
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Policies</CardTitle>
              <FileCheck className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.policies?.total || 0}</div>
              <p className="text-xs text-emerald-300 mt-1">
                {stats?.policies?.active || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Claims</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.claims?.total || 0}</div>
              <p className="text-xs text-orange-300 mt-1">
                {stats?.claims?.paid || 0} paid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pending Approvals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="bg-slate-900/50 border-slate-800 hover:border-yellow-500/50 transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/admin/kyc')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-3xl font-bold text-yellow-400">
                    {stats?.users?.pendingKYC || 0}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">KYC Verifications</h3>
                <p className="text-sm text-slate-400">Pending user KYC approvals</p>
                <Button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600">
                  Review KYC →
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/admin/companies')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-3xl font-bold text-blue-400">
                    {stats?.companies?.pending || 0}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Company Registrations</h3>
                <p className="text-sm text-slate-400">Pending company approvals</p>
                <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600">
                  Review Companies →
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/admin/products')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-3xl font-bold text-emerald-400">
                    {stats?.products?.pending || 0}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Product Approvals</h3>
                <p className="text-sm text-slate-400">Pending product reviews</p>
                <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600">
                  Review Products →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Platform Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/admin/kyc')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage KYC
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/admin/companies')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Companies
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/admin/products')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">System operational</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{stats?.users?.total || 0} total users</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">{stats?.policies?.active || 0} active policies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
