'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Claim {
  _id: string;
  claimId: string;
  policy: {
    policyNumber: string;
    product: {
      productName: string;
    };
  };
  eventType: string; // e.g. "Flood", "Drought"
  claimAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  payoutDate?: string;
  transactionHash?: string;
  createdAt: string;
}

export default function MyClaims() {
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetchClaims();
  }, [token]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(response.data.claims || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return (
      <Badge variant="outline" className={`border-0 ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
          <p className="text-muted-foreground">Track your automated claim payouts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claims History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payout Tx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No claims found.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell className="font-medium">{claim.claimId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{claim.policy.product.productName}</span>
                          <span className="text-xs text-muted-foreground">
                            {claim.policy.policyNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{claim.eventType}</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell>₹{claim.claimAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {claim.transactionHash ? (
                          <a 
                            href={`https://etherscan.io/tx/${claim.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">How Claims Work</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Claims are triggered automatically by our Oracle system when weather conditions match your policy criteria. 
            Once triggered, payouts are processed instantly via smart contracts. You don't need to file manual claims.
          </p>
        </div>
      </div>
    </div>
  );
}
