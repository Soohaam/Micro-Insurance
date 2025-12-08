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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/50 bg-card/50 backdrop-blur-xl">
            <CardContent className="pt-10 pb-10">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Product Created Successfully!</h2>
                  <p className="text-muted-foreground">
                    Your product has been submitted and is awaiting admin approval.
                  </p>
                </div>
                <p className="text-sm text-primary animate-pulse">Redirecting to dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-secondary/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-lg font-semibold hidden sm:inline-block">Create Product</span>
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

      <div className="container mx-auto p-6 max-w-4xl pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Create New Insurance Product</CardTitle>
              <CardDescription>
                Fill in the details to create a new parametric insurance product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Basic Information
                  </h3>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder="e.g., Crop Flood Insurance - Maharashtra"
                        className="bg-background/50 border-border/50 focus:border-primary/50"
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
                        className="bg-background/50 border-border/50 font-mono text-sm"
                        disabled={!!account?.address}
                      />
                      {account?.address && (
                        <p className="text-primary text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Auto-filled from connected wallet
                        </p>
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
                        className="bg-background/50 border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="policyType">Policy Type *</Label>
                        <Select
                          value={formData.policyType}
                          onValueChange={(value) => handleInputChange('policyType', value)}
                          required
                        >
                          <SelectTrigger className="bg-background/50 border-border/50">
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
                          <SelectTrigger className="bg-background/50 border-border/50">
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
                </div>

                {/* Financial Details */}
                <div className="space-y-6 pt-4 border-t border-border/30">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-accent rounded-full" />
                    Financial Details
                  </h3>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Product Cost (ETH) *</Label>
                      <div className="relative">
                        <Input
                          id="cost"
                          type="number"
                          step="0.001"
                          value={formData.cost}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-background/50 border-border/50 pl-8"
                          required
                        />
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Ξ</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sumInsuredMin">Minimum Sum Insured (ETH) *</Label>
                        <Input
                          id="sumInsuredMin"
                          type="number"
                          step="0.001"
                          value={formData.sumInsuredMin}
                          onChange={(e) => handleInputChange('sumInsuredMin', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-background/50 border-border/50"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sumInsuredMax">Maximum Sum Insured (ETH) *</Label>
                        <Input
                          id="sumInsuredMax"
                          type="number"
                          step="0.001"
                          value={formData.sumInsuredMax}
                          onChange={(e) => handleInputChange('sumInsuredMax', parseFloat(e.target.value))}
                          min="0.001"
                          className="bg-background/50 border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="bg-background/50 border-border/50"
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
                          className="bg-background/50 border-border/50"
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
                        className="bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Oracle Configuration */}
                <div className="space-y-6 pt-4 border-t border-border/30">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-secondary rounded-full" />
                    Oracle Configuration
                  </h3>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="oracleTriggerType">Oracle Trigger Type *</Label>
                      <Select
                        value={formData.oracleTriggerType}
                        onValueChange={(value) => handleInputChange('oracleTriggerType', value)}
                        required
                      >
                        <SelectTrigger className="bg-background/50 border-border/50">
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
                          className="bg-background/50 border-border/50"
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
                          className="bg-background/50 border-border/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="thresholdUnit">Unit *</Label>
                        <Input
                          id="thresholdUnit"
                          value={formData.triggerThreshold.unit}
                          onChange={(e) => handleThresholdChange('unit', e.target.value)}
                          placeholder="e.g., mm, °C"
                          className="bg-background/50 border-border/50"
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
                        className="bg-background/50 border-border/50"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Use 'sumInsured' as variable. Example: sumInsured * 0.8
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coverage Area */}
                <div className="space-y-6 pt-4 border-t border-border/30">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary/50 rounded-full" />
                    Coverage Area
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="regions">Regions Covered *</Label>
                    <Input
                      id="regions"
                      value={regions}
                      onChange={(e) => setRegions(e.target.value)}
                      placeholder="Enter regions separated by commas (e.g., Maharashtra, Gujarat, Rajasthan)"
                      className="bg-background/50 border-border/50"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple regions with commas
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-11 border-border/50 hover:bg-secondary/50"
                  >
                    Cancel
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