import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FlipMeet Studio",
  description:
    "A new clothing label from the FlipMeet ecosystem. Premium fabrics. Limited pieces. Built for the culture.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`bg-base-bg ${display.variable} ${body.variable}`}>
      <body>
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
