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
import { Loader2, CheckCircle, XCircle, Building2, Mail, Phone, FileText, Calendar } from "lucide-react";

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
              <h1 className="text-4xl font-bold text-white mb-2">Company Approvals</h1>
              <p className="text-slate-400">Review and approve company registrations</p>
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full font-semibold">
              {pendingCompanies?.length || 0} Pending
            </div>
          </div>
        </div>

        {pendingCompanies && pendingCompanies.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No pending company registrations</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingCompanies?.map((company: any) => (
              <Card key={company.companyId} className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{company.companyName}</h3>
                        <p className="text-sm text-slate-400">Reg: {company.registrationNumber}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                      PENDING
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg mb-3">Company Information</h4>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Email:</span>
                        <span>{company.companyEmail}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Phone:</span>
                        <span>{company.companyPhone || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Registered:</span>
                        <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                        <h5 className="font-semibold mb-2">Address</h5>
                        <p className="text-sm text-slate-300">
                          {typeof company.address === 'string' 
                            ? company.address 
                            : `${company.address?.street}, ${company.address?.city}, ${company.address?.state} - ${company.address?.pincode}`
                          }
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Uploaded Documents</h4>
                      {company.documents && company.documents.length > 0 ? (
                        <div className="space-y-2">
                          {company.documents.map((doc: string, idx: number) => (
                            <a
                              key={idx}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <FileText className="w-5 h-5 text-blue-400" />
                              <span className="text-sm">Document {idx + 1}</span>
                              <span className="ml-auto text-xs text-slate-400">View →</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No documents uploaded yet</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 pt-6 border-t border-slate-800">
                    <Button
                      onClick={() => {
                        setSelectedCompany(company);
                        setAction('approved');
                        setShowActionDialog(true);
                      }}
                      disabled={processing}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
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
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
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
                {action === 'approved' ? 'Approve' : 'Reject'} Company Registration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                {action === 'approved' 
                  ? 'Approve this company to allow them to create insurance products.'
                  : 'Please provide a reason for rejection. The company will see this message.'
                }
              </p>
              <Textarea
                placeholder={action === 'approved' ? 'Optional remarks...' : 'Rejection reason (required)...'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="bg-slate-800 border-slate-700"
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (action === 'rejected' && !remarks.trim())}
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
