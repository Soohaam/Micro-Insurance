"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPendingCompanies, updateCompanyStatus } from "@/store/slices/adminSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Building2, Mail, Phone, FileText, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pendingCompanies, loading } = useAppSelector((state) => state.admin);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected' | 'blocked'>('approved');
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    dispatch(fetchPendingCompanies());
  }, [dispatch, user, router]);

  const handleAction = async () => {
    if (!selectedCompany) return;

    if (action === 'rejected' && !remarks.trim()) {
      toast.error("Please provide remarks for rejection");
      return;
    }

    setProcessing(true);
    try {
      const result = await dispatch(updateCompanyStatus({
        companyId: selectedCompany.companyId,
        status: action,
        remarks: remarks.trim() || undefined
      }));

      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`Company ${action} successfully`);
        setShowActionDialog(false);
        setRemarks("");
        setSelectedCompany(null);
        dispatch(fetchPendingCompanies());
      }
    } catch (error) {
      toast.error(`Failed to ${action} company`);
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
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
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
              <h1 className="text-4xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 inline-block mb-1">
                Company Approvals
              </h1>
              <p className="text-muted-foreground text-lg">Review and approve company registrations</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full font-semibold shadow-lg shadow-blue-500/10">
              {pendingCompanies?.length || 0} Pending
            </div>
          </div>
        </div>

        {pendingCompanies && pendingCompanies.length === 0 ? (
          <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground max-w-md">There are no pending company registrations at this moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingCompanies?.map((company: any, index: number) => (
              <motion.div
                key={company.companyId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/40 border-border/50 backdrop-blur-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                          <Building2 className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{company.companyName}</h3>
                          <p className="text-sm text-muted-foreground font-mono">Reg: {company.registrationNumber}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium animate-pulse">
                        PENDING REVIEW
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-blue-400/90">Contact Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{company.companyEmail}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Phone className="w-4 h-4 text-blue-400" />
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{company.companyPhone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="text-muted-foreground">Registered:</span>
                              <span className="font-medium">{new Date(company.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                          <h5 className="font-semibold mb-2 text-foreground">Address</h5>
                          <p className="text-sm text-muted-foreground">
                            {typeof company.address === 'string'
                              ? company.address
                              : `${company.address?.street}, ${company.address?.city}, ${company.address?.state} - ${company.address?.pincode}`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col h-full">
                        <h4 className="font-semibold text-lg mb-4 text-blue-400/90">Uploaded Documents</h4>
                        <div className="flex-grow bg-slate-950/30 rounded-xl border border-dashed border-slate-800 p-4">
                          {company.documents && company.documents.length > 0 ? (
                            <div className="space-y-3">
                              {company.documents.map((doc: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all group"
                                >
                                  <div className="p-2 bg-blue-500/20 rounded-md">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <span className="text-sm font-medium">Document {idx + 1}</span>
                                  <span className="ml-auto text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                              <FileText className="w-8 h-8 opacity-20" />
                              <p>No documents uploaded yet</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4 mt-6">
                          <Button
                            onClick={() => {
                              setSelectedCompany(company);
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
                              setSelectedCompany(company);
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
                {action === 'approved' ? 'Approve Registration' : 'Reject Registration'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                {action === 'approved'
                  ? `Are you sure you want to approve ${selectedCompany?.companyName}? This will allow them to create products immediately.`
                  : 'Please provide a reason for rejection. This will be sent to the company.'
                }
              </p>
              <Textarea
                placeholder={action === 'approved' ? 'Optional remarks...' : 'Rejection reason (required)...'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="bg-secondary/50 border-border focus:ring-blue-500 resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionDialog(false);
                  setRemarks("");
                }}
                disabled={processing}
                className="border-border hover:bg-secondary/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (action === 'rejected' && !remarks.trim())}
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
