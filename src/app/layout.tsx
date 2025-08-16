import type { Metadata } from "next";
import { arrayRegular, monofur } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Timer",
  description: "Minimalist study timer application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${arrayRegular.variable} ${monofur.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
