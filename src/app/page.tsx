'use client';

import { Button } from '@chakra-ui/react';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="heading-primary text-black">Welcome to,</h2>
      <h1 className="heading-primary bg-indicoPrimary bg-clip-text text-3xl text-transparent md:text-4xl lg:text-5xl xl:text-6xl">
        Lawspicious
      </h1>
      <p className="text-lg text-black">Login to continue...</p>
      <Button
        colorScheme="purple"
        onClick={() => (window.location.href = '/auth')}
      >
        Login
      </Button>
    </main>
  );
}
