import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMeet Studio",
  description:
    "A new clothing label from the FlipMeet ecosystem. Premium fabrics. Limited pieces. Built for the culture.",
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
