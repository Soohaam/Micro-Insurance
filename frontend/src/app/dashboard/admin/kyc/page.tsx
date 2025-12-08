"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPendingKYCs, updateKYCStatus } from "@/store/slices/adminSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Eye, User, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminKYCPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pendingKYCs, loading } = useAppSelector((state) => state.admin);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    dispatch(fetchPendingKYCs());
  }, [dispatch, user, router]);

  const handleApprove = async (kyc: any) => {
    setProcessing(true);
    try {
      const result = await dispatch(updateKYCStatus({
        kycId: kyc.kycId,
        status: "verified"
      }));

      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`KYC approved for ${kyc.user?.fullName || 'user'}`);
        dispatch(fetchPendingKYCs()); // Refresh list
      }
    } catch (error) {
      toast.error("Failed to approve KYC");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const result = await dispatch(updateKYCStatus({
        kycId: selectedKYC.kycId,
        status: "rejected",
        rejectionReason: rejectionReason.trim()
      }));

      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`KYC rejected for ${selectedKYC.user?.fullName || 'user'}`);
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedKYC(null);
        dispatch(fetchPendingKYCs());
      }
    } catch (error) {
      toast.error("Failed to reject KYC");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              <h1 className="text-4xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 inline-block mb-1">
                KYC Approvals
              </h1>
              <p className="text-muted-foreground text-lg">Review and approve user KYC submissions</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-full font-semibold shadow-lg shadow-purple-500/10">
              {pendingKYCs?.length || 0} Pending
            </div>
          </div>
        </div>

        {/* KYC List */}
        {pendingKYCs && pendingKYCs.length === 0 ? (
          <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground max-w-md">No pending KYC submissions to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingKYCs?.map((kyc: any, index: number) => (
              <motion.div
                key={kyc.kycId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/40 border-border/50 backdrop-blur-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                  <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                          <User className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{kyc.user?.fullName || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground font-mono">ID: {kyc.kycId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium animate-pulse">
                        PENDING REVIEW
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* User Details */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-purple-400/90">User Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Mail className="w-4 h-4 text-purple-400" />
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{kyc.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Phone className="w-4 h-4 text-purple-400" />
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{kyc.user?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="text-muted-foreground">Submitted:</span>
                              <span className="font-medium">{new Date(kyc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                          <h5 className="font-semibold mb-3 text-foreground border-b border-border/50 pb-2">Extracted Data (OCR)</h5>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Aadhaar Number</span>
                              <p className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{kyc.aadhaarNumber || 'Not extracted'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Name on Aadhaar</span>
                              <p className="font-semibold">{kyc.aadhaarName || 'Not extracted'}</p>
                            </div>
                            {kyc.metadata?.dob && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">DOB</span>
                                <p>{kyc.metadata.dob}</p>
                              </div>
                            )}
                            {kyc.metadata?.gender && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Gender</span>
                                <p>{kyc.metadata.gender}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aadhaar Image */}
                      <div className="flex flex-col h-full">
                        <h4 className="font-semibold text-lg mb-4 text-purple-400/90">Aadhaar Document</h4>
                        <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-black/40 flex-grow flex items-center justify-center">
                          <img
                            src={kyc.aadhaarImage}
                            alt="Aadhaar Card"
                            className="w-full h-full object-contain max-h-[300px] cursor-pointer hover:scale-105 transition-transform duration-500"
                            onClick={() => {
                              setSelectedKYC(kyc);
                              setShowImageDialog(true);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                              <Eye className="w-5 h-5" />
                              <span>Preview Full Size</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Click image to view full details
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                          <Button
                            onClick={() => handleApprove(kyc)}
                            disabled={processing}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 h-12 text-lg"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedKYC(kyc);
                              setShowRejectDialog(true);
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

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-card border-border backdrop-blur-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-400">Reject KYC Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                Please provide a reason for rejecting this KYC submission. The user will see this message.
              </p>
              <Textarea
                placeholder="Enter rejection reason (e.g., 'Document is not clear', 'Aadhaar number mismatch', etc.)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="bg-secondary/50 border-border focus:ring-red-500 resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
                disabled={processing}
                className="border-border hover:bg-secondary/50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="bg-red-500 hover:bg-red-600"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-4xl bg-slate-950/95 border-slate-800 p-1">
            <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
              <img
                src={selectedKYC?.aadhaarImage}
                alt="Aadhaar Card Full Size"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-slate-900 absolute bottom-0 left-0 right-0">
              <p className="text-white font-medium">{selectedKYC?.user?.fullName} - Aadhaar</p>
              <Button variant="ghost" className="text-white" onClick={() => setShowImageDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
