import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "../components/NavBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dodgetracker",
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
            </body>
        </html>
    );
}
