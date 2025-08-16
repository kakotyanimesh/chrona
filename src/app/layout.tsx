import type { Metadata } from "next";
import { arrayRegular } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chrona - Minimalist Study Timer",
  description: "A clean, minimalist study timer application. Track your study sessions with precision, animated UI, and automatic session logging. Built with Next.js and TypeScript.",
  keywords: ["study timer", "pomodoro", "productivity", "focus", "study sessions", "timer app", "minimalist"],
  authors: [{ name: "Animesh Kakoty", url: "https://x.com/_animeshkakoty" }],
  creator: "Animesh Kakoty",

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chrona.vercel.app",
    siteName: "Chrona",
    title: "Chrona - Minimalist Study Timer",
    description: "A clean, minimalist study timer application. Track your study sessions with precision, animated UI, and automatic session logging.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chrona - Minimalist Study Timer",
        type: "image/png",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@_animeshkakoty",
    creator: "@_animeshkakoty",
    title: "Chrona - Minimalist Study Timer",
    description: "A clean, minimalist study timer application. Track your study sessions with precision, animated UI, and automatic session logging.",
    images: ["/og-image.png"],
  },

  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },



  // App specific
  applicationName: "Chrona",
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${arrayRegular.variable} antialiased font-array`}>
        {children}
      </body>
    </html>
  );
}
