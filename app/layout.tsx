import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Michigan Contractors | Find Trusted Home Service Pros',
  description: 'Find the best plumbers, electricians, HVAC, roofers and more in Michigan.',
  keywords: 'contractors, plumbers, electricians, HVAC, roofer, Michigan, home services',
  openGraph: {
    title: 'Michigan Contractors | Find Trusted Home Service Pros',
    description: 'Find the best plumbers, electricians, HVAC, roofers and more in Michigan.',
    type: 'website',
    url: 'https://michigan-contractors.com',
  },
  verification: {
    google: 'google-site-verification-code',
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