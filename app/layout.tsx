import type { Metadata } from 'next';
import Schema from './components/Schema';

export const metadata: Metadata = {
  title: 'Find Trusted Contractors Near You | Plumbers, Electricians & More',
  description: 'Search our directory of verified contractors. Find plumbers, electricians, HVAC pros, roofers & more. Free quotes & reviews.',
  keywords: 'contractors, plumbers, electricians, HVAC, roofer, near me, home services',
  openGraph: {
    title: 'Find Trusted Contractors Near You',
    description: 'Search our directory of verified contractors. Find plumbers, electricians, HVAC pros, roofers & more.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Schema />
        {children}
      </body>
    </html>
  );
}
