import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Toast from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Exam Portal - Online Examination System",
  description: "A comprehensive online examination portal for students and administrators. Take exams, view results, and manage assessments seamlessly.",
  keywords: ["exam", "online exam", "test", "assessment", "education", "MCQ"],
  authors: [{ name: "Exam Portal" }],
  openGraph: {
    title: "Exam Portal - Online Examination System",
    description: "A comprehensive online examination portal for students and administrators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
