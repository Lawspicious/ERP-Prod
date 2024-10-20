import { Spinner } from '@chakra-ui/react';
import { Loader } from 'lucide-react';
import React from 'react';

const LoaderComponent = () => {
  return (
    <div className="flex h-[30vh] flex-col items-center justify-center">
      <Spinner size={'lg'} colorScheme="purple" />
    </div>
  );
};

export default LoaderComponent;
