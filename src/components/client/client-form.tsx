import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { IClient } from '@/types/client';
import { useToastHook } from '@/hooks/shared/useToastHook';
import { useClient } from '@/hooks/useClientHook';
import StarRating from '../ui/star-rating';
import { useLoading } from '@/context/loading/loadingContext';
import { useTeam } from '@/hooks/useTeamHook';
import { useAuth } from '@/context/user/userContext';

const initialData: IClient = {
  name: '',
  email: '',
  gender: 'Male',
  mobile: '',
  address: '',
  country: '',
  state: '',
  city: '',
  clientType: 'normal',
  rating: 1,
  remark: '',
  relationshipManager: 'yet to be assigned',
};

const ClientForm = () => {
  const [formInputs, setFormInputs] = useState<IClient>({ ...initialData });
  const { loading, setLoading } = useLoading();
  const { createClient } = useClient();
  const { allUser } = useTeam();
  const { role } = useAuth();
  const toast = useToast();

  // Filter out lawyers from RM selection
  const availableRMs = allUser.filter((user) => user.role !== 'LAWYER');
  const canEditRM = role !== 'LAWYER';

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClient(formInputs);
      toast({
        title: 'Success',
        description: 'Client created successfully',
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Client cannot be created',
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
    }

    setFormInputs({ ...initialData });
    setLoading(false);
  };

  return (
    <form className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          name="name"
          placeholder="Enter client name"
          value={formInputs.name}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          placeholder="Enter client email"
          value={formInputs.email}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Mobile</FormLabel>
        <Input
          type="number"
          name="mobile"
          placeholder="Enter mobile number"
          value={formInputs.mobile}
          onChange={handleInputChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Gender</FormLabel>
        <Select
          name="gender"
          placeholder="Enter Gender"
          value={formInputs.gender}
          onChange={handleInputChange}
        >
          <option value={'Male'}>Male</option>
          <option value={'Female'}>Female</option>
          <option value={'Other'}>Other</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Relationship Manager</FormLabel>
        <Select
          name="relationshipManager"
          value={formInputs.relationshipManager}
          onChange={handleInputChange}
          isDisabled={!canEditRM}
        >
          <option value="yet to be assigned">Yet to be assigned</option>
          {availableRMs.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Address</FormLabel>
        <Input
          type="text"
          name="address"
          placeholder="Enter address"
          value={formInputs.address}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Country</FormLabel>
        <Input
          type="text"
          name="country"
          placeholder="Enter country"
          value={formInputs.country}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>State</FormLabel>
        <Input
          type="text"
          name="state"
          placeholder="Enter state"
          value={formInputs.state}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>City</FormLabel>
        <Input
          type="text"
          name="city"
          placeholder="Enter city"
          value={formInputs.city}
          onChange={handleInputChange}
        />
      </FormControl>
      <FormControl className="col-span-2">
        <FormLabel>Rate the Client</FormLabel>
        <StarRating
          maxStars={5}
          onChange={(newRating: number) =>
            setFormInputs((prev) => ({
              ...prev,
              rating: newRating,
            }))
          }
        />
      </FormControl>
      <FormControl className="col-span-2">
        <FormLabel>Remark</FormLabel>
        <Textarea
          rows={2}
          name="remark"
          placeholder="Enter Remark..."
          value={formInputs.remark}
          onChange={handleInputChange}
        />
      </FormControl>

      <div className="col-span-2 mt-4 flex items-center justify-center gap-4">
        <Button
          className="col-span-2 w-fit"
          colorScheme="purple"
          isLoading={loading}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
