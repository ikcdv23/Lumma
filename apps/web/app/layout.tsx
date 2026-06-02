import localFont from "next/font/local";
import "./globals.css";
import { Geist, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmProvider } from "@/components/confirm/confirm-provider";

const figtreeHeading = Figtree({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata = {
    title: {
        template: "Lumma - %s",
        default: "Lumma",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable, figtreeHeading.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfirmProvider>{children}</ConfirmProvider>
        <Toaster
          position="bottom-right"
          duration={2500}
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              padding: "10px 14px",
            },
            classNames: {
              title: "font-medium",
              description: "text-xs opacity-70",
            },
          }}
        />
      </body>
    </html>
  );
}
