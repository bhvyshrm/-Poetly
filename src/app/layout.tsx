import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Poetly — Write what you cannot say.",
    template: "%s | Poetly",
  },
  description:
    "A social platform for poetry, creative writing, and emotional expression. Write, share, and respond with poems.",
  keywords: ["poetry", "poems", "creative writing", "social", "writing community"],
  authors: [{ name: "Poetly" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Poetly",
    title: "Poetly — Write what you cannot say.",
    description:
      "A social platform for poetry, creative writing, and emotional expression.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poetly — Write what you cannot say.",
    description:
      "A social platform for poetry, creative writing, and emotional expression.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <main id="main-content">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
