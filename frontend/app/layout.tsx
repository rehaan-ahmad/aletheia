import type { Metadata } from 'next';
import { Syne, DM_Mono, DM_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Aletheia — Fact & Claim Verification',
  description: 'AI-powered fact-checking and claim verification system.',
};
