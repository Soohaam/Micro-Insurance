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
      setProfile(response.data.user); // Assuming user object holds company data or linked company
      setWalletAddress(response.data.user.walletAddress || '');
      // If company data is nested, adjust accordingly. 
      // Typically company profile comes from /api/company/profile but checklist says /api/auth/profile for both for simplicity or shared user model.
      // If separate company model, we might need another call.
      // Based on typical structure, checks if "company" field exists in user or if user IS the company representation.
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
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Registration information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approval Status</Label>
              <div>
                <Badge variant={profile?.status === 'approved' ? 'default' : 'secondary'}>
                  {profile?.status ? profile.status.toUpperCase() : 'PENDING'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Wallet</CardTitle>
            <CardDescription>Wallet used for premium collection & claim payouts</CardDescription>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
