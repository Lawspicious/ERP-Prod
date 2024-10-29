import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { caseTypes } from '@/db/caseTypes';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { ICase } from '@/types/case';
import { IClient, IClientProspect } from '@/types/client';
import { IUser } from '@/types/user';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Button,
  Input,
  Flex,
  Checkbox,
  Textarea,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const EditCaseForm = ({
  caseData,
  lawyers,
}: {
  caseData: ICase;
  lawyers: IUser[];
}) => {
  const [formInputs, setFormInputs] = useState({ ...caseData });
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { loading, setLoading } = useLoading();
  const { allClients } = useClient();
  const { updateCase } = useCases();
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

  const handleSubmit = async () => {
    await updateCase(caseData.caseId as string, formInputs as Partial<ICase>);
  };

  return loading ? (
    <LoaderComponent />
  ) : !caseData || !lawyers ? (
    <p>No Data found!!</p>
  ) : (
    <div>
      <div className="flex items-center justify-between gap-6">
        <h1 className="heading-primary mb-6">Edit Case</h1>
        <Button
          isLoading={loading}
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href = '/dashboard/admin/workspace-admin#case')
          }
        >
          Back
        </Button>
      </div>
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
          <h3 className="mb-4 text-lg font-semibold md:text-xl">
            Add Team Member
          </h3>
          <FormControl>
            <FormLabel>Team Member</FormLabel>
            <Select
              name="lawyerId"
              placeholder="Add team Member"
              value={selectedLawyerId}
              onChange={(e) => setSelectedLawyerId(e.target.value)}
            >
              {/* Group for Lawyers */}
              <optgroup label="Lawyers">
                {lawyers
                  .filter((team: IUser) => team.role === 'LAWYER')
                  .map((lawyer: IUser) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </option>
                  ))}
              </optgroup>

              {/* Group for Admins */}
              <optgroup label="Admins">
                {lawyers
                  .filter((team: IUser) => team.role === 'ADMIN')
                  .map((admin: IUser) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
              </optgroup>
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

export default EditCaseForm;
