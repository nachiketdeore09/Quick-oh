import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quick-oh | 10-Minute Deliveries",
  description: "Your favorite groceries delivered in 10 minutes. Fresh, fast, and reliable.",
  keywords: ["quick commerce", "grocery delivery", "10-minute delivery", "Quick-oh"],
  authors: [{ name: "Quick-oh Team" }],
  openGraph: {
    title: "Quick-oh | 10-Minute Deliveries",
    description: "Your favorite groceries delivered in 10 minutes.",
    url: "https://quick-oh.vercel.app",
    siteName: "Quick-oh",
    images: [
      {
        url: "/og-image.png", // Ensure this asset exists in public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick-oh | 10-Minute Deliveries",
    description: "Your favorite groceries delivered in 10 minutes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
