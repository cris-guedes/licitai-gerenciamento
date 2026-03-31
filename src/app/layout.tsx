import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/client/main/providers/QueryProvider";
import { Toaster } from "@/client/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Licitare — Gestão Inteligente de Licitações",
  description: "Plataforma premium para descoberta e gestão de licitações públicas e contratos governamentais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Script
          src="https://t.contentsquare.net/uxa/bb6d814f93bb3.js"
          strategy="afterInteractive"
        />
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
