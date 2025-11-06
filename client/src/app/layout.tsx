import type { Metadata } from "next";
import React from "react";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertProvider } from "@/contexts/AlertContexts";
import { MqttProvider } from "@/contexts/MqttContext";
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
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} antialiased`}>
        <main>
          <AlertProvider>
            <MqttProvider enabled={true}>
              <Navbar />
              {children}
              <Footer />
            </MqttProvider>
          </AlertProvider>
        </main>
      </body>
    </html>
  );
}
