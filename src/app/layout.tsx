import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "../components/NavBar";
import { supportedUserRegions } from "../regions";
import "./globals.css";
import { CSPostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const availableRegions = [...supportedUserRegions]
  .map((r) => r.toUpperCase())
  .join(", ");

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dodgetracker.com"),
  title: {
    default: "Dodgetracker - League of Legends",
    template: "%s - Dodgetracker - League of Legends",
  },
  description: `Track League of Legends dodges in Master, Grandmaster, and Challenger. Available for ${availableRegions}.`,
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scrollbar scrollbar-track-zinc-800 scrollbar-thumb-zinc-900"
    >
      <CSPostHogProvider>
        <body className={`${inter.className} dark bg-zinc-700 text-zinc-300`}>
          <NavBar />
          <main>{children}</main>
          <GoogleAnalytics gaId={process.env.GA_ID || ""} />
          <GoogleTagManager gtmId={process.env.GTM_ID || ""} />
          <Analytics />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
