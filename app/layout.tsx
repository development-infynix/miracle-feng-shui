import type { Metadata } from 'next';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GuestNotificationToast } from '@/components/GuestNotificationToast';
import { ScrollToTop } from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'Miracle feng shui - Shop for handmade, vintage, custom, and unique gifts for everyone',
  description:
    'Find the perfect handmade gift, vintage & on-trend clothes, unique jewelry, and more… lots more on Miracle feng shui.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@500;600;700;800&family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-white text-etsy-dark antialiased"
      >
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <GuestNotificationToast />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

