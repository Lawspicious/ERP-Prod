import { Spinner } from '@chakra-ui/react';
import { Loader } from 'lucide-react';
import React from 'react';

const LoaderComponent = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Spinner size={'lg'} colorScheme="purple" />
    </div>
  );
};

export default LoaderComponent;
