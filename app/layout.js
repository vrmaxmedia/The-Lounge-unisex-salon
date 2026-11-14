export const metadata = {
  title: "The Lounge Unisex Salon | AI Review Generator",
  description:
    "Unisex Salon, Hair Stylist & Bridal Makeup Artist at Pathankot Junction, Pathankot",
};

export const viewport = {
  themeColor: "#0b0a09",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0b0a09" }}>
        {children}
      </body>
    </html>
  );
}
