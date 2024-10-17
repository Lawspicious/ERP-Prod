// components/tabs/ProfileTab.tsx
import { Button, Select } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import TabLayout from '../tab-layout';
import LoaderComponent from '@/components/ui/loader';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import DisplayTable from '@/components/ui/display-table';
import { DialogButton } from '@/components/ui/alert-dialog';
import { useCases } from '@/hooks/useCasesHook';
import { useLoading } from '@/context/loading/loadingContext';
import { truncate } from 'fs';

const CaseTab = () => {
  const router = useRouter();
  const { allCases, getAllCases, fetchCasesByPriority, deleteCase } =
    useCases();
  const [selectPriority, setSelectedPriority] = useState('');
  // const { loading, setLoading } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

  const handleFetch = async () => {
    if (selectPriority === '') {
      await getAllCases();
    } else {
      await fetchCasesByPriority(selectPriority as 'HIGH' | 'MEDIUM' | 'LOW');
    }
  };

  useEffect(() => {
    handleFetch();
  }, [selectPriority, router]);

  const columns = [
    { key: 'No', label: 'No', sortable: false },
    { key: 'caseDetails', label: 'Case Details', sortable: true },
    { key: 'courtDetails', label: 'Court Details', sortable: true },
    {
      key: 'petitionVsRespondent',
      label: 'Petitioner vs Respondent',
      sortable: false,
    },
    { key: 'nextDate', label: 'Next Date', sortable: true },
    // { key: 'status', label: 'Status', sortable: true },
    { key: 'clientName', label: 'Client', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  const transformedData = useMemo(() => {
    return allCases.map((caseData, index) => {
      return {
        No: `${index + 1}`, // No as index
        id: caseData.caseId,
        caseDetails: `CaseNo:${caseData.caseNo} \nType:${caseData.caseType}`, // Case Details
        courtDetails: `Court:${caseData.courtName || 'NA'} `, // Court details
        petitionVsRespondent: `${caseData.petition.petitioner || 'NA'}\nvs\n${caseData.respondent.respondentee || 'NA'}`, // Petitioner vs Respondent
        nextDate: caseData.nextHearing || 'TBD', // Next Hearing Date
        status: caseData.caseStatus, // Status
        clientName: caseData.clientDetails.name,
        priority: caseData.priority,
      };
    });
  }, [allCases]);

  // Only stop loading after both data fetching and transformation are complete
  useEffect(() => {
    if (transformedData) {
      setLoading(false); // Hide loader only after data transformation
    }
  }, [transformedData]);

  const actionButtons = (id: string): ReactElement[] => [
    <DialogButton
      title={'Delete'}
      message={'Do you want to delete the case?'}
      onConfirm={async () => deleteCase(id)}
      children={'Delete'}
      confirmButtonColorScheme="red"
      confirmButtonText="Delete"
    />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => router.push(`/dashboard/admin/edit-case/${id}`)}
    >
      Edit
    </Button>,
    <Button
      colorScheme="purple"
      mt={2}
      className="w-full"
      onClick={() => router.push(`/case/${id}`)}
    >
      View
    </Button>,
  ];
  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <h1 className="heading-primary mb-6">Cases</h1>
        <Button
          colorScheme="purple"
          onClick={() => router.push('/dashboard/admin/add-case')}
        >
          Add Case
        </Button>
      </section>
      <div className="mb-2 flex items-center justify-end">
        <Select
          placeholder="Select Priority"
          maxWidth={200}
          value={selectPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value={''}>All</option>
          <option value={'HIGH'}>High</option>
          <option value={'MEDIUM'}>Medium</option>
          <option value={'LOW'}>Low</option>
        </Select>
      </div>
      {loading ? (
        <LoaderComponent />
      ) : (
        allCases && (
          <DisplayTable
            data={transformedData}
            columns={columns}
            tabField={'status'}
            actionButton={actionButtons}
          />
        )
      )}
    </TabLayout>
  );
};

export default CaseTab;
