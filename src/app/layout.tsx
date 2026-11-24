import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EntryFlow — Find your next event",
  description: "Browse events and register in a few simple steps.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
