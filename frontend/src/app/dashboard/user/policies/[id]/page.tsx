'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CloudRain, Activity, CheckCircle, ExternalLink, Download } from 'lucide-react';
import axios from 'axios';

interface PolicyDetailsType {
  _id: string;
  policyNumber: string;
  product: {
    productName: string;
    oracleTriggerType: string;
    triggerThreshold: {
      min: number;
      max: number;
      unit: string;
    };
  };
  company: {
    name: string;
  };
  sumInsured: number;
  premiumPaid: number;
  startDate: string;
  endDate: string;
  status: string;
  transactionHash?: string;
}

interface OracleStatus {
  lastChecked: string;
  currentValue: number;
  status: 'normal' | 'triggered';
  location: string;
}

export default function PolicyDetails() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyDetailsType | null>(null);
  const [oracleStatus, setOracleStatus] = useState<OracleStatus | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPolicyDetails(params.id as string);
    }
  }, [params.id, token]);

  const fetchPolicyDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/policies/${id}/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolicy(response.data.policy);
      setOracleStatus(response.data.oracleStatus);
    } catch (error) {
      console.error('Error fetching policy details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!policy) {
    return <div className="p-6">Policy not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Policies
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{policy.product.productName}</CardTitle>
                  <CardDescription>Policy #{policy.policyNumber}</CardDescription>
                </div>
                <Badge 
                  variant={policy.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {policy.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Insurer</h4>
                  <p className="font-semibold">{policy.company.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Period</h4>
                  <p className="font-medium">
                    {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Sum Insured</h4>
                  <p className="font-semibold text-lg">₹{policy.sumInsured.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Premium Paid</h4>
                  <p className="font-semibold text-lg">₹{policy.premiumPaid.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Transaction Details</h3>
                <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Transaction Hash</p>
                    <p className="font-mono text-xs mt-1 truncate w-48 md:w-auto">
                      {policy.transactionHash || 'N/A'}
                    </p>
                  </div>
                  {policy.transactionHash && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://etherscan.io/tx/${policy.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                       <ExternalLink className="h-4 w-4 mr-2" /> Verify
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Policy Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Oracle Monitor Sidebar */}
        <div className="space-y-6">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Oracle Monitor</CardTitle>
              </div>
              <CardDescription>Live data from chainlink oracles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center bg-background p-3 rounded shadow-sm">
                <span className="text-sm text-muted-foreground">Trigger Type</span>
                <span className="font-medium capitalize">{policy.product.oracleTriggerType}</span>
              </div>

              <div className="flex justify-between items-center bg-background p-3 rounded shadow-sm">
                <span className="text-sm text-muted-foreground">Threshold</span>
                <span className="font-bold text-red-500">
                  {policy.product.triggerThreshold.min 
                    ? `< ${policy.product.triggerThreshold.min}`
                    : `> ${policy.product.triggerThreshold.max}`
                  } {policy.product.triggerThreshold.unit}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Reading</span>
                  <span className="font-mono font-bold">
                    {oracleStatus ? `${oracleStatus.currentValue} ${policy.product.triggerThreshold.unit}` : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Last Checked</span>
                  <span>
                    {oracleStatus ? new Date(oracleStatus.lastChecked).toLocaleTimeString() : '-'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                <Activity className="h-3 w-3" />
                <span>Oracle is active and monitoring</span>
              </div>
            </CardContent>
          </Card>

          {policy.status === 'active' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Policy is Active</p>
                    <p className="text-xs text-muted-foreground">
                      Your coverage is valid until {new Date(policy.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
