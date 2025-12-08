'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Wallet, FileCheck, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CompanyProfile() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.user);
      setWalletAddress(response.data.user.walletAddress || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const newAddress = accounts[0];
        setWalletAddress(newAddress);
        updateWallet(newAddress);
      } catch (error) {
        toast.error('Failed to connect wallet');
      }
    } else {
      toast.error('Please install MetaMask');
    }
  };

  const updateWallet = async (address: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/wallet`,
        { walletAddress: address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Wallet address updated successfully');
    } catch (error) {
      toast.error('Failed to update wallet address');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 min-h-screen bg-background items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/company")}
            className="mb-4 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 inline-block">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company details and wallet connection</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-blue-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  Company Details
                </CardTitle>
                <CardDescription>Registration and verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Company Name</Label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <span className="font-semibold text-lg">{profile?.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-sm">{profile?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Approval Status</Label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <ShieldCheck className={`h-5 w-5 ${profile?.status === 'approved' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                    <Badge
                      variant="outline"
                      className={profile?.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                    >
                      {profile?.status ? profile.status.toUpperCase() : 'PENDING'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-indigo-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Wallet className="h-5 w-5" />
                  </div>
                  Payout Wallet
                </CardTitle>
                <CardDescription>Wallet for premium collection & payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Connected Wallet</Label>
                  <div className="relative">
                    <Input
                      value={walletAddress}
                      placeholder="No wallet connected"
                      readOnly
                      className="font-mono text-sm bg-secondary/30 border-border/50 h-12 rounded-xl pl-10"
                    />
                    <div className="absolute left-3 top-3.5 text-indigo-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={connectWallet}
                    className="w-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 h-12 rounded-xl shadow-lg shadow-indigo-500/5 transition-all"
                    variant="outline"
                  >
                    {walletAddress ? 'Update Wallet Address' : 'Connect Wallet'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  This wallet will be used to deploy insurance contracts and receive premiums.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
