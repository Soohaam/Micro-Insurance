'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, ArrowLeft, Shield, MapPin, Calendar,
  Activity, Info, AlertTriangle, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '@/store/hooks';

interface Product {
  productId: string;
  productName: string;
  description: string;
  company: {
    companyId: string;
    companyName: string;
    companyEmail: string;
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
  payoutFormula: string;
  regionsCovered: string[];
  companyWalletAddress?: string;
}

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [sumInsured, setSumInsured] = useState<number>(0);
  const [calculatedPremium, setCalculatedPremium] = useState<number>(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      // Simple calculation: (Sum Insured * Base Rate) / 100
      const premium = (sumInsured * product.baseRate) / 100;
      setCalculatedPremium(premium);
    }
  }, [sumInsured, product]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/products/${id}`);
      const data = response.data.product;
      setProduct(data);
      setSumInsured(data.sumInsuredMin);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      router.push(`/login?redirect=/products/${product?.productId}/purchase`);
      return;
    }
    router.push(`/products/${product?.productId}/purchase?sumInsured=${sumInsured}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="text-sm px-3 py-1 capitalize" variant="default">
                  {product.policyType}
                </Badge>
                <Badge className="text-sm px-3 py-1 capitalize" variant="secondary">
                  {product.coverageType}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold">{product.productName}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-lg mt-2">
                <Shield className="h-5 w-5 text-primary" />
                Provided by <span className="font-semibold text-primary">{product.company.companyName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">About this Policy</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    Trigger Condition
                  </h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    When {product.oracleTriggerType} reaches:
                  </p>
                  <p className="text-lg font-medium">
                    {product.triggerThreshold.min !== null
                      ? `Below ${product.triggerThreshold.min} ${product.triggerThreshold.unit}`
                      : `Above ${product.triggerThreshold.max} ${product.triggerThreshold.unit}`}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Coverage Area
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {product.regionsCovered.map((region, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-800">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {product.companyWalletAddress && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Company Wallet Address
                  </h4>
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {product.companyWalletAddress}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">Policy Terms</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Duration:</span> {product.duration} Days coverage period
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Payout Formula:</span> 100% of Sum Insured when trigger condition is met.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Waiting Period:</span> 48 hours for policy activation after purchase.
                    </div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Calculator */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle>Premium Calculator</CardTitle>
              <CardDescription>Estimate your insurance cost</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Sum Insured</label>
                  <span className="text-lg font-bold text-primary">
                    ₹{sumInsured.toLocaleString()}
                  </span>
                </div>

                <Slider
                  value={[sumInsured]}
                  min={product.sumInsuredMin}
                  max={product.sumInsuredMax}
                  step={1000}
                  onValueChange={(vals) => setSumInsured(vals[0])}
                  className="py-4"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ₹{product.sumInsuredMin.toLocaleString()}</span>
                  <span>Max: ₹{product.sumInsuredMax.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Rate</span>
                  <span className="font-medium">{product.baseRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">{product.duration} Days</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end">
                  <span className="font-semibold">Total Premium</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{calculatedPremium.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg h-12" onClick={handlePurchase}>
                Purchase Policy
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                Instant policy issuance on blockchain
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
