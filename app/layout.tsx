import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import ClientLayout from './client-layout';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'LUMINADOC - Multi-AI Assistant',
  description: 'Intelligent AI routing platform that automatically selects the best AI model for your requests. Process documents with Claude, ChatGPT, Gemini, and Grok.',
  keywords: 'AI, artificial intelligence, document processing, multi-AI, ChatGPT, Claude, Gemini, Grok, productivity',
  authors: [{ name: 'LUMINADOC Team' }],
  creator: 'LUMINADOC',
  publisher: 'LUMINADOC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/attached_assets/Group 1171274849 (1)_1753432882218.png',
    apple: '/attached_assets/Group 1171274849 (1)_1753432882218.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LUMINADOC',
  },
  openGraph: {
    type: 'website',
    title: 'LUMINADOC - Multi-AI Assistant',
    description: 'Intelligent AI routing platform that automatically selects the best AI model for your requests.',
    siteName: 'LUMINADOC',
    images: [
      {
        url: '/attached_assets/image_1753433648842.png',
        width: 390,
        height: 844,
        alt: 'LUMINADOC Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LUMINADOC - Multi-AI Assistant',
    description: 'Intelligent AI routing platform that automatically selects the best AI model for your requests.',
    images: ['/attached_assets/image_1753433648842.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <style>{`
          :root {
            --sat: env(safe-area-inset-top);
            --sar: env(safe-area-inset-right);
            --sab: env(safe-area-inset-bottom);
            --sal: env(safe-area-inset-left);
          }
          
          .safe-area-pt { padding-top: max(var(--sat), 1rem); }
          .safe-area-pb { padding-bottom: max(var(--sab), 1rem); }
          .safe-area-pl { padding-left: max(var(--sal), 1rem); }
          .safe-area-pr { padding-right: max(var(--sar), 1rem); }
        `}</style>
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}