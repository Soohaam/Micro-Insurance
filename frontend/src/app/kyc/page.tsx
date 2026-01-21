"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uploadAadhaar, getKYCStatus } from "@/store/slices/kycSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, XCircle, Clock, Loader2, FileText, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function KYCPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: kyc, uploading, loading, error } = useAppSelector((state) => state.kyc);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(getKYCStatus()).catch(() => { });
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }

      const result = await dispatch(uploadAadhaar(file));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Details extracted & uploaded! Awaiting admin verification.");
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploading || kyc?.status === 'verified',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/user")}
            className="mb-4 hover:bg-emerald-500/10 hover:text-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">KYC Verification</h1>
              <p className="text-muted-foreground">Identity verification is required to purchase policies</p>
            </div>
          </div>
        </motion.div>

        {/* KYC Status Card */}
        {kyc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-card/40 border-border/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Status</span>
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${kyc.status === 'verified'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : kyc.status === 'rejected'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                    {kyc.status === 'verified' && <CheckCircle className="w-5 h-5" />}
                    {kyc.status === 'rejected' && <XCircle className="w-5 h-5" />}
                    {kyc.status === 'pending' && <Clock className="w-5 h-5" />}
                    <span className="font-semibold uppercase text-sm tracking-wide">{kyc.status}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 p-4 bg-secondary/20 rounded-xl border border-border/50">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Aadhaar Number</p>
                    <p className="font-mono text-lg font-medium">{kyc.aadhaarNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Name on ID</p>
                    <p className="text-lg font-medium capitalize">{kyc.aadhaarName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Submitted On</p>
                    <p className="text-sm">{new Date(kyc.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {kyc.verifiedAt && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Verified On</p>
                      <p className="text-sm">{new Date(kyc.verifiedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {kyc.status === 'rejected' && kyc.rejectionReason && (
                  <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-sm font-semibold text-destructive mb-1">Issue Found:</p>
                    <p className="text-sm text-foreground/80">{kyc.rejectionReason}</p>
                  </div>
                )}

                {kyc.status === 'verified' && (
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push("/products")}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-6"
                    >
                      Explore Insurance Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload Section */}
        {(!kyc || kyc.status === 'rejected') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>
                  {kyc?.status === 'rejected' ? 'Re-submit Aadhaar' : 'Upload Document'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${isDragActive
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : uploading
                      ? 'border-border bg-secondary/30 cursor-not-allowed'
                      : 'border-border/50 hover:border-emerald-500/50 hover:bg-secondary/30'
                    }`}
                >
                  <input {...getInputProps()} disabled={uploading} />

                  {/* Animated Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {uploading ? (
                    <div className="flex flex-col items-center relative z-10">
                      <div className="mb-6 relative">
                        <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-emerald-500" />
                        </div>
                      </div>
                      <p className="text-xl font-semibold mb-1">Processing Document</p>
                      <p className="text-muted-foreground animate-pulse">Extracting verified details...</p>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-emerald-500" />
                      </div>
                      {isDragActive ? (
                        <p className="text-xl text-emerald-500 font-semibold">Drop it like it's hot!</p>
                      ) : (
                        <>
                          <p className="text-xl font-semibold mb-2">
                            Drag &amp; drop your Aadhaar
                          </p>
                          <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                          <div className="inline-flex gap-4 text-xs text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> JPG, PNG, PDF
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Max 5MB
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview */}
                {preview && !uploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8"
                  >
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Selected Document
                    </p>
                    <div className="relative rounded-xl overflow-hidden border border-border/50 max-h-[300px] object-cover bg-black/50">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
