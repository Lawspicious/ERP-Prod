import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { ICase, ILawyer } from '@/types/case';
import { IUser } from '@/types/user';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { IClient, IClientProspect } from '@/types/client';
import { ArrowLeft, MoveLeft, MoveRight } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import { today } from '@/lib/utils/todayDate';
import { caseTypes } from '@/db/caseTypes';

const initialFormData = {
  caseNo: '',
  caseType: '',
  regDate: today,
  CNRNo: '',
  nextHearing: '',
  decision: '',
  caseStatus: 'RUNNING',
  courtName: '',
  petition: { petitioner: '' },
  respondent: { respondentee: '' },
  caseFiles: '',
  reference: '',
  priority: 'MEDIUM',
  lawyerActionStatus: '',
  lawyer: {
    name: '',
    phoneNumber: '',
    id: '',
    email: '',
  },
  clientDetails: {
    id: '',
    name: '',
    email: '',
    mobile: '',
  },
  // extras
  judge: '',
  fillingNo: '',
  regNo: '',
  FIR: '',
};

const AddCaseForm = ({
  lawyers,
  backHref,
  setActiveStep,
}: {
  lawyers: IUser[];
  backHref: string;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { createCase } = useCases();
  const [formInputs, setFormInputs] = useState({ ...initialFormData });
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { loading, setLoading } = useLoading();
  const { allClients } = useClient();
  const [isOtherCaseType, setIsOtherCaseType] = useState(false);

  useEffect(() => {
    if (selectedLawyerId !== '') {
      const _lawyer = lawyers.find((lawyer) => lawyer.id === selectedLawyerId);
      if (_lawyer) {
        const selectedLawyer = {
          id: selectedLawyerId,
          name: _lawyer.name,
          email: _lawyer.email,
          phoneNumber: _lawyer.phoneNumber,
        };
        setFormInputs({
          ...formInputs,
          ['lawyer']: selectedLawyer,
        });
      }
    }
  }, [selectedLawyerId]);

  useEffect(() => {
    if (selectedClientId !== '') {
      const _client = allClients.find(
        (client) => client.id === selectedClientId,
      );
      if (_client) {
        const selectedclient = {
          id: selectedClientId,
          name: _client.name,
          email: _client.email,
          mobile: _client.mobile,
        };
        setFormInputs({
          ...formInputs,
          ['clientDetails']: selectedclient,
        });
      }
    }
  }, [selectedClientId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const _createCaseData = {
        ...formInputs,
        hearings: [
          {
            date: formInputs.nextHearing,
            remarks: 'First Hearing',
          },
        ],
      };
      console.log(_createCaseData);
      await createCase(_createCaseData as ICase);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-6">
        <h1 className="heading-primary">Add New Case</h1>
        <Button
          isLoading={loading}
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() => (window.location.href = backHref)}
        >
          Back
        </Button>
      </div>
      <p className="mb-4 flex gap-2 text-black/60">
        Add More Client? Go to{' '}
        <span
          className="flex cursor-pointer items-center justify-start gap-2 underline"
          onClick={() => setActiveStep(1)}
        >
          Previous <MoveLeft />
        </span>
      </p>
      <form onSubmit={handleSubmit}>
        <h3 className="mb-4 text-lg font-semibold md:text-xl">Case Details</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="flex flex-col gap-6">
            <FormControl isRequired>
              <FormLabel>Case No</FormLabel>
              <Input
                type="text"
                name="caseNo"
                value={formInputs.caseNo}
                onChange={handleInputChange}
                placeholder="Enter Case No"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Case Type</FormLabel>
              <Checkbox
                isChecked={isOtherCaseType}
                onChange={() => setIsOtherCaseType(!isOtherCaseType)}
                mb={4}
              >
                Add Other Case Type
              </Checkbox>
              {isOtherCaseType ? (
                <Input
                  type="text"
                  name="caseType"
                  placeholder="Enter Case Type"
                  value={formInputs.caseType}
                  onChange={handleInputChange}
                />
              ) : (
                <Select
                  name="caseType"
                  value={formInputs.caseType}
                  onChange={handleInputChange}
                  placeholder="Select Case Type"
                >
                  {caseTypes.map((caseType: string, i) => (
                    <option key={i} value={caseType}>
                      {caseType}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Registration Date</FormLabel>
              <Input
                type="date"
                name="regDate"
                value={formInputs.regDate}
                readOnly
              />
            </FormControl>

            <FormControl>
              <FormLabel>CNR No</FormLabel>
              <Input
                type="text"
                name="CNRNo"
                placeholder="Enter CNR No"
                value={formInputs.CNRNo}
                onChange={handleInputChange}
              />
              <FormHelperText>
                Case Number Record (CNR) is a unique ID number which remains
                constant
              </FormHelperText>
            </FormControl>
          </section>
          <section className="flex flex-col gap-6">
            <FormControl>
              <FormLabel>Next Hearing Date</FormLabel>
              <Input
                type="date"
                name="nextHearing"
                value={formInputs.nextHearing}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Case Status</FormLabel>
              <Select
                name="caseStatus"
                value={formInputs.caseStatus}
                onChange={handleInputChange}
              >
                <option value="RUNNING">Running</option>
                <option value="DECIDED">Decided</option>
                <option value="PENDING">Pending</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Lawyer Action Status</FormLabel>
              <Input
                type="text"
                name="lawyerActionStatus"
                value={formInputs.lawyerActionStatus}
                onChange={handleInputChange}
                placeholder="Enter Lawyer Action Status"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Court Name</FormLabel>
              <Input
                type="text"
                name="courtName"
                placeholder="Enter court name"
                value={formInputs.courtName}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Reference</FormLabel>
              <Textarea
                rows={2}
                name="reference"
                placeholder="Add Reference"
                value={formInputs.reference}
                onChange={handleInputChange}
              />
            </FormControl>
          </section>
        </div>
        {/* petitioner and advocate */}
        <hr className="my-10 h-[0.5px] border-gray-200" />
        {/* petitioner and advocate */}
        <div>
          <h3 className="mb-4 text-lg font-semibold md:text-xl">
            Petitioner and Respondent
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="flex flex-col gap-6">
              <FormControl>
                <FormLabel>Petitioner</FormLabel>
                <Input
                  type="text"
                  name="petitioner"
                  placeholder="Enter petitioner name"
                  value={formInputs.petition.petitioner}
                  onChange={(e) =>
                    setFormInputs({
                      ...formInputs,
                      petition: {
                        ...formInputs.petition,
                        petitioner: e.target.value,
                      },
                    })
                  }
                />
              </FormControl>
            </section>
            <section className="flex flex-col gap-6">
              <FormControl>
                <FormLabel>Respondent</FormLabel>
                <Input
                  type="text"
                  name="respondentee"
                  placeholder="Enter respondent name"
                  value={formInputs.respondent.respondentee}
                  onChange={(e) =>
                    setFormInputs({
                      ...formInputs,
                      respondent: {
                        ...formInputs.respondent,
                        respondentee: e.target.value,
                      },
                    })
                  }
                />
              </FormControl>
            </section>
          </div>
        </div>
        <hr className="my-10 h-[0.5px] border-gray-200" />
        {/* Case Files */}
        <div>
          <FormControl>
            <FormLabel>Case Files</FormLabel>
            <Input
              type="text"
              name="caseFiles"
              placeholder="Enter case files"
              value={formInputs.caseFiles}
              onChange={handleInputChange}
            />
            <FormHelperText>
              * Please add google drive link containing the case files
            </FormHelperText>
          </FormControl>
        </div>
        <hr className="my-10 h-[0.5px] border-gray-200" />
        <FormControl mb={6}>
          <FormLabel>Priority</FormLabel>
          <Select
            name="priority"
            value={formInputs.priority}
            onChange={handleInputChange}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </FormControl>
        <div className="mb-4">
          <h3 className="mb-4 text-lg font-semibold md:text-xl">Add Lawyer</h3>
          <FormControl>
            <FormLabel>Lawyer</FormLabel>
            <Select
              name="lawyerId"
              placeholder="Enter lawyer details"
              value={selectedLawyerId}
              onChange={(e) => setSelectedLawyerId(e.target.value)}
            >
              {lawyers.map((team: IUser) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="mb-4">
          <h3 className="mb-4 text-lg font-semibold md:text-xl">Add Client</h3>
          <FormControl>
            <FormLabel>Client</FormLabel>
            <Select
              name="clientId"
              placeholder="Enter Client details"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              {allClients.map((client: IClient | IClientProspect) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <Button
            isLoading={loading}
            type="submit"
            colorScheme="purple"
            className="btn-primary"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCaseForm;
