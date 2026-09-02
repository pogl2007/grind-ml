import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/layout/SessionProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GRIND ML — AI-симулятор технических интервью',
  description: 'AI-симулятор технических интервью для ML и DS. Яндекс · Сбер · VK · Тинькофф · Озон',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
