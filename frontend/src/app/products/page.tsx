'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Filter, ShieldCheck, MapPin } from 'lucide-react';
import axios from 'axios';

interface Product {
  productId: string;
  productName: string;
  description: string;
  company: {
    companyName: string;
  };
  policyType: string;
  coverageType: string;
  baseRate: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  regionsCovered: string[];
  companyWalletAddress?: string;
  cost?: number;
}

export default function BrowseProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [policyType, setPolicyType] = useState('all');
  const [coverageType, setCoverageType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]); // Percentage or Rate range

  useEffect(() => {
    fetchProducts();
  }, [policyType, coverageType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (policyType !== 'all') params.append('policyType', policyType);
      if (coverageType !== 'all') params.append('coverageType', coverageType);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/products?${params.toString()}`
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.regionsCovered.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRate = product.baseRate >= priceRange[0] && product.baseRate <= priceRange[1];

    return matchesSearch && matchesRate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Find the Perfect Insurance Coverage</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Browse our parametric insurance products designed for instant payouts and complete peace of mind.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 opacity-70" />
              <Input
                placeholder="Search by name, company, or region..."
                className="pl-10 bg-white text-gray-900 border-0 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="md:w-auto w-full bg-white text-primary hover:bg-gray-100">
              Search Products
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 space-y-6 flex-shrink-0">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </div>

              <div className="space-y-2">
                <Label>Policy Type</Label>
                <Select value={policyType} onValueChange={setPolicyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="crop">Crop Insurance</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="fisherman">Fisherman</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coverage Type</Label>
                <Select value={coverageType} onValueChange={setCoverageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Coverage</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="drought">Drought</SelectItem>
                    <SelectItem value="cyclone">Cyclone</SelectItem>
                    <SelectItem value="heatwave">Heatwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Premium Rate (%)</Label>
                <Slider
                  defaultValue={[0, 100]}
                  max={100}
                  step={1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0]}%</span>
                  <span>{priceRange[1]}%</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPolicyType('all');
                  setCoverageType('all');
                  setPriceRange([0, 100]);
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Card key={product.productId} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {product.policyType}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {product.coverageType}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl line-clamp-2">{product.productName}</CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <ShieldCheck className="h-3 w-3" />
                        {product.company.companyName}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {product.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{product.regionsCovered.join(', ')}</span>
                        </div>
                        <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                          <span className="text-sm font-medium">Base Premium:</span>
                          <span className="font-bold text-primary">{product.baseRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/products/${product.productId}/purchase`}>Purchase</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
