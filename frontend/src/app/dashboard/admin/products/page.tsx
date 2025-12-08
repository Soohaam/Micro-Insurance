"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Package, Building2, DollarSign, Calendar, MapPin, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const response = await api.get('/admin/products/pending');
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error("Failed to fetch pending products");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedProduct) return;

    if (action === 'rejected' && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/admin/products/${selectedProduct.productId}/status`, {
        status: action,
        rejectionReason: action === 'rejected' ? rejectionReason.trim() : undefined
      });

      toast.success(`Product ${action} successfully`);
      setShowActionDialog(false);
      setRejectionReason("");
      setSelectedProduct(null);
      fetchPendingProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} product`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/admin")}
            className="mb-4 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 inline-block mb-1">
                Product Approvals
              </h1>
              <p className="text-muted-foreground text-lg">Review and approve insurance products</p>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full font-semibold shadow-lg shadow-emerald-500/10">
              {products.length} Pending
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground max-w-md">No pending product approvals at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {products.map((product: any, index: number) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/40 border-border/50 backdrop-blur-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <Package className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{product.productName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {product.company?.companyName || 'Unknown Company'}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium animate-pulse">
                        PENDING APPROVAL
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Product Details */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-emerald-400/90">Product Overview</h4>
                          <p className="text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border/50">
                            {product.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Policy Type</p>
                            <p className="font-semibold capitalize text-lg">{product.policyType}</p>
                          </div>
                          <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Coverage Type</p>
                            <p className="font-semibold capitalize text-lg">{product.coverageType}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between p-3 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Sum Insured</span>
                            <span className="font-medium text-lg">₹{product.sumInsuredMin?.toLocaleString()} - ₹{product.sumInsuredMax?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Duration</span>
                            <span className="font-medium text-lg">{product.duration} days</span>
                          </div>
                          <div className="flex items-center justify-between p-3 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Base Rate</span>
                            <span className="font-medium text-lg">{product.baseRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Oracle & Coverage */}
                      <div className="space-y-6 flex flex-col h-full">
                        <div className="p-5 bg-card/60 rounded-xl border border-border/50 shadow-inner">
                          <h5 className="font-semibold mb-4 text-emerald-400/90 border-b border-border/50 pb-2">Oracle Configuration</h5>
                          <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Trigger Type</span>
                              <p className="font-semibold capitalize bg-emerald-500/10 px-2 py-1 rounded text-emerald-400">{product.oracleTriggerType}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-1">Threshold</span>
                              <code className="block bg-black/30 p-2 rounded text-xs font-mono text-emerald-300 border border-emerald-500/20">
                                {JSON.stringify(product.triggerThreshold, null, 2)}
                              </code>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-1">Payout Formula</span>
                              <code className="block bg-black/30 p-2 rounded text-xs font-mono text-blue-300 border border-blue-500/20">
                                {product.payoutFormula}
                              </code>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 bg-card/60 rounded-xl border border-border/50">
                          <h5 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400/90">
                            <MapPin className="w-4 h-4" />
                            Regions Covered
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {product.regionsCovered?.map((region: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium">
                                {region}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-6 flex gap-4">
                          <Button
                            onClick={() => {
                              setSelectedProduct(product);
                              setAction('approved');
                              setShowActionDialog(true);
                            }}
                            disabled={processing}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 h-12 text-lg"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedProduct(product);
                              setAction('rejected');
                              setShowActionDialog(true);
                            }}
                            disabled={processing}
                            variant="destructive"
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-12 text-lg"
                          >
                            <XCircle className="mr-2 h-5 w-5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="bg-card border-border backdrop-blur-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={`text-2xl ${action === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>
                {action === 'approved' ? 'Approve Product' : 'Reject Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                {action === 'approved'
                  ? 'Approve this product to make it available for users to purchase.'
                  : 'Please provide a reason for rejection. The company will see this message.'
                }
              </p>
              {action === 'rejected' && (
                <Textarea
                  placeholder="Rejection reason (required)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="bg-secondary/50 border-border focus:ring-red-500 resize-none"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionDialog(false);
                  setRejectionReason("");
                }}
                disabled={processing}
                className="border-border hover:bg-secondary/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (action === 'rejected' && !rejectionReason.trim())}
                className={action === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm ${action === 'approved' ? 'Approval' : 'Rejection'}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
