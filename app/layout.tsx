export const metadata = {
  title: "TerraShield | AI-Powered Invasive Species Early Warning System",
  description:
    "TerraShield is a real-time ecological intelligence platform that detects invasive species outbreaks using citizen reports, AI classification, and satellite vegetation analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
