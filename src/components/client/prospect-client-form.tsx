import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Box,
  Checkbox,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { IClientProspect } from '@/types/client';
import { useClient } from '@/hooks/useClientHook';
import StarRating from '../ui/star-rating';
import { today } from '@/lib/utils/todayDate';
import { useLoading } from '@/context/loading/loadingContext';

const initialData: IClientProspect = {
  name: '',
  email: '',
  mobile: '',
  location: '',
  followUp: false,
  source: 'Website',
  service: '',
  client_feedback: '',
  status: 'ACTIVE',
  clientType: 'prospect',
  rating: 1,
  gender: 'Male',
  nextFollowUpDate: today,
  remark: '',
};

const ClientProspectForm = () => {
  const [formInputs, setFormInputs] = useState<IClientProspect>({
    ...initialData,
  });
  const toast = useToast();
  const { loading, setLoading } = useLoading();
  const { createClient } = useClient();

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
        description: 'Case created successfully',
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Case can not created',
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
        <FormLabel>Location</FormLabel>
        <Input
          type="text"
          name="location"
          placeholder="Enter location"
          value={formInputs.location}
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
      <div>
        <FormControl mb={4}>
          <FormLabel>Follow Up</FormLabel>
          <Checkbox
            isChecked={formInputs.followUp}
            onChange={(e) =>
              setFormInputs((prev) => ({
                ...prev,
                followUp: e.target.checked,
              }))
            }
            name="followUp"
          >
            Follow up the client?
          </Checkbox>
        </FormControl>
        {formInputs.followUp && (
          <FormControl>
            <FormLabel>Next Follow Up Date</FormLabel>
            <Input
              type="date"
              name="nextFollowUpDate"
              value={formInputs.nextFollowUpDate}
              onChange={handleInputChange}
            />
          </FormControl>
        )}
      </div>

      <FormControl>
        <FormLabel>Source</FormLabel>
        <Select
          name="source"
          value={formInputs.source}
          onChange={handleInputChange}
        >
          <option value="Website">Website</option>
          <option value="Social Media">Social Media</option>
          <option value="Newspaper">Newspaper</option>
          <option value="Friends">Friends</option>
          <option value="Others">Others</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Service</FormLabel>
        <Input
          type="text"
          name="service"
          placeholder="Enter service"
          value={formInputs.service}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Client Feedback</FormLabel>
        <Input
          type="text"
          name="client_feedback"
          placeholder="Enter feedback"
          value={formInputs.client_feedback}
          onChange={handleInputChange}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Status</FormLabel>
        <Select
          name="status"
          placeholder="Enter status"
          value={formInputs.status}
          onChange={handleInputChange}
        >
          <option value={'ACTIVE'}>Active</option>
          <option value={'IN ACTIVE'}>Closed</option>
        </Select>
      </FormControl>
      <FormControl>
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

export default ClientProspectForm;
