import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import GenderGate from "@/components/GenderGate";
import { GoogleAnalytics } from '@next/third-parties/google';

const display = localFont({
  src: [
    {
      path: "./fonts/cormorant-garamond-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HT x Studio",
  description:
    "A new clothing label from the FlipMeet ecosystem. Premium fabrics. Limited pieces. Built for the culture.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HT x Studio",
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
                } else if (window.location.search.indexOf('nogate') === -1) {
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
        <GoogleAnalytics gaId="G-QMYCM79SGY" />
      </body>
    </html>
  );
}
