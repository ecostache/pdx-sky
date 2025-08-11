import { IBM_Plex_Sans } from 'next/font/google';
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const plexSans = IBM_Plex_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: "PDX Sky",
  description: "by Emanuel Costache",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plexSans.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
