// # Frontend Pages Implementation Guide

// ## ⚠️ IMPORTANT: Complete Implementation

// Due to the large amount of code, I'm providing a structured guide. Each page is production-ready code that you can copy directly into your project.

// ---

// ## 🎯 **Pages Overview**

// ### **Core User Flow:**
// 1. ✅ `/login` - Already implemented
// 2. ✅ `/register` - Created (needs full form fields)
// 3. 📝 `/kyc` - KYC Upload
// 4. 📝 `/products` - Browse Products
// 5. 📝 `/products/[id]` - Product DetailsI've created the backend functionality and started the frontend. Let me create a comprehensive guide showing exactly what code to put in each file. Due to the response size limitations, let me create the most critical pages first and document the rest.

// Let me create the **KYC upload page**:

// <function_calls>
// <invoke name="write_to_file">
// <parameter name="CodeContent">
"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uploadAadhaar, getKYCStatus } from "@/store/slices/kycSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, XCircle, Clock, Loader2, FileText } from "lucide-react";

export default function KYCPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: kyc, uploading, loading, error } = useAppSelector((state) => state.kyc);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      toast.error("Please login to access KYC");
      router.push("/login");
      return;
    }

    // Fetch KYC status on mount
    dispatch(getKYCStatus()).catch((err) => {
      // If 404, it means no KYC exists yet - this is fine
      console.log("No KYC found yet - user can upload");
    });
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload to backend
      const result = await dispatch(uploadAadhaar(file));
      
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Aadhaar uploaded successfully! Awaiting admin approval.");
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: uploading || kyc?.status === 'verified',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/user")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">KYC Verification</h1>
          <p className="text-slate-400">Upload your Aadhaar card for verification</p>
        </div>

        {/* KYC Status Card */}
        {kyc && (
          <Card className="mb-8 bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your KYC Status</span>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  kyc.status === 'verified' 
                    ? 'bg-green-500/20 text-green-400'
                    : kyc.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {kyc.status === 'verified' && <CheckCircle className="w-5 h-5" />}
                  {kyc.status === 'rejected' && <XCircle className="w-5 h-5" />}
                  {kyc.status === 'pending' && <Clock className="w-5 h-5" />}
                  <span className="font-semibold">{kyc.status.toUpperCase()}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Aadhaar Number</p>
                  <p className="font-mono">{kyc.aadhaarNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Name on Aadhaar</p>
                  <p>{kyc.aadhaarName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submitted On</p>
                  <p>{new Date(kyc.submittedAt).toLocaleDateString()}</p>
                </div>
                {kyc.verifiedAt && (
                  <div>
                    <p className="text-sm text-slate-400">Verified On</p>
                    <p>{new Date(kyc.verifiedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {kyc.status === 'rejected' && kyc.rejectionReason && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-slate-300">{kyc.rejectionReason}</p>
                </div>
              )}

              {kyc.status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    ⏳ Your KYC is under review. You'll be notified once it's approved.
                  </p>
                </div>
              )}

              {kyc.status === 'verified' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✅ Your KYC is verified! You can now purchase insurance policies.
                  </p>
                  <Button
                    onClick={() => router.push("/products")}
                    className="mt-4 bg-green-500 hover:bg-green-600"
                  >
                    Browse Insurance Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        {(!kyc || kyc.status === 'rejected') && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>
                {kyc?.status === 'rejected' ? 'Re-upload Aadhaar Card' : 'Upload Aadhaar Card'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : uploading
                    ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed'
                    : 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50'
                }`}
              >
                <input {...getInputProps()} disabled={uploading} />
                
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
                    <p className="text-lg font-semibold">Uploading & Processing...</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Extracting Aadhaar details using OCR
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    {isDragActive ? (
                      <p className="text-lg text-emerald-400">Drop your Aadhaar card here...</p>
                    ) : (
                      <>
                        <p className="text-lg mb-2 font-semibold">
                          Drag & drop your Aadhaar card here
                        </p>
                        <p className="text-sm text-slate-400 mb-2">or click to select file</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            JPG, PNG, PDF
                          </span>
                          <span>•</span>
                          <span>Max 5MB</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Preview */}
              {preview && !uploading && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4 text-lg">Preview</h3>
                  <div className="relative rounded-lg overflow-hidden border border-slate-700">
                    <img 
                      src={preview} 
                      alt="Aadhaar Preview" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 mb-2 font-semibold">📋 What happens next?</p>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>We'll extract your Aadhaar number and name using OCR</li>
                  <li>Your document will be securely stored in the cloud</li>
                  <li>Admin will review and verify your KYC within 24 hours</li>
                  <li>Once approved, you can purchase insurance policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
