import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '@/context/user/userContext';
import { LoadingProvider } from '@/context/loading/loadingContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  const googleClientId = process.env
    .NEXT_PUBLIC_GOOGLE_CALENDAR_GCLIENT_ID as string;

  return (
    <html lang="en">
      <body className={robo.className}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <LoadingProvider>
            <UserProvider>
              <ChakraProvider>{children}</ChakraProvider>
            </UserProvider>
          </LoadingProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
