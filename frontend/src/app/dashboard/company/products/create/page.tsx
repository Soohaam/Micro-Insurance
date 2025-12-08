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
import { Loader2, ArrowLeft, CheckCircle, Wallet, Shield, LineChart, Sliders } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Thirdweb Wallet Button
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";

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
  cost: number;
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
    sumInsuredMin: 0.01,
    sumInsuredMax: 1.0,
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
    cost: 0.05,
  });

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
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Success Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-emerald-500/30 bg-card/60 backdrop-blur-2xl shadow-2xl">
            <CardContent className="pt-10 pb-10">
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/20"
                >
                  <CheckCircle className="h-12 w-12 text-emerald-500" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Success!</h2>
                  <p className="text-muted-foreground text-lg">
                    Product created and submitted for approval.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 animate-pulse bg-emerald-500/5 py-2 rounded-full mx-auto w-fit px-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to dashboard...
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-blue-500/30">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-blue-500/10 hover:text-blue-400 rounded-full pr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-lg font-semibold hidden sm:inline-block border-l border-border/50 pl-4 text-muted-foreground">Create Product</span>
          </div>

          <ConnectButton
            client={client}
            appMetadata={{
              name: "Micro Insurance Platform",
              url: "https://yourdomain.com",
            }}
            connectButton={{
              label: "Connect Wallet",
              className: "!bg-blue-500/10 !text-blue-400 !border !border-blue-500/20 !font-semibold !px-4 !py-2 !rounded-xl hover:!bg-blue-500/20 transition-all !h-9 !text-sm"
            }}
          />
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 inline-block mb-2">Create New Insurance Product</h1>
            <p className="text-muted-foreground text-lg">Define the parameters for your new parametric insurance contract.</p>
          </div>

          <Card className="bg-card/40 border-border/50 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Basic Information</h3>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="text-muted-foreground">Product Name <span className="text-red-400">*</span></Label>
                      <Input
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder="e.g., Seasonal Crop Protection - MH"
                        className="bg-secondary/40 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 text-lg transition-all rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="companyWalletAddress" className="text-muted-foreground">Company Wallet <span className="text-red-400">*</span></Label>
                        {account?.address && (
                          <span className="text-emerald-400 text-xs flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> Connected
                          </span>
                        )}
                      </div>
                      <Input
                        id="companyWalletAddress"
                        value={formData.companyWalletAddress}
                        onChange={(e) => handleInputChange('companyWalletAddress', e.target.value)}
                        placeholder={account?.address ? "Wallet Connected" : "Connect your wallet or enter address"}
                        className="bg-secondary/40 border-border/50 font-mono text-sm h-11 rounded-xl"
                        disabled={!!account?.address}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-muted-foreground">Description <span className="text-red-400">*</span></Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the coverage details, benefits, and exclusions..."
                        rows={4}
                        className="bg-secondary/40 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none rounded-xl transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="policyType" className="text-muted-foreground">Policy Type <span className="text-red-400">*</span></Label>
                        <Select
                          value={formData.policyType}
                          onValueChange={(value) => handleInputChange('policyType', value)}
                          required
                        >
                          <SelectTrigger className="bg-secondary/40 border-border/50 h-11 rounded-xl">
                            <SelectValue placeholder="Select type" />
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
                        <Label htmlFor="coverageType" className="text-muted-foreground">Coverage Type <span className="text-red-400">*</span></Label>
                        <Select
                          value={formData.coverageType}
                          onValueChange={(value) => handleInputChange('coverageType', value)}
                          required
                        >
                          <SelectTrigger className="bg-secondary/40 border-border/50 h-11 rounded-xl">
                            <SelectValue placeholder="Select coverage" />
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
                </div>

                <div className="h-px bg-border/40 w-full" />

                {/* Financial Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <LineChart className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Financial Parameters</h3>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-muted-foreground">Policy Cost (ETH) <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Input
                          id="cost"
                          type="number"
                          step="0.001"
                          value={formData.cost}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-secondary/40 border-border/50 pl-10 h-12 text-lg font-mono rounded-xl group-hover:border-blue-500/30"
                          required
                        />
                        <span className="absolute left-3 top-3 text-muted-foreground text-lg">Ξ</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sumInsuredMin" className="text-muted-foreground">Min Sum Insured (ETH)</Label>
                        <Input
                          id="sumInsuredMin"
                          type="number"
                          step="0.001"
                          value={formData.sumInsuredMin}
                          onChange={(e) => handleInputChange('sumInsuredMin', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-secondary/40 border-border/50 h-11 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sumInsuredMax" className="text-muted-foreground">Max Sum Insured (ETH)</Label>
                        <Input
                          id="sumInsuredMax"
                          type="number"
                          step="0.001"
                          value={formData.sumInsuredMax}
                          onChange={(e) => handleInputChange('sumInsuredMax', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-secondary/40 border-border/50 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="baseRate" className="text-muted-foreground">Base Premium Rate (%)</Label>
                        <div className="relative">
                          <Input
                            id="baseRate"
                            type="number"
                            step="0.1"
                            value={formData.baseRate}
                            onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value))}
                            min="0.1"
                            max="100"
                            className="bg-secondary/40 border-border/50 h-11 rounded-xl pr-8"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-muted-foreground">Policy Duration (days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                          min="1"
                          className="bg-secondary/40 border-border/50 h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxPoliciesPerUser" className="text-muted-foreground">Max Policies Per User</Label>
                      <Input
                        id="maxPoliciesPerUser"
                        type="number"
                        value={formData.maxPoliciesPerUser}
                        onChange={(e) => handleInputChange('maxPoliciesPerUser', parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="bg-secondary/40 border-border/50 h-11 rounded-xl max-w-[200px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/40 w-full" />

                {/* Oracle Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Oracle Configuration</h3>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="oracleTriggerType" className="text-muted-foreground">Trigger Type <span className="text-red-400">*</span></Label>
                      <Select
                        value={formData.oracleTriggerType}
                        onValueChange={(value) => handleInputChange('oracleTriggerType', value)}
                        required
                      >
                        <SelectTrigger className="bg-secondary/40 border-border/50 h-11 rounded-xl">
                          <SelectValue placeholder="Select trigger mechanism" />
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
                        <Label htmlFor="thresholdMin" className="text-muted-foreground">Min Threshold</Label>
                        <Input
                          id="thresholdMin"
                          type="number"
                          step="0.1"
                          value={formData.triggerThreshold.min || ''}
                          onChange={(e) => handleThresholdChange('min', e.target.value)}
                          placeholder="Inclusive"
                          className="bg-secondary/40 border-border/50 h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="thresholdMax" className="text-muted-foreground">Max Threshold</Label>
                        <Input
                          id="thresholdMax"
                          type="number"
                          step="0.1"
                          value={formData.triggerThreshold.max || ''}
                          onChange={(e) => handleThresholdChange('max', e.target.value)}
                          placeholder="Exclusive"
                          className="bg-secondary/40 border-border/50 h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="thresholdUnit" className="text-muted-foreground">Unit <span className="text-red-400">*</span></Label>
                        <Input
                          id="thresholdUnit"
                          value={formData.triggerThreshold.unit}
                          onChange={(e) => handleThresholdChange('unit', e.target.value)}
                          placeholder="e.g., mm"
                          className="bg-secondary/40 border-border/50 h-10 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payoutFormula" className="text-muted-foreground">Payout Formula <span className="text-red-400">*</span></Label>
                      <div className="relative">
                        <Input
                          id="payoutFormula"
                          value={formData.payoutFormula}
                          onChange={(e) => handleInputChange('payoutFormula', e.target.value)}
                          placeholder="e.g., sumInsured * 1.0"
                          className="bg-slate-950/50 border-border/50 font-mono text-sm h-12 rounded-xl border-blue-500/20"
                          required
                        />
                        <div className="absolute right-3 top-3 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Smart Contract Ready</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use variable <code className="bg-secondary/50 px-1 rounded">sumInsured</code>. Example: <code className="text-blue-400">sumInsured * 0.8</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/40 w-full" />

                {/* Coverage Area */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Coverage Region</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regions" className="text-muted-foreground">Target Regions <span className="text-red-400">*</span></Label>
                    <Input
                      id="regions"
                      value={regions}
                      onChange={(e) => setRegions(e.target.value)}
                      placeholder="e.g., Maharashtra, Gujarat, Rajasthan (Comma separated)"
                      className="bg-secondary/40 border-border/50 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20 text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 border-border/50 hover:bg-secondary/50 rounded-xl px-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 rounded-xl shadow-lg shadow-blue-500/20 font-semibold text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Deploying Product...
                      </>
                    ) : (
                      'Create & Deploy Product'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}