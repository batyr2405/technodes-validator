import "./globals.css";

export const metadata = {
  title: "TechNodes Validator",
  description: "Shardeum Validator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
