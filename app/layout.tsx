import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "LeadFlow AI | Sales automation", description: "Free, local-first AI lead management automation." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
