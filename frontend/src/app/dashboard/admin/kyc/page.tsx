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
import { Loader2, CheckCircle, XCircle, Eye, User, Mail, Phone, Calendar } from "lucide-react";

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              <h1 className="text-4xl font-bold text-white mb-2">KYC Approvals</h1>
              <p className="text-slate-400">Review and approve user KYC submissions</p>
            </div>
            <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full font-semibold">
              {pendingKYCs?.length || 0} Pending
            </div>
          </div>
        </div>

        {/* KYC List */}
        {pendingKYCs && pendingKYCs.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No pending KYC submissions to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingKYCs?.map((kyc: any) => (
              <Card key={kyc.kycId} className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{kyc.user?.fullName || 'Unknown User'}</h3>
                        <p className="text-sm text-slate-400">KYC ID: {kyc.kycId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                      PENDING
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* User Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg mb-3">User Information</h4>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Email:</span>
                        <span>{kyc.user?.email || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Phone:</span>
                        <span>{kyc.user?.phone || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Submitted:</span>
                        <span>{new Date(kyc.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                        <h5 className="font-semibold mb-2">Extracted Data (OCR)</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Aadhaar Number:</span>
                            <p className="font-mono text-emerald-400">{kyc.aadhaarNumber || 'Not extracted'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Name on Aadhaar:</span>
                            <p className="font-semibold">{kyc.aadhaarName || 'Not extracted'}</p>
                          </div>
                          {kyc.metadata?.dob && (
                            <div>
                              <span className="text-slate-400">DOB:</span>
                              <p>{kyc.metadata.dob}</p>
                            </div>
                          )}
                          {kyc.metadata?.gender && (
                            <div>
                              <span className="text-slate-400">Gender:</span>
                              <p>{kyc.metadata.gender}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar Image */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Aadhaar Document</h4>
                      <div className="relative group">
                        <img
                          src={kyc.aadhaarImage}
                          alt="Aadhaar Card"
                          className="w-full rounded-lg border border-slate-700 cursor-pointer hover:border-purple-500 transition-all"
                          onClick={() => {
                            setSelectedKYC(kyc);
                            setShowImageDialog(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        Click to view full size
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6 pt-6 border-t border-slate-800">
                    <Button
                      onClick={() => handleApprove(kyc)}
                      disabled={processing}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve KYC
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
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject KYC
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Reject KYC Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Please provide a reason for rejecting this KYC submission. The user will see this message.
              </p>
              <Textarea
                placeholder="Enter rejection reason (e.g., 'Document is not clear', 'Aadhaar number mismatch', etc.)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="bg-slate-800 border-slate-700"
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
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
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
          <DialogContent className="max-w-4xl bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Aadhaar Document - {selectedKYC?.user?.fullName}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img
                src={selectedKYC?.aadhaarImage}
                alt="Aadhaar Card Full Size"
                className="w-full rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
