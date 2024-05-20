import "./globals.css";

export const metadata = {
  title: "PDX Sky",
  description: "by Emanuel Costache",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
