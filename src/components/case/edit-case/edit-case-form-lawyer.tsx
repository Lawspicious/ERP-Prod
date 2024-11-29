import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useCases } from '@/hooks/useCasesHook';
import { ICase } from '@/types/case';
import { IUser } from '@/types/user';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Button,
  Input,
  Flex,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const EditCaseFormLawyer = ({ caseData }: { caseData: ICase }) => {
  const initialData = {
    caseType: caseData.caseType || '',
    regDate: caseData.regDate || '',
    CNRNo: caseData.CNRNo || '',
    nextHearing: caseData.nextHearing || '',
    decision: caseData.decision || '',
    caseStatus: caseData.caseStatus || 'RUNNING',
    courtName: caseData.courtName || '',
    petition: {
      petitioner: caseData.petition?.petitioner || '',
    },
    respondent: {
      respondentee: caseData.respondent?.respondentee || '',
    },
    caseFiles: caseData.caseFiles || '',
  };
  const [formInputs, setFormInputs] = useState({ ...initialData });
  const { loading, setLoading } = useLoading();
  const { updateCase } = useCases();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    if (caseData.caseId) {
      await updateCase(caseData?.caseId, formInputs, caseData.caseNo);
    }
    setLoading(false);
  };

  return loading ? (
    <LoaderComponent />
  ) : !caseData ? (
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
            (window.location.href = '/dashboard/lawyer/workspace-lawyer#case')
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
              <FormLabel>Case Type</FormLabel>
              <Input
                type="text"
                name="caseType"
                placeholder="Enter case type"
                value={formInputs.caseType}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Registration Date</FormLabel>
              <Input
                type="date"
                name="regDate"
                value={formInputs.regDate}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>CNR No</FormLabel>
              <Input
                type="text"
                name="CNRNo"
                placeholder="Enter CNR No"
                value={formInputs.CNRNo}
                onChange={handleInputChange}
              />
              <FormHelperText>
                Case Number Record (CNR) is unique ID number which remains
                constant
              </FormHelperText>
            </FormControl>
          </section>
          <section className="flex flex-col gap-6">
            <FormControl isRequired>
              <FormLabel>Next Hearing Date</FormLabel>
              <Input
                type="date"
                name="nextHearing"
                value={formInputs.nextHearing}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl isRequired isReadOnly>
              <FormLabel>Case Status</FormLabel>
              <Select name="caseStatus" value={formInputs.caseStatus}>
                <option value="RUNNING">Running</option>
                <option value="DECIDED">Decided</option>
                <option value="PENDING">Pending</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Court Name</FormLabel>
              <Input
                type="text"
                name="courtName"
                placeholder="Enter court name"
                value={formInputs.courtName}
                onChange={handleInputChange}
              />
            </FormControl>
          </section>
        </div>
        <hr className="my-10 h-[0.5px] border-gray-200" />
        {/* petitioner and advocate */}
        <div>
          <h3 className="mb-4 text-lg font-semibold md:text-xl">
            Petitioner and Advocate
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="flex flex-col gap-6">
              <FormControl isRequired>
                <FormLabel>Petitioner</FormLabel>
                <Input
                  type="text"
                  readOnly
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
              <FormControl isRequired>
                <FormLabel>Respondent</FormLabel>
                <Input
                  type="text"
                  name="respondentee"
                  readOnly
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
          <FormControl isRequired isReadOnly>
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

        <Flex align={'center'} gap={4} justify={'center'}>
          <Button
            isLoading={loading}
            type="submit"
            colorScheme="purple"
            className="btn-primary"
          >
            Submit
          </Button>
        </Flex>
      </form>
    </div>
  );
};

export default EditCaseFormLawyer;
