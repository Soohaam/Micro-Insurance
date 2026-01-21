"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Shield,
  MapPin,
  Calendar,
  Activity,
  CheckCircle,
  Wallet,
  Copy,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import { useActiveAccount, ConnectButton, useSendTransaction, useWalletBalance } from "thirdweb/react"
import { client } from "@/app/client"
import { toast } from "sonner"
import { getContract, prepareContractCall, toWei } from "thirdweb"
import { sepolia } from "thirdweb/chains"

const CONTRACT_ADDRESS = "0xae39f8734faee1f4514c1a5203d0a0eaef1dd069"

const contract = getContract({
  client,
  chain: sepolia,
  address: CONTRACT_ADDRESS,
})

interface Product {
  productId: string
  productName: string
  description: string
  company: {
    companyId: string
    companyName: string
    companyEmail: string
  }
  companyWalletAddress?: string
  policyType: string
  coverageType: string
  baseRate: number
  sumInsuredMin: number
  sumInsuredMax: number
  duration: number
  oracleTriggerType: string
  triggerThreshold: {
    min: number | null
    max: number | null
    unit: string
  }
  regionsCovered: string[]
  cost?: number
}

export default function PurchaseProduct() {
  const params = useParams()
  const router = useRouter()
  const { token, user } = useAppSelector((state) => state.auth)
  const account = useActiveAccount()
  const { mutate: sendTransaction, isPending: isTransactionPending } = useSendTransaction()

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance({
    client,
    chain: sepolia,
    address: account?.address,
  })

  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (account?.address) {
      refetchBalance()
    }
  }, [account?.address, refetchBalance])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product details")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Wallet address copied!")
  }

  const handlePurchase = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first")
      return
    }
    if (!product) return

    const PREMIUM_AMOUNT = "0.001"
    const COVERAGE_AMOUNT = "1"

    try {
      setPurchasing(true)

      const transaction = prepareContractCall({
        contract,
        method: "function createPolicy(uint256 _coverageAmount) payable",
        params: [toWei(COVERAGE_AMOUNT)],
        value: toWei(PREMIUM_AMOUNT),
      })

      sendTransaction(transaction, {
        onSuccess: async (result) => {
          toast.success("Policy purchased successfully!")
          console.log("Transaction hash:", result.transactionHash)

          setTimeout(() => {
            refetchBalance()
          }, 2000)

          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/purchases`,
              {
                productId: product.productId,
                productName: product.productName,
                companyId: product.company.companyId,
                userWalletAddress: account.address,
                companyWalletAddress: product.companyWalletAddress,
                transactionHash: result.transactionHash,
                cost: PREMIUM_AMOUNT,
                duration: product.duration,
                coverageAmount: COVERAGE_AMOUNT,
                policyType: product.policyType,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            console.log("Purchase recorded in DB")
          } catch (apiError) {
            console.error("Failed to record purchase in DB", apiError)
            toast.error("Purchase on chain successful, but failed to save record.")
          }
        },
        onError: (error) => {
          console.error("Transaction failed:", error)
          toast.error("Transaction failed. Please try again.")
        },
      })
    } catch (error: any) {
      console.error("Purchase error:", error)
      toast.error(error.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.0000"
    return (Number(balance) / 1e18).toFixed(4)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[180px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-secondary/50">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-display font-bold text-foreground">Purchase</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {account?.address && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex items-center gap-2 bg-card/40 border border-border/50 px-3 py-2 rounded-lg backdrop-blur-xl text-sm"
              >
                <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-xs font-bold text-primary">
                    {isBalanceLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin inline" />
                    ) : (
                      `${formatBalance(balanceData?.value)} ETH`
                    )}
                  </span>
                </div>
              </motion.div>
            )}
            <ConnectButton
              client={client}
              appMetadata={{ name: "Micro Insurance Platform", url: "https://yourdomain.com" }}
              connectButton={{
                label: "Connect",
                className: "!px-4 !py-2 !text-sm",
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-8 pb-12 max-w-6xl relative z-10">
        {/* Product Title Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                {product.productName}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>by {product.company.companyName}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/20 capitalize">{product.policyType}</Badge>
              <Badge className="bg-secondary/50 text-muted-foreground border-border/50 capitalize">
                {product.coverageType}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">{product.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Policy Details Grid */}
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">Policy Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Trigger Condition</p>
                      <p className="text-sm font-medium text-foreground mb-1">When {product.oracleTriggerType}:</p>
                      <p className="text-base font-bold text-primary">
                        {product.triggerThreshold.min !== null
                          ? `Below ${product.triggerThreshold.min} ${product.triggerThreshold.unit}`
                          : `Above ${product.triggerThreshold.max} ${product.triggerThreshold.unit}`}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Duration</p>
                      <p className="text-base font-bold text-foreground">{product.duration} Days</p>
                      <p className="text-xs text-muted-foreground mt-1">Coverage period</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Sum Insured Range</p>
                      <p className="text-base font-bold text-foreground">
                        {product.sumInsuredMin.toLocaleString()} - {product.sumInsuredMax.toLocaleString()} ETH
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/40 border border-border/50 p-4 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Coverage Area</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.regionsCovered.map((region, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-secondary/50 border-border/50 text-muted-foreground text-xs"
                          >
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Payout Wallet Section */}
            {product.companyWalletAddress && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h2 className="text-xl font-display font-semibold text-foreground mb-4">Payout Information</h2>
                <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">How Claims Are Paid</p>
                        <p className="text-sm text-muted-foreground">
                          When a claim is triggered, funds are automatically paid to your wallet from the company&apos;s
                          payout address.
                        </p>
                      </div>
                    </div>
                    <div className="bg-secondary/30 border border-border/50 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Company Payout Address</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-primary/80 break-all flex-1">
                          {product.companyWalletAddress}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(product.companyWalletAddress!)}
                          className="hover:bg-secondary flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar - Purchase Summary */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50 shadow-lg bg-card/40 backdrop-blur-xl">
              <CardHeader className="bg-primary/10 pb-4 border-b border-border/50">
                <CardTitle className="font-display text-lg text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Purchase Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-semibold text-foreground text-right truncate max-w-[150px]">
                      {product.productName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-semibold text-foreground">{product.company.companyName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{product.duration} Days</span>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Price */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Premium</p>
                  <p className="text-2xl font-bold font-display text-primary">0.001 ETH</p>
                </div>

                {/* Wallet Info */}
                {account?.address ? (
                  <div className="space-y-3">
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary">Wallet Connected</p>
                          <p className="text-xs font-mono text-primary/80 truncate mt-1">{account.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/30 border border-border/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-semibold">Your Balance</span>
                        <span className="text-sm font-bold font-display text-primary">
                          {isBalanceLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin inline" />
                          ) : (
                            `${formatBalance(balanceData?.value)} ETH`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/30 border border-border/50 p-4 rounded-lg text-center space-y-3">
                    <Wallet className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                    <p className="text-xs text-muted-foreground">Connect your wallet to purchase</p>
                    <ConnectButton
                      client={client}
                      appMetadata={{ name: "Micro Insurance Platform", url: "https://yourdomain.com" }}
                      connectButton={{
                        label: "Connect Wallet",
                        className: "!w-full !text-xs",
                      }}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePurchase}
                  disabled={!account?.address || purchasing || isTransactionPending}
                  className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {purchasing || isTransactionPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Policy"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
