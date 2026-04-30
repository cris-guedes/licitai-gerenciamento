import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/client/main/providers/QueryProvider";
import { HotjarProvider } from "@/client/main/providers/HotjarProvider";
import { Toaster } from "@/client/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Licitai Gerenciamento — Gestão Inteligente de Licitações",
  description: "Plataforma de inteligência para extração de informações de editais, descoberta e gestão de licitações públicas e contratos governamentais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased`}
      >
        <HotjarProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </HotjarProvider>
      </body>
    </html>
  );
}
