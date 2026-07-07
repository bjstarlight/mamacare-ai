import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MamaCareProvider } from "./components/providers/MamaCareProvider";
import AppChrome from "./components/AppChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MamaCare AI",
  description: "AI-powered maternal and neonatal care platform with BOT Chain verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MamaCareProvider>
          <AppChrome />
          {children}
        </MamaCareProvider>
      </body>
    </html>
  );
}