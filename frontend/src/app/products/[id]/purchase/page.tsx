'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Wallet, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Product {
  productId: string;
  productName: string;
  company: {
    companyName: string;
    walletAddress?: string; // Assuming company model has this, or use fallback
  };
  baseRate: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  duration: number;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PurchasePolicy() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // Form State
  const [sumInsured, setSumInsured] = useState<number>(0);
  const [premium, setPremium] = useState<number>(0);
  const [location, setLocation] = useState({
    lat: '',
    lng: '',
    district: '',
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Auth & KYC Check
    if (!user) {
      router.push(`/login?redirect=/products/${params.id}/purchase`);
      return;
    }

    // Check KYC status - Assuming user object has kycStatus
    // Note: If you need to fetch fresh user data, do it here. 
    // For now relying on stored user state.
    if ((user as any).kycStatus !== 'approved') {
      toast.error('Complete KYC to purchase policies');
      router.push('/kyc');
      return;
    }

    fetchProduct();

    // Initialize Sum Insured from URL
    const initialSum = parseFloat(searchParams.get('sumInsured') || '0');
    if (initialSum > 0) setSumInsured(initialSum);

    // Check if wallet is already connected
    checkWalletConnection();
  }, [user, params.id]);

  useEffect(() => {
    if (product && sumInsured) {
      setPremium((sumInsured * product.baseRate) / 100);
    }
  }, [sumInsured, product]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/products/${params.id}`);
      setProduct(response.data.product);
      if (!sumInsured) setSumInsured(response.data.product.sumInsuredMin);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (err) {
        console.error('Error checking wallet:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        toast.success('Wallet connected');
      } catch (error) {
        toast.error('Failed to connect wallet');
      }
    } else {
      toast.error('Please install MetaMask to continue');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          }));
          toast.success('Location fetched');
        },
        (error) => {
          toast.error('Unable to retrieve location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handlePurchase = async () => {
    if (!walletConnected) {
      toast.error('Connect wallet first');
      return;
    }
    if (!location.district || !location.lat || !location.lng) {
      toast.error('Please provide complete location details');
      return;
    }

    try {
      setProcessing(true);

      // 1. Trigger Payment (Simulation or Actual)
      // Sending 0 value transaction for now or mock value if we were on testnet
      // In production, this would use the calculated premium (converted to Wei)
      const transactionParameters = {
        to: '0x0000000000000000000000000000000000000000', // Burn address or Company Address
        from: walletAddress,
        value: '0x0', // 0 ETH for test, replace with premium in hex for real
        // data: ... (optional: smart contract function call data)
      };

      // Simulating payment transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      toast.info('Transaction submitted. Verifying purchase...');

      // 2. Submit to Backend
      const payload = {
        productId: product?.productId,
        sumInsured,
        startDate,
        location: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
          district: location.district,
        },
        walletAddress,
        transactionHash: txHash,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/policies/purchase`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Policy purchased successfully!');
      router.push('/dashboard/user/policies');

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Transaction failed or cancelled');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Cancel Purchase
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Configuration</CardTitle>
              <CardDescription>Finalize details for your {product.productName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-2">
                <Label>Sum Insured (Cover Amount)</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    value={sumInsured}
                    onChange={(e) => setSumInsured(Number(e.target.value))}
                    min={product.sumInsuredMin}
                    max={product.sumInsuredMax}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Range: {product.sumInsuredMin / 1000}k - {product.sumInsuredMax / 1000}k
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Coverage Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Insured Location</Label>
                  <Button variant="outline" size="sm" onClick={getCurrentLocation} type="button">
                    <MapPin className="mr-2 h-3 w-3" />
                    Use Current Location
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Latitude</Label>
                    <Input
                      value={location.lat}
                      onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                      placeholder="e.g. 19.0760"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Longitude</Label>
                    <Input
                      value={location.lng}
                      onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                      placeholder="e.g. 72.8777"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>District / Region</Label>
                  <Input
                    value={location.district}
                    onChange={(e) => setLocation(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="Enter your district"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Secure payment via Blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {!walletConnected ? (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="mb-4 text-muted-foreground">Connect your MetaMask wallet to pay the premium</p>
                  <Button onClick={connectWallet} size="lg" className="w-full md:w-auto">
                    Connect MetaMask
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Wallet Connected</h4>
                    <p className="text-sm font-mono text-green-700 dark:text-green-300">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setWalletConnected(false)}>
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/50">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Product</h4>
                <p className="font-medium">{product.productName}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sum Insured</span>
                  <span>₹{sumInsured.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate</span>
                  <span>{product.baseRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{product.duration} Days</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-end">
                <span className="font-semibold">Total to Pay</span>
                <span className="text-2xl font-bold text-primary">₹{premium.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handlePurchase}
                disabled={!walletConnected || processing || premium <= 0}
                className="w-full h-12 text-lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay & Activate Policy'
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              By proceeding, you agree to the Smart Contract terms. Claims will be triggered automatically based on Oracle data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
