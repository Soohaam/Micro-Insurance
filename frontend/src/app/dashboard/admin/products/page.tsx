"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Package, Building2, DollarSign, Calendar, MapPin } from "lucide-react";

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/admin")}
            className="mb-4 text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Product Approvals</h1>
              <p className="text-slate-400">Review and approve insurance products</p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full font-semibold">
              {products.length} Pending
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No pending product approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {products.map((product: any) => (
              <Card key={product.productId} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{product.productName}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {product.company?.companyName || 'Unknown Company'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                      PENDING APPROVAL
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-slate-300">{product.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-400 mb-1">Policy Type</p>
                          <p className="font-semibold capitalize">{product.policyType}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-400 mb-1">Coverage Type</p>
                          <p className="font-semibold capitalize">{product.coverageType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Sum Insured:</span>
                        <span>₹{product.sumInsuredMin?.toLocaleString()} - ₹{product.sumInsuredMax?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Duration:</span>
                        <span>{product.duration} days</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400">Base Rate:</span>
                        <span>{product.baseRate}%</span>
                      </div>
                    </div>

                    {/* Oracle & Coverage */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <h5 className="font-semibold mb-2">Oracle Configuration</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Trigger Type:</span>
                            <p className="font-semibold capitalize">{product.oracleTriggerType}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Threshold:</span>
                            <p className="font-mono text-emerald-400">
                              {JSON.stringify(product.triggerThreshold)}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Payout Formula:</span>
                            <p className="font-mono text-xs">{product.payoutFormula}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Regions Covered
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {product.regionsCovered?.map((region: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {region}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-slate-400">
                        <p>Max Policies per User: {product.maxPoliciesPerUser}</p>
                        <p className="mt-1">
                          Created: {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 pt-6 border-t border-slate-800">
                    <Button
                      onClick={() => {
                        setSelectedProduct(product);
                        setAction('approved');
                        setShowActionDialog(true);
                      }}
                      disabled={processing}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Product
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProduct(product);
                        setAction('rejected');
                        setShowActionDialog(true);
                      }}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>
                {action === 'approved' ? 'Approve' : 'Reject'} Product
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
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
                  className="bg-slate-800 border-slate-700"
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (action === 'rejected' && !rejectionReason.trim())}
                className={action === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
                variant={action === 'rejected' ? 'destructive' : 'default'}
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
