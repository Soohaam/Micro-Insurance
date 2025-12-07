'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Thirdweb Wallet Button - Same as your working pages
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client"; // Make sure this path matches your working setup

interface ProductFormData {
  productName: string;
  description: string;
  policyType: string;
  coverageType: string;
  sumInsuredMin: number;
  sumInsuredMax: number;
  baseRate: number;
  duration: number;
  oracleTriggerType: string;
  triggerThreshold: {
    min: number | null;
    max: number | null;
    unit: string;
  };
  payoutFormula: string;
  regionsCovered: string[];
  maxPoliciesPerUser: number;
  companyWalletAddress: string;
}

const policyTypes = ['crop', 'livestock', 'fisherman', 'weather'];
const coverageTypes = ['flood', 'drought', 'cyclone', 'heatwave', 'frost', 'pest'];
const oracleTriggers = ['rainfall', 'temperature', 'windspeed', 'humidity'];

export default function CreateProduct() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<string>('');

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    description: '',
    policyType: '',
    coverageType: '',
    sumInsuredMin: 10000,
    sumInsuredMax: 100000,
    baseRate: 5.0,
    duration: 180,
    oracleTriggerType: '',
    triggerThreshold: {
      min: null,
      max: null,
      unit: '',
    },
    payoutFormula: 'sumInsured * 1.0',
    regionsCovered: [],
    maxPoliciesPerUser: 2,
    companyWalletAddress: '',
  });

  // Auto-fill wallet address when wallet connects
  useEffect(() => {
    if (account?.address) {
      setFormData((prev) => ({ ...prev, companyWalletAddress: account.address }));
    }
  }, [account?.address]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThresholdChange = (field: 'min' | 'max' | 'unit', value: any) => {
    setFormData((prev) => ({
      ...prev,
      triggerThreshold: {
        ...prev.triggerThreshold,
        [field]: field === 'unit' ? value : value ? parseFloat(value) : null,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const regionArray = regions
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r);

      const payload = {
        ...formData,
        regionsCovered: regionArray,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/company/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/company');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        {/* Header */}
        <header className="border-b border-slate-800/30 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
          <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">Create Product</span>
            </div>
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Micro Insurance Platform",
                url: "https://yourdomain.com",
              }}
            />
          </div>
        </header>

        <div className="container mx-auto p-6 max-w-2xl pt-20">
          <Card className="border-green-500">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold">Product Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your product has been submitted and is awaiting admin approval.
                </p>
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <span className="text-xl font-bold text-white">Create New Product</span>
            </div>
          </div>

          {/* ConnectButton - Same as your working pages */}
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Micro Insurance Platform",
              url: "https://yourdomain.com",
            }}
          />
        </div>
      </header>

      {/* Main Form */}
      <div className="container mx-auto p-6 max-w-4xl pt-8">
        <div className="sm:hidden mb-6">
          <h1 className="text-2xl font-bold text-white">Create New Product</h1>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Insurance Product</CardTitle>
            <CardDescription className="text-slate-400">
              Fill in the details to create a new parametric insurance product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="e.g., Crop Flood Insurance - Maharashtra"
                    className="bg-slate-800/50 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWalletAddress">Company Wallet Address {account?.address ? '' : '(Optional)'}</Label>
                  <Input
                    id="companyWalletAddress"
                    value={formData.companyWalletAddress}
                    onChange={(e) => handleInputChange('companyWalletAddress', e.target.value)}
                    placeholder={account?.address || "0x..."}
                    className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                    disabled={!!account?.address}
                  />
                  {account?.address && (
                    <p className="text-emerald-400 text-xs mt-1">Auto-filled from connected wallet</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the insurance product and its benefits"
                    rows={4}
                    className="bg-slate-800/50 border-slate-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policyType">Policy Type *</Label>
                    <Select
                      value={formData.policyType}
                      onValueChange={(value) => handleInputChange('policyType', value)}
                      required
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Select policy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {policyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverageType">Coverage Type *</Label>
                    <Select
                      value={formData.coverageType}
                      onValueChange={(value) => handleInputChange('coverageType', value)}
                      required
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Select coverage type" />
                      </SelectTrigger>
                      <SelectContent>
                        {coverageTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Financial Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sumInsuredMin">Minimum Sum Insured (₹) *</Label>
                    <Input
                      id="sumInsuredMin"
                      type="number"
                      value={formData.sumInsuredMin}
                      onChange={(e) => handleInputChange('sumInsuredMin', parseFloat(e.target.value))}
                      min="1000"
                      className="bg-slate-800/50 border-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sumInsuredMax">Maximum Sum Insured (₹) *</Label>
                    <Input
                      id="sumInsuredMax"
                      type="number"
                      value={formData.sumInsuredMax}
                      onChange={(e) => handleInputChange('sumInsuredMax', parseFloat(e.target.value))}
                      min="1000"
                      className="bg-slate-800/50 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseRate">Base Rate (%) *</Label>
                    <Input
                      id="baseRate"
                      type="number"
                      step="0.1"
                      value={formData.baseRate}
                      onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value))}
                      min="0.1"
                      max="100"
                      className="bg-slate-800/50 border-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      min="1"
                      className="bg-slate-800/50 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPoliciesPerUser">Max Policies Per User *</Label>
                  <Input
                    id="maxPoliciesPerUser"
                    type="number"
                    value={formData.maxPoliciesPerUser}
                    onChange={(e) => handleInputChange('maxPoliciesPerUser', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="bg-slate-800/50 border-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Oracle Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Oracle Configuration</h3>

                <div className="space-y-2">
                  <Label htmlFor="oracleTriggerType">Oracle Trigger Type *</Label>
                  <Select
                    value={formData.oracleTriggerType}
                    onValueChange={(value) => handleInputChange('oracleTriggerType', value)}
                    required
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {oracleTriggers.map((trigger) => (
                        <SelectItem key={trigger} value={trigger}>
                          {trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thresholdMin">Threshold Min</Label>
                    <Input
                      id="thresholdMin"
                      type="number"
                      step="0.1"
                      value={formData.triggerThreshold.min || ''}
                      onChange={(e) => handleThresholdChange('min', e.target.value)}
                      placeholder="Optional"
                      className="bg-slate-800/50 border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thresholdMax">Threshold Max</Label>
                    <Input
                      id="thresholdMax"
                      type="number"
                      step="0.1"
                      value={formData.triggerThreshold.max || ''}
                      onChange={(e) => handleThresholdChange('max', e.target.value)}
                      placeholder="Optional"
                      className="bg-slate-800/50 border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thresholdUnit">Unit *</Label>
                    <Input
                      id="thresholdUnit"
                      value={formData.triggerThreshold.unit}
                      onChange={(e) => handleThresholdChange('unit', e.target.value)}
                      placeholder="e.g., mm, °C"
                      className="bg-slate-800/50 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payoutFormula">Payout Formula *</Label>
                  <Input
                    id="payoutFormula"
                    value={formData.payoutFormula}
                    onChange={(e) => handleInputChange('payoutFormula', e.target.value)}
                    placeholder="e.g., sumInsured * 1.0"
                    className="bg-slate-800/50 border-slate-700"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use 'sumInsured' as variable. Example: sumInsured * 0.8
                  </p>
                </div>
              </div>

              {/* Coverage Area */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Coverage Area</h3>

                <div className="space-y-2">
                  <Label htmlFor="regions">Regions Covered *</Label>
                  <Input
                    id="regions"
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                    placeholder="Enter regions separated by commas (e.g., Maharashtra, Gujarat, Rajasthan)"
                    className="bg-slate-800/50 border-slate-700"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple regions with commas
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}