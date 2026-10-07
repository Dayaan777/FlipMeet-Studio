import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import GenderGate from "@/components/GenderGate";

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
    <html lang="en" suppressHydrationWarning className={`bg-base-bg ${display.variable} ${body.variable}`}>
      <head>
        {/* Video preloads removed to improve initial page load performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var g = localStorage.getItem('fm_gender');
                if (g) {
                  document.documentElement.dataset.theme = g;
                } else {
                  var style = document.createElement('style');
                  style.id = 'fm-lock-style';
                  style.innerHTML = '#fm-gender-gate { display: flex !important; } body { overflow: hidden !important; }';
                  document.head.appendChild(style);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider />
        <GlobalAudioPlayer />
        <GenderGate />
        <div className="fm-protected-content">
          {children}
        </div>
      </body>
    </html>
  );
}
