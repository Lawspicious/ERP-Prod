import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

const TabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div className="mb-24 min-h-screen p-4 md:p-6">{children}</div>
      {/* <Footer /> */}
    </div>
  );
};

export default TabLayout;
