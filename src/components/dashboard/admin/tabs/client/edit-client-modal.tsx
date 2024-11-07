import { useClient } from '@/hooks/useClientHook';
import { IClient, IClientProspect } from '@/types/client';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Radio,
  Stack,
  Switch,
  useDisclosure,
  Grid,
  SimpleGrid,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface EditClientModalProps {
  client: IClient | IClientProspect;
}

const EditClientModal = ({ client }: EditClientModalProps) => {
  const [formInputs, setFormInputs] = useState(client);
  const { updateClient } = useClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (client) {
      setFormInputs(client);
    }
  }, [client]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await updateClient(client.id as string, formInputs);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple" className="mb-2 w-full">
        Edit
      </Button>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay />
          <ModalContent mx={4}>
            <ModalHeader>Edit Client</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
                width={'100%'}
              >
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="Enter name"
                    value={formInputs.name}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    placeholder="Enter email"
                    value={formInputs.email}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    name="gender"
                    placeholder="Select gender"
                    value={formInputs.gender}
                    onChange={handleSelectChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                {formInputs.clientType === 'normal' && (
                  <>
                    <FormControl>
                      <FormLabel>Mobile</FormLabel>
                      <Input
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={formInputs.mobile}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Input
                        name="address"
                        placeholder="Enter address"
                        value={formInputs.address}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Country</FormLabel>
                      <Input
                        name="country"
                        placeholder="Enter country"
                        value={formInputs.country}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>State</FormLabel>
                      <Input
                        name="state"
                        placeholder="Enter state"
                        value={formInputs.state}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Input
                        name="city"
                        placeholder="Enter city"
                        value={formInputs.city}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </>
                )}

                {formInputs.clientType === 'prospect' && (
                  <>
                    <FormControl>
                      <FormLabel>Mobile</FormLabel>
                      <Input
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={formInputs.mobile}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input
                        name="location"
                        placeholder="Enter location"
                        value={formInputs.location}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Follow Up</FormLabel>
                      <Switch
                        name="followUp"
                        isChecked={formInputs.followUp}
                        onChange={handleSwitchChange}
                      />
                    </FormControl>

                    {formInputs.followUp && (
                      <FormControl>
                        <FormLabel>Next Follow Up Date</FormLabel>
                        <Input
                          type="date"
                          name="nextFollowUpDate"
                          value={formInputs.nextFollowUpDate || ''}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    )}

                    <FormControl>
                      <FormLabel>Source</FormLabel>
                      <Select
                        name="source"
                        placeholder="Select source"
                        value={formInputs.source}
                        onChange={handleSelectChange}
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
                        name="service"
                        placeholder="Enter service"
                        value={formInputs.service}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Client Feedback</FormLabel>
                      <Textarea
                        name="client_feedback"
                        placeholder="Enter client feedback"
                        value={formInputs.client_feedback}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </>
                )}
                <FormControl>
                  <FormLabel>Rating</FormLabel>
                  <Input
                    name="rating"
                    placeholder="Enter rating"
                    value={formInputs.rating}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl className="col-span-2 w-full">
                  <FormLabel>Remark</FormLabel>
                  <Textarea
                    name="remark"
                    placeholder="Enter remark"
                    value={formInputs.remark}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={handleSubmit}>
                Save
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default EditClientModal;
