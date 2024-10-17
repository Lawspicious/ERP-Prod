import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '@/context/user/userContext';
import { LoadingProvider } from '@/context/loading/loadingContext';

const robo = Roboto({
  weight: ['100', '300', '400', '500', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lawspicious',
  description: 'Lawspicious - A law firm management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={robo.className}>
        <LoadingProvider>
          <UserProvider>
            <ChakraProvider>{children}</ChakraProvider>
          </UserProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
