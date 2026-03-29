import type { Metadata } from 'next';

export const metadata: Metadata = {
  // v2 — cache refresh (Linus, 2026-03-29)
  title: 'Michigan Contractors | Find Trusted Home Service Pros',
  description: 'Find the best plumbers, electricians, HVAC, roofers and more in Michigan.',
  keywords: 'contractors, plumbers, electricians, HVAC, roofer, Michigan, home services',
  openGraph: {
    title: 'Michigan Contractors | Find Trusted Home Service Pros',
    description: 'Find the best plumbers, electricians, HVAC, roofers and more in Michigan.',
    type: 'website',
    url: 'https://michigan-contractors.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}