import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Touring Wheels - Plan Your Perfect Bicycle Adventure",
  description:
    "The ultimate bicycle tour planning platform. Plan multi-week tours with intelligent route mapping, gear management, and AI-powered insights.",
  keywords:
    "bicycle touring, bike tour planner, cycling routes, gear management, GPX, bicycle adventure",
  authors: [{ name: "Touring Wheels Team" }],
  openGraph: {
    title: "Touring Wheels - Plan Your Perfect Bicycle Adventure",
    description:
      "The ultimate bicycle tour planning platform for adventurous cyclists worldwide.",
    type: "website",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200",
        width: 1200,
        height: 630,
        alt: "Touring Wheels - Bicycle Tour Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Touring Wheels - Plan Your Perfect Bicycle Adventure",
    description:
      "The ultimate bicycle tour planning platform for adventurous cyclists worldwide.",
    images: ["/placeholder.svg?height=630&width=1200"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
