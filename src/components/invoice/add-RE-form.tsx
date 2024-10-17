import { useToastHook } from '@/hooks/shared/useToastHook';
import { today } from '@/lib/utils/todayDate';
import { ICase } from '@/types/case';
import { IClient, IClientProspect } from '@/types/client';
import { IRE } from '@/types/invoice';
import {
  FormControl,
  FormLabel,
  Select,
  Button,
  Input,
} from '@chakra-ui/react';
import React from 'react';

interface ADDREFormProps {
  allClients: (IClient | IClientProspect)[];
  allCases: ICase[];
  REData: IRE[];
  invoiceDueDate: string;
  selectedClientId: string;
  setREData: React.Dispatch<React.SetStateAction<IRE[]>>;
  setInvoiceDueDate: React.Dispatch<React.SetStateAction<string>>;
  setSelectedClientId: React.Dispatch<React.SetStateAction<string>>;
}

const AddREForm = ({
  allClients,
  allCases,
  REData,
  invoiceDueDate,
  selectedClientId,
  setREData,
  setInvoiceDueDate,
  setSelectedClientId,
}: ADDREFormProps) => {
  const [state, newToast] = useToastHook();

  const handleChangeRE = (e: any, i: number) => {
    const { name, value } = e.target;
    let temp = [...REData];
    temp[i] = {
      ...temp[i],
      [name]: value,
    };
    setREData(temp);
  };

  const handleAddMoreRE = () => {
    const lastREIndex = REData.length - 1;
    if (REData[lastREIndex].caseId !== '') {
      let temp = [...REData];
      temp.push({
        caseId: '',
      });
      setREData(temp);
    } else {
      alert('fill up the previous');
    }
  };

  const handleDeleteRE = (index: number) => {
    if (REData.length > 1) {
      setREData(REData.splice(index, 1));
    } else {
      newToast({
        status: 'error',
        message: 'Can not delete!',
      });
    }
  };
  return (
    <>
      <FormControl isRequired>
        <FormLabel>Client Name</FormLabel>
        <Select
          name="client Id"
          placeholder="Add Client"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          {allClients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <div className="space-y-4">
        <FormControl>
          <FormLabel>Invoice Date</FormLabel>
          <Input disabled value={today} type="date" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Invoice Due Date</FormLabel>
          <Input
            value={invoiceDueDate}
            onChange={(e) => setInvoiceDueDate(e.target.value)}
            type="date"
          />
        </FormControl>
      </div>
      <h2 className="heading-secondary col-span-2">RE</h2>
      <div className="col-span-2 space-y-4">
        {REData.map((RE: IRE, i: number) => (
          <div className="space-y-4" key={i}>
            <section className="flex justify-between">
              <h1 className="text-xl font-semibold">#{i + 1}</h1>
              <button
                className="btn-primary bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                onClick={() => handleDeleteRE(i)}
              >
                delete
              </button>
            </section>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormControl>
                <FormLabel>Select Case</FormLabel>
                <Select
                  name="caseId"
                  placeholder="Select Case"
                  value={RE.caseId}
                  onChange={(e) => {
                    handleChangeRE(e, i);
                  }}
                >
                  {allCases.map((caseData) => (
                    <option key={caseData.caseId} value={caseData.caseId}>
                      {caseData.caseId} - {caseData.petition.petitioner} VS{' '}
                      {caseData.respondent.respondentee}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </section>

            <div className="grid grid-cols-2 gap-4">
              {/* add input field */}
            </div>
          </div>
        ))}
        <Button onClick={handleAddMoreRE} colorScheme="purple">
          Add More
        </Button>
      </div>
    </>
  );
};

export default AddREForm;
