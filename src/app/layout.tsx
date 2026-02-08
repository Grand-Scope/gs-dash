import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Project Dashboard | Manage Your Projects",
  description: "A modern project management dashboard for teams to manage projects, tasks, timelines, and collaborate effectively.",
  keywords: ["project management", "dashboard", "tasks", "timeline", "team collaboration"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
