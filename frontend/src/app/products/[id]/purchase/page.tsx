'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Shield, MapPin, Calendar, Activity, CheckCircle, Wallet } from 'lucide-react';
import axios from 'axios';
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import { toast } from 'sonner';

interface Product {
  productId: string;
  productName: string;
  description: string;
  company: {
    companyId: string;
    companyName: string;
    companyEmail: string;
    companyWalletAddress?: string;
  };
  policyType: string;
  coverageType: string;
  baseRate: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  duration: number;
  oracleTriggerType: string;
  triggerThreshold: {
    min: number | null;
    max: number | null;
    unit: string;
  };
  regionsCovered: string[];
  cost?: number;
}

export default function PurchaseProduct() {
  const params = useParams();
  const router = useRouter();
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!product) return;

    try {
      setPurchasing(true);

      // Here you would implement the actual purchase logic
      // For now, just showing a success message
      toast.success('Purchase functionality coming soon!');

      // TODO: Implement smart contract interaction
      // TODO: Create policy in backend
      // TODO: Navigate to confirmation page

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      {/* Sticky Header with Wallet */}
      <header className="border-b border-slate-800/30 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">Purchase Insurance</span>
            </div>
          </div>

          {/* ConnectButton */}
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Micro Insurance Platform",
              url: "https://yourdomain.com",
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-4xl pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="text-sm px-3 py-1 capitalize" variant="default">
                    {product.policyType}
                  </Badge>
                  <Badge className="text-sm px-3 py-1 capitalize" variant="secondary">
                    {product.coverageType}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-white">{product.productName}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-lg mt-2 text-slate-300">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Provided by <span className="font-semibold text-emerald-400">{product.company.companyName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">About this Policy</h3>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-white">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Trigger Condition
                    </h4>
                    <p className="text-sm text-slate-400 mb-1">
                      When {product.oracleTriggerType} reaches:
                    </p>
                    <p className="text-lg font-medium text-slate-200">
                      {product.triggerThreshold.min !== null
                        ? `Below ${product.triggerThreshold.min} ${product.triggerThreshold.unit}`
                        : `Above ${product.triggerThreshold.max} ${product.triggerThreshold.unit}`}
                    </p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-white">
                      <MapPin className="h-4 w-4 text-green-500" />
                      Coverage Area
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {product.regionsCovered.map((region, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-700">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-white">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Duration
                    </h4>
                    <p className="text-lg font-medium text-slate-200">{product.duration} Days</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-white">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      Sum Insured Range
                    </h4>
                    <p className="text-lg font-medium text-slate-200">
                      {product.sumInsuredMin} - {product.sumInsuredMax} ETH
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-emerald-500/20 shadow-lg bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="bg-emerald-500/10 pb-4">
                <CardTitle className="text-white">Purchase Summary</CardTitle>
                <CardDescription className="text-slate-300">Review and confirm your purchase</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Product</span>
                    <span className="font-medium text-white">{product.productName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Provider</span>
                    <span className="font-medium text-white">{product.company.companyName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage Period</span>
                    <span className="font-medium text-white">{product.duration} Days</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex justify-between items-end">
                  <span className="font-semibold text-white">Total Cost</span>
                  <span className="text-3xl font-bold text-emerald-400">
                    {product.cost ? `${product.cost} ETH` : 'N/A'}
                  </span>
                </div>

                <Separator className="bg-slate-700" />

                {/* Wallet Status */}
                {account?.address ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-emerald-400 text-sm">Wallet Connected</h4>
                        <p className="text-xs font-mono text-emerald-300 truncate">
                          {account.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg text-center">
                    <Wallet className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                    <p className="text-sm text-slate-400 mb-3">Connect wallet to purchase</p>
                    <ConnectButton
                      client={client}
                      appMetadata={{
                        name: "Micro Insurance Platform",
                        url: "https://yourdomain.com",
                      }}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePurchase}
                  disabled={!account?.address || purchasing || !product.cost}
                  className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
