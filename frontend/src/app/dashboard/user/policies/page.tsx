'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Calendar, ArrowRight, Search, FileText } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Policy {
  _id: string;
  policyNumber: string;
  product: {
    productName: string;
    coverageType: string;
  };
  company: {
    name: string;
  };
  sumInsured: number;
  premiumPaid: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'claimed';
  daysRemaining: number;
}

export default function MyPolicies() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPolicies();
  }, [token]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicies(response.data.policies || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
      case 'claimed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Policies</h1>
          <p className="text-muted-foreground">Manage your insurance portfolio</p>
        </div>
        <Button onClick={() => router.push('/products')}>
          Browse New Products
        </Button>
      </div>

      <div className="flex gap-2 pb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button 
          variant={filter === 'active' ? 'default' : 'outline'} 
          onClick={() => setFilter('active')}
          size="sm"
        >
          Active
        </Button>
        <Button 
          variant={filter === 'expired' ? 'default' : 'outline'} 
          onClick={() => setFilter('expired')}
          size="sm"
        >
          Expired
        </Button>
        <Button 
          variant={filter === 'claimed' ? 'default' : 'outline'} 
          onClick={() => setFilter('claimed')}
          size="sm"
        >
          Claimed
        </Button>
      </div>

      {filteredPolicies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">You haven't purchased any insurance policies yet.</p>
            <Button onClick={() => router.push('/products')}>Find Insurance</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPolicies.map((policy) => (
            <Card key={policy._id} className="flex flex-col group hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`capitalize ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    #{policy.policyNumber}
                  </span>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {policy.product.productName}
                </CardTitle>
                <CardDescription>{policy.company.name}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Sum Insured</p>
                    <p className="font-semibold">₹{policy.sumInsured.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Premium</p>
                    <p className="font-semibold">₹{policy.premiumPaid.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Ends: {new Date(policy.endDate).toLocaleDateString()}</span>
                  </div>
                  {policy.status === 'active' && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Shield className="h-4 w-4" />
                      <span>{policy.daysRemaining} days remaining</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button user-select="none" asChild className="w-full" variant="secondary">
                  <Link href={`/dashboard/user/policies/${policy._id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
