import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Office — Work in the heart of NYC",
  description:
    "Flexible offices, meeting rooms, and shared spaces in the heart of Manhattan.",
  icons: {
    icon: "favicon-nyc.svg",
    shortcut: "favicon-nyc.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
