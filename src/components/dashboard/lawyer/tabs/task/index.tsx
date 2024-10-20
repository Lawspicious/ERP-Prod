// components/tabs/TaskTab.tsx
import { Button, useDisclosure } from '@chakra-ui/react';
import { ReactElement, useEffect, useMemo } from 'react';
import TabLayout from '../tab-layout';
import LoaderComponent from '@/components/ui/loader';
import { useTask } from '@/hooks/useTaskHooks';
import { DialogButton } from '@/components/ui/alert-dialog';
import DisplayTable from '@/components/ui/display-table';
import TaskEditModal from '@/components/dashboard/admin/tabs/task/action-button/edit-task-modal';
import TaskModal from '@/components/dashboard/admin/tabs/task/task-modal';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';

const TaskTab = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { allTaskLawyer, getTasksByLawyerId } = useTask();
  const { loading, setLoading } = useLoading();
  const { authUser } = useAuth();

  const taskColumns = [
    // { key: 'No', label: 'No', sortable: false },
    { key: 'taskName', label: 'Task Name', sortable: true },
    { key: 'relatedTo', label: 'Related To', sortable: true },
    {
      key: 'petitionVsRespondent',
      label: 'Pet vs Resp',
      sortable: false,
    },
    { key: 'startDate', label: 'Start Date', sortable: true },
    { key: 'endDate', label: 'End Date', sortable: true },
    { key: 'member', label: 'Member', sortable: true },
    // { key: 'status', label: 'Status', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  useEffect(() => {
    getTasksByLawyerId(authUser?.uid as string);
  }, []);

  const transformedTaskData = useMemo(() => {
    return allTaskLawyer.map((taskData, index) => {
      return {
        No: `${index + 1}`, // No as index
        id: taskData?.id,
        taskName: taskData?.taskName, // Task Name
        relatedTo: taskData?.caseDetails?.caseId
          ? `CaseNo:${taskData?.caseDetails?.caseNo}`
          : 'Other',
        petitionVsRespondent: taskData?.caseDetails?.caseId
          ? `${taskData?.caseDetails?.petition?.petitioner}\nvs\n${taskData?.caseDetails?.respondent?.respondentee}`
          : 'N/A',
        startDate: taskData?.startDate || 'TBD', // Start Date
        endDate: taskData?.endDate || 'TBD', // End Date
        member:
          taskData?.lawyerDetails?.map((lawyer) => lawyer.name).join(', ') ||
          'No Lawyers Assigned',
        status: taskData?.taskStatus, // Status
        priority: taskData?.priority, // Priority
      };
    });
  }, [allTaskLawyer]);

  const taskActionButtons = (id: string): ReactElement[] => [
    <TaskEditModal taskId={id} />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => (window.location.href = `/task/${id}`)}
    >
      View
    </Button>,
  ];

  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <h1 className="heading-primary mb-6">Task</h1>
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allTaskLawyer.length > 0 ? (
        <DisplayTable
          data={transformedTaskData}
          columns={taskColumns}
          tabField={'status'}
          actionButton={taskActionButtons}
        />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Task found!
        </div>
      )}

      <TaskModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </TabLayout>
  );
};

export default TaskTab;
