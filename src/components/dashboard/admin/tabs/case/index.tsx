// components/tabs/ProfileTab.tsx
import { Button, Checkbox, Select } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import TabLayout from '../tab-layout';
import LoaderComponent from '@/components/ui/loader';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import DisplayTable from '@/components/ui/display-table';
import { DialogButton } from '@/components/ui/alert-dialog';
import { useCases } from '@/hooks/useCasesHook';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { today } from '@/lib/utils/todayDate';
import { useAuth } from '@/context/user/userContext';

const CaseTab = () => {
  const router = useRouter();
  const {
    allCases,
    getAllCases,
    fetchCasesByPriority,
    deleteCase,
    fetchCasesByLawyerId,
  } = useCases();
  const [selectPriority, setSelectedPriority] = useState('');
  // const { loading, setLoading } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState(false);
  const { authUser, role } = useAuth();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    if (isChecked) {
      fetchCasesByLawyerId(authUser?.uid as string);
    } else {
      getAllCases();
    }
  }, [isChecked]);

  const handleFetch = async () => {
    if (selectPriority !== '') {
      await fetchCasesByPriority(selectPriority as 'HIGH' | 'MEDIUM' | 'LOW');
    }
    if (selectPriority === 'all') {
      await getAllCases();
    }
  };

  useEffect(() => {
    handleFetch();
  }, [selectPriority, router]);

  const columns = [
    { key: 'No', label: 'No', sortable: false },
    { key: 'caseDetails', label: 'Case Details', sortable: true },
    // { key: 'courtDetails', label: 'Court Details', sortable: true },
    { key: 'allotedLaywer', label: 'Lawyer', sortable: true },
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
      const _nextHearing: any = caseData?.nextHearing;
      const endDate = caseData?.nextHearing
        ? parseISO(caseData?.nextHearing)
        : null;

      // Calculate the difference between the current date and the end date
      const daysUntilEnd = endDate
        ? differenceInCalendarDays(endDate, today)
        : null;

      let rowColor = '';
      if (
        caseData?.caseStatus !== 'DECIDED' && // Ensure case is not "Decided"
        ((daysUntilEnd !== null && daysUntilEnd <= 2) ||
          _nextHearing === 'Unknown')
      ) {
        rowColor = 'bg-red-300';
      }

      return {
        No: `${index + 1}`, // No as index
        id: caseData?.caseId,
        caseDetails: `CaseNo:${caseData?.caseNo} \nType:${caseData?.caseType}`, // Case Details
        courtDetails: `Court:${caseData?.courtName || 'NA'} `, // Court details
        petitionVsRespondent: `${caseData?.petition?.petitioner || 'NA'}\nvs\n${caseData?.respondent?.respondentee || 'NA'}`, // Petitioner vs Respondent
        nextDate: caseData?.nextHearing || 'TBD', // Next Hearing Date
        status: caseData?.caseStatus, // Status
        clientName: caseData?.clientDetails?.name || 'NA',
        priority: caseData?.priority,
        allotedLaywer: caseData?.lawyer?.name || 'NA',
        rowColor,
      };
    });
  }, [allCases]);

  // Only stop loading after both data fetching and transformation are complete
  useEffect(() => {
    setLoading(true);
    if (transformedData) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300); // 3 seconds timeout

      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId);
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
      onClick={() => window.open(`/dashboard/admin/edit-case/${id}`, '_blank')}
    >
      Edit
    </Button>,
    <Button
      colorScheme="purple"
      mt={2}
      className="w-full"
      onClick={() => window.open(`/case/${id}`, '_blank')}
    >
      View
    </Button>,
  ];
  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <div className="mb-6 flex flex-col items-start justify-start gap-3">
          <h1 className="heading-primary">Cases</h1>
          {role === 'ADMIN' && (
            <Checkbox isChecked={isChecked} onChange={handleCheckboxChange}>
              My Cases
            </Checkbox>
          )}
        </div>
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
          <option value={'all'}>All</option>
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
