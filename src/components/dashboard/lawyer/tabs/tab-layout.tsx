import React from 'react';
import Footer from './footer';
import LawyerNavbar from './navbar';

const TabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <LawyerNavbar />
      <div className="mb-24 min-h-screen p-4 md:p-6">{children}</div>
      {/* <Footer /> */}
    </div>
  );
};

export default TabLayout;
