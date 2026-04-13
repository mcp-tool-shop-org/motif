import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motif Studio",
  description: "Adaptive soundtrack authoring for AI RPG worlds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
