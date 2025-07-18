import type { Metadata } from "next";
import { QueryProvider, ReactQueryProvider } from "@/context/QueryContext";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Powered Task Tracker",
  description: "Track your tasks with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-blue-400">AI Bug Fixer</h1>
            <p className="text-gray-400 mt-2">
              Autonomous bug detection and fixing
            </p>
          </header>
          <ReactQueryProvider>
            <QueryProvider>{children}</QueryProvider>
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  );
}
