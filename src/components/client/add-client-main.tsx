import { useState } from 'react';
import { Checkbox, Box, Button } from '@chakra-ui/react';
import ClientProspectForm from './prospect-client-form';
import ClientForm from './client-form';
import PageLayout from '../ui/page-layout';
import { ArrowLeft } from 'lucide-react';

const AddClientMain = () => {
  const [isProspect, setIsProspect] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-6">
        <h1 className="heading-primary">Add New Client</h1>
        <Button
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href = '/dashboard/admin/workspace-admin#client')
          }
        >
          Back
        </Button>
      </div>
      <Checkbox
        isChecked={isProspect}
        onChange={(e) => setIsProspect(e.target.checked)}
        mb={4}
      >
        Is Prospect Client?
      </Checkbox>

      {isProspect ? <ClientProspectForm /> : <ClientForm />}
    </div>
  );
};

export default AddClientMain;
