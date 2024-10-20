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
import { useAuth } from '@/context/user/userContext';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { today } from '@/lib/utils/todayDate';

const CaseTab = () => {
  const router = useRouter();
  const { authUser } = useAuth();
  const {
    allCasesLawyer,
    fetchCasesByLawyerId,
    fetchCasesByPriorityAndLawyerId,
  } = useCases();
  const [selectPriority, setSelectedPriority] = useState('');
  // const { loading, setLoading } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

  const handleFetch = async () => {
    if (selectPriority === '') {
      await fetchCasesByLawyerId(authUser?.uid as string);
    } else {
      await fetchCasesByPriorityAndLawyerId(
        selectPriority as 'HIGH' | 'MEDIUM' | 'LOW',
        authUser?.uid as string,
      );
    }
  };

  useEffect(() => {
    handleFetch();
  }, [selectPriority, router]);

  const columns = [
    { key: 'No', label: 'No', sortable: false },
    { key: 'caseRegistration', label: 'Case Details', sortable: true },
    { key: 'courtDetails', label: 'Court Details', sortable: true },
    {
      key: 'petitionVsRespondent',
      label: 'Pet vs Resp',
      sortable: false,
    },
    { key: 'nextDate', label: 'Next Date', sortable: true },
    { key: 'allotedClient', label: 'Client', sortable: true },
    // { key: 'status', label: 'Status', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  const transformedData = useMemo(() => {
    return allCasesLawyer.map((caseData, index) => {
      const endDate = caseData.nextHearing
        ? parseISO(caseData.nextHearing)
        : null;

      // Calculate the difference between the current date and the end date
      const daysUntilEnd = endDate
        ? differenceInCalendarDays(endDate, today)
        : null;

      // Determine the color based on how near the end date is
      let rowColor = ''; // Default color
      if (daysUntilEnd !== null && daysUntilEnd <= 2) {
        rowColor = 'bg-red-300'; // If the end date is within 2 days
      }
      return {
        No: `${index + 1}`, // No as index
        id: caseData?.caseId,
        caseRegistration: `CaseNo:${caseData?.caseNo} \nType:${caseData?.caseType}`, // Case Details
        courtDetails: `Court:${caseData?.courtName || 'NA'} `,
        petitionVsRespondent: `${caseData?.petition?.petitioner}\nvs\n${caseData?.respondent?.respondentee}`, // Petitioner vs Respondent
        nextDate: caseData?.nextHearing || 'TBD', // Next Hearing Date
        allotedClient: caseData?.clientDetails?.name,
        status: caseData?.caseStatus, // Status
        priority: caseData?.priority,
        rowColor,
      };
    });
  }, [allCasesLawyer]);

  // Only stop loading after both data fetching and transformation are complete
  useEffect(() => {
    if (transformedData) {
      setLoading(false); // Hide loader only after data transformation
    }
  }, [transformedData]);

  const actionButtons = (id: string): ReactElement[] => [
    // <DialogButton
    //   title={'Delete'}
    //   message={'Do you want to delete the case?'}
    //   onConfirm={async () => deleteCase(id)}
    //   children={'Delete'}
    //   confirmButtonColorScheme="red"
    //   confirmButtonText="Delete"
    // />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => router.push(`/dashboard/lawyer/edit-case/${id}`)}
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
        {/* <Button
          colorScheme="purple"
          onClick={() => router.push('/dashboard/lawyer/add-case')}
        >
          Add Case
        </Button> */}
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
        allCasesLawyer && (
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
