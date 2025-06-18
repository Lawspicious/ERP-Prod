import { IService } from '@/types/invoice';
import {
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Input,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
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

  // const handleChange = (e: any, i: number) => {
  //   const { name, value } = e.target;
  //   let temp = [...services];
  //   temp[i] = {
  //     ...temp[i],
  //     [name]: value,
  //   };
  //   setServices(temp);
  // };

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

  // const handleDelete = (index: number) => {
  //   if (services.length > 1) {
  //     setServices(services.splice(index, 1) as IService[]);
  //   } else {
  //     newToast({
  //       status: 'error',
  //       message: 'Can not delete!',
  //     });
  //   }
  // };

  const handleDelete = (index: number) => {
    if (services.length > 1) {
      const updated = services.filter((_, i) => i !== index);
      setServices(updated);
    } else {
      newToast({
        status: 'error',
        message: 'Can not delete!',
      });
    }
  };

  const handleChange = (e: any, i: number) => {
    const { name, value } = e.target;
    let temp = [...services];
    temp[i] = {
      ...temp[i],
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    };
    setServices(temp);
  };

  //   const inputRef = useRef<HTMLInputElement>(null);
  //    const dropdownRef = useRef<HTMLUListElement>(null);
  // const [inputValue, setInputValue] = useState<string>('');
  //  const [isOpen, setIsOpen] = useState<boolean>(false);
  //   const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  return (
    <>
      <h2 className="heading-secondary col-span-2">Services</h2>
      <div className="col-span-2 space-y-4">
        {services.map((service: IService, i: number) => (
          <div className="space-y-4" key={i}>
            <section className="flex justify-between">
              <h1 className="text-xl font-semibold">#{i + 1}</h1>
              <button
                type="button"
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
                    onChange={(value) => {
                      handleChange({ target: { name: 'name', value } }, i);
                    }}
                    placeholder="Enter Service Name"
                    value={service.name}
                  />
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
