import { IService } from '@/types/invoice';
import {
  Checkbox,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Button,
  Input,
} from '@chakra-ui/react';
import React from 'react';
import { serviceList, serviceList2 } from './add-invoice-form';
import { useToastHook } from '@/hooks/shared/useToastHook';
import AutocompleteTextbox from '../ui/auto-complete-textbox';

interface AddServiceFormProps {
  services: IService[];
  setServices: React.Dispatch<React.SetStateAction<IService[]>>;
  toggleOtherInput: boolean;
  setToggleOtherInput: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddServiceForm = ({
  services,
  setServices,
  toggleOtherInput,
  setToggleOtherInput,
}: AddServiceFormProps) => {
  const [state, newToast] = useToastHook();

  const handleChange = (e: any, i: number) => {
    const { name, value } = e.target;
    let temp = [...services];
    temp[i] = {
      ...temp[i],
      [name]: value,
    };
    setServices(temp);
  };

  const handleAddMore = () => {
    const lastserviceIndex = services.length - 1;
    if (
      services[lastserviceIndex].description !== '' &&
      services[lastserviceIndex].name !== '' &&
      services[lastserviceIndex].amount !== 0
    ) {
      let temp = [...services];
      temp.push({
        description: '',
        name: '',
        amount: 0,
      });
      setServices(temp as IService[]);
    } else {
      alert('fill up the previous');
    }
  };

  const handleDelete = (index: number) => {
    if (services.length > 1) {
      setServices(services.splice(index, 1) as IService[]);
    } else {
      newToast({
        status: 'error',
        message: 'Can not delete!',
      });
    }
  };

  return (
    <>
      <h2 className="heading-secondary col-span-2">Services</h2>
      <div className="col-span-2 space-y-4">
        {services.map((service: IService, i: number) => (
          <div className="space-y-4" key={i}>
            <section className="flex justify-between">
              <h1 className="text-xl font-semibold">#{i + 1}</h1>
              <button
                className="btn-primary bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                onClick={() => handleDelete(i)}
              >
                delete
              </button>
            </section>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* <Checkbox
                  mb={4}
                  onChange={() => setToggleOtherInput(!toggleOtherInput)}
                  checked={toggleOtherInput}
                >
                  Other Service?
                </Checkbox> */}
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  {/* {toggleOtherInput ? (
                    <> */}
                  {/* <Input
                      type="text"
                      name="name"
                      placeholder="Enter Service Name"
                      value={service.name}
                      onChange={(e) => handleChange(e, i)}
                    /> */}

                  <AutocompleteTextbox
                    options={serviceList2}
                    handleChange={(e) => handleChange(e, i)}
                    placeholder="Enter Service Name"
                  />

                  {/* ) : (
                    <Select
                      placeholder="Select Service"
                      name="name"
                      value={service.name}
                      onChange={(e) => handleChange(e, i)}
                    >
                      {serviceList.map((list, i) => (
                        <option key={i} value={list}>
                          {list}
                        </option>
                      ))}
                    </Select>
                  )} */}
                </FormControl>
              </div>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Write a description"
                  rows={3}
                  name="description"
                  value={service.description}
                  onChange={(e) => handleChange(e, i)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input
                  placeholder="Enter Amount"
                  type="number"
                  name="amount"
                  value={service.amount}
                  onChange={(e) => handleChange(e, i)}
                />
              </FormControl>
            </div>
          </div>
        ))}
        <Button onClick={handleAddMore} colorScheme="purple">
          Add More
        </Button>
      </div>
    </>
  );
};

export default AddServiceForm;
