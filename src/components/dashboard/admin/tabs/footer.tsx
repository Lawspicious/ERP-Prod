import React from 'react';

const Footer = () => {
  return (
    <div className="fixed bottom-0 w-full text-white">
      <h1 className="bg-bgPrimary py-2 text-center">
        All Rights Reserved @Lawspicious {new Date().getFullYear()}
      </h1>
    </div>
  );
};

export default Footer;
