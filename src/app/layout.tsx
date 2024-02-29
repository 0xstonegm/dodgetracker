import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "../components/NavBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Dodgetracker",
        template: "%s - Dodgetracker",
    },
    description: "Track master+ dodges in League of Legends",
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
        <html lang="en">
            <body className={`${inter.className} bg-zinc-700 text-zinc-300`}>
                <NavBar />
                {children}
                <GoogleAnalytics gaId="G-MDBY12TWLN" />
                <Analytics />
            </body>
        </html>
    );
}
