import type { Metadata } from "next";
import "./globals.css";
import { FirmProvider } from "@/components/layout/firm-context";

export const metadata: Metadata = {
  title: "MFV Advocacia — Melo Fernandes & Vasconcelos | Sistema Jurídico (Sousa - PB)",
  description:
    "Sistema web de gestão jurídica, controle processual, clientes, agenda forense e documentos do escritório Melo Fernandes & Vasconcelos - Advogados Associados (CNPJ 22.233.391/0001-27), Sousa - PB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-[#ebf5ed] selection:text-[#0a0a0a]">
        <FirmProvider>{children}</FirmProvider>
      </body>
    </html>
  );
}
