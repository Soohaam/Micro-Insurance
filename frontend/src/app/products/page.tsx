"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter, ShieldCheck, MapPin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

interface Product {
  productId: string
  productName: string
  description: string
  company: {
    companyName: string
  }
  policyType: string
  coverageType: string
  baseRate: number
  sumInsuredMin: number
  sumInsuredMax: number
  regionsCovered: string[]
  companyWalletAddress?: string
  cost?: number
}

export default function BrowseProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [policyType, setPolicyType] = useState("all")
  const [coverageType, setCoverageType] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 100])

  useEffect(() => {
    fetchProducts()
  }, [policyType, coverageType])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (policyType !== "all") params.append("policyType", policyType)
      if (coverageType !== "all") params.append("coverageType", coverageType)

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/products?${params.toString()}`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.regionsCovered.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRate = product.baseRate >= priceRange[0] && product.baseRate <= priceRange[1]

    return matchesSearch && matchesRate
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-background border-b border-border/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold font-display mb-4 text-foreground"
            >
              Find the Perfect Insurance Coverage
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Browse our parametric insurance products designed for instant payouts and complete peace of mind.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto bg-card/40 p-4 rounded-2xl backdrop-blur-xl border border-border/50"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 opacity-70" />
              <Input
                placeholder="Search by name, company, or region..."
                className="pl-10 bg-secondary/50 border-border/50 focus-visible:ring-0 focus-visible:border-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="md:w-auto w-full bg-primary hover:bg-primary/90">
              Search Products
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 space-y-6 flex-shrink-0"
          >
            <div className="bg-card/40 p-6 rounded-2xl border border-border/50 backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-2 font-semibold text-lg font-display">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Policy Type</Label>
                <Select value={policyType} onValueChange={setPolicyType}>
                  <SelectTrigger className="bg-secondary/50 border-border/50">
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
                <Label className="text-sm font-medium">Coverage Type</Label>
                <Select value={coverageType} onValueChange={setCoverageType}>
                  <SelectTrigger className="bg-secondary/50 border-border/50">
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
                <Label className="text-sm font-medium">Premium Rate (%)</Label>
                <Slider defaultValue={[0, 100]} max={100} step={1} value={priceRange} onValueChange={setPriceRange} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0]}%</span>
                  <span>{priceRange[1]}%</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-border/50 hover:bg-secondary/50 bg-transparent"
                onClick={() => {
                  setPolicyType("all")
                  setCoverageType("all")
                  setPriceRange([0, 100])
                  setSearchQuery("")
                }}
              >
                Reset Filters
              </Button>
            </div>
          </motion.div>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/50 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col bg-card/40 border-border/50 backdrop-blur-xl group hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <Badge
                            variant="secondary"
                            className="capitalize bg-primary/10 text-primary border-primary/20"
                          >
                            {product.policyType}
                          </Badge>
                          <Badge variant="outline" className="capitalize border-border/50">
                            {product.coverageType}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                          {product.productName}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <ShieldCheck className="h-3 w-3" />
                          {product.company.companyName}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{product.regionsCovered.join(", ")}</span>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                            <span className="text-sm font-medium">Base Premium:</span>
                            <span className="font-bold text-primary">{product.baseRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                        >
                          <Link href={`/products/${product.productId}/purchase`}>
                            Purchase
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
