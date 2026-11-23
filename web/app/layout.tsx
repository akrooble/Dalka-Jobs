import type { Metadata } from "next";
import "./globals.css";
import "./stitch.css";
import { DemoProvider } from "../components/frontend/demo-provider";

export const metadata: Metadata = {
  title: "Dalka Jobs — Find your next opportunity",
  description: "Explore the first Dalka Jobs website preview. All vacancies are fictional samples and applications are not open.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><DemoProvider>{children}</DemoProvider></body>
    </html>
  );
}
