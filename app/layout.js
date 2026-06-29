import "./globals.css";

export const metadata = {
  title: "My Career Academic",
  description: "Coaching Management System - MY LIFELINE FOUNDATION",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
