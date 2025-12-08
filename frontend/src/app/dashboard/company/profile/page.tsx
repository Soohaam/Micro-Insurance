'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Wallet, FileCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CompanyProfile() {
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
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground container px-6 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company details and wallet connection</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Details
                </CardTitle>
                <CardDescription>Registration and verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Company Name</Label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                    <span className="font-semibold">{profile?.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{profile?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Approval Status</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={profile?.status === 'approved' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-secondary-foreground'}
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
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-accent" />
                  Payout Wallet
                </CardTitle>
                <CardDescription>Wallet for premium collection & payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Wallet Address</Label>
                  <Input
                    value={walletAddress}
                    placeholder="No wallet connected"
                    readOnly
                    className="font-mono text-sm bg-background/50 border-border/50"
                  />
                </div>

                <Button
                  onClick={connectWallet}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  variant="outline"
                >
                  {walletAddress ? 'Update Wallet Address' : 'Connect Wallet'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
