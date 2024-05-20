import { IBM_Plex_Sans } from 'next/font/google';
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: "PDX Sky",
  description: "by Emanuel Costache",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plexSans.className}>{children}</body>
    </html>
  );
}
