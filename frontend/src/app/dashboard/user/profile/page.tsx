'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Wallet, ShieldCheck, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
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
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update wallet address');
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{profile.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex gap-2">
                <Badge variant={profile.kycStatus === 'approved' ? 'default' : 'secondary'}>
                  KYC: {profile.kycStatus.toUpperCase()}
                </Badge>
                <Badge variant={profile.status === 'active' ? 'outline' : 'destructive'}>
                  {profile.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Configuration</CardTitle>
            <CardDescription>Manage your connected wallet for payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={walletAddress}
                placeholder="No wallet connected"
                readOnly
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={connectWallet} className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              {walletAddress ? 'Update Wallet' : 'Connect Wallet'}
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This wallet will be used for policy purchases and claim payouts. Ensure you have access to this wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
