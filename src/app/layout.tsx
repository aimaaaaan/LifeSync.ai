import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "LifeCare.ai - Advanced Genetic Testing for Preventive Healthcare",
  description: "LifeSync offers comprehensive genetic testing to prevent cancer, heart diseases, and 6000+ genetic conditions. Take control of your health with clinical-grade DNA reports.",
  keywords: ["LifeCare.ai", "LifeSync", "genetic testing", "preventive healthcare", "DNA testing", "cancer prevention", "heart disease prevention"],
  authors: [{ name: "LifeCare.ai Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LifeCare.ai - Advanced Genetic Testing",
    description: "Take control of your health with LifeSync comprehensive genetic testing",
    url: "https://lifecare.ai",
    siteName: "LifeCare.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeCare.ai - Advanced Genetic Testing",
    description: "Take control of your health with LifeSync comprehensive genetic testing",
  },
  other: {
    'color-scheme': 'light only',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
