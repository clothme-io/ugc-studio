import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'UGC Studio — ClothME',
  description: 'Internal UGC content pipeline for TikTok and Instagram',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">{children}</div>
      </body>
    </html>
  );
}
