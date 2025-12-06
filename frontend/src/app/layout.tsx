import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Micro Insurance Platform",
  description:
    "Blockchain-enabled parametric micro-insurance platform with KYC verification and automated claims",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <ThirdwebProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ThirdwebProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
