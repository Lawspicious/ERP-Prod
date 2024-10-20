// components/Layout.tsx
import React from 'react';

import { MainHeader } from '../header/main-header';
import { MainFooter } from '../footer/main-footer';
import Navbar from '../dashboard/admin/tabs/navbar';
import { useAuth } from '@/context/user/userContext';
import LawyerNavbar from '../dashboard/lawyer/tabs/navbar';

interface LayoutProps {
  children: React.ReactNode;
  screen?: 'margined' | 'full-mode';
}

const PageLayout: React.FC<LayoutProps> = ({
  children,
  screen = 'full-mode',
}) => {
  const { role } = useAuth();

  return (
    <div>
      <header>
        {(role === 'ADMIN' || role === 'SUPERADMIN') && <Navbar />}
        {role === 'LAWYER' && <LawyerNavbar />}
      </header>
      <main
        className={
          screen === 'margined'
            ? 'mx-auto min-h-screen max-w-screen-2xl p-4'
            : 'min-h-screen'
        }
      >
        {children}
      </main>
      <footer>
        <MainFooter />
      </footer>
    </div>
  );
};

export default PageLayout;
