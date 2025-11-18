import type { Metadata } from "next";
import React from "react";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertProvider } from "@/contexts/AlertContexts";
import { MqttProvider } from "@/contexts/MqttContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RelaWand - Dashboard Monitoring",
  description: "Dashboard monitoring untuk pemantauan bencana tanah longsor",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${nunito.variable} antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen`}>
        <main className="flex flex-col min-h-screen">
          <NotificationProvider>
            <AlertProvider>
              <MqttProvider enabled={true}>
                <Navbar />
                {children}
                <Footer />
              </MqttProvider>
            </AlertProvider>
          </NotificationProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </main>
      </body>
    </html>
  );
}
