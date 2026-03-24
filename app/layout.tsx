import type { Metadata } from "next";
import { Hind_Siliguri, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Hind_Siliguri({
  variable: "--font-body",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "রহস্যঘর",
    template: "%s | রহস্যঘর",
  },
  description: "রহস্য, ইতিহাস, বিজ্ঞান, গেম আর লাইফ হ্যাক নিয়ে বাংলা knowledge hub।",
  keywords: [
    "বাংলা article",
    "বিজ্ঞান",
    "ইতিহাস",
    "রহস্য",
    "লাইফ হ্যাক",
    "বাংলা knowledge hub",
    "public community posts",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "রহস্যঘর",
    description: "রহস্য, ইতিহাস, বিজ্ঞান, গেম আর লাইফ হ্যাক নিয়ে বাংলা knowledge hub।",
    siteName: "রহস্যঘর",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: "রহস্যঘর",
    description: "রহস্য, ইতিহাস, বিজ্ঞান, গেম আর লাইফ হ্যাক নিয়ে বাংলা knowledge hub।",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
