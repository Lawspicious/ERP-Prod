import TabLayout from '@/components/dashboard/admin/tabs/tab-layout';
import TaskModal from '@/components/dashboard/admin/tabs/task/task-modal';
import DisplayTable from '@/components/ui/display-table';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useTask } from '@/hooks/useTaskHooks';
import { ITask } from '@/types/task';
import { Button, useDisclosure } from '@chakra-ui/react';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';

const CaseTask = ({ caseId }: { caseId: string }) => {
  const [taskList, setTaskList] = useState<ITask[]>([]);
  const { getTasksByCaseId } = useTask();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const _list = await getTasksByCaseId(caseId as string);
      setTaskList(_list as ITask[]);
      setLoading(false);
    };
    fetchTasks();
  }, []);

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
    { key: 'status', label: 'Status', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  const transformedTaskData = useMemo(() => {
    return taskList.map((taskData, index) => {
      return {
        No: `${index + 1}`, // No as index
        id: taskData.id,
        taskName: taskData.taskName, // Task Name
        relatedTo: taskData.caseDetails.caseId
          ? `CaseNo:${taskData.caseDetails.caseNo}`
          : 'Other',
        petitionVsRespondent: taskData.caseDetails?.caseId
          ? `${taskData.caseDetails.petition.petitioner}\nvs\n${taskData.caseDetails.respondent.respondentee}`
          : 'N/A',
        startDate: taskData.startDate || 'TBD', // Start Date
        endDate: taskData.endDate || 'TBD', // End Date
        member:
          taskData.lawyerDetails?.map((lawyer) => lawyer.name).join(', ') ||
          'No Lawyers Assigned',
        status: taskData.taskStatus, // Status
        priority: taskData.priority, // Priority
      };
    });
  }, [taskList]);

  const taskActionButtons = (id: string): ReactElement[] => [
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => (window.location.href = `/task/${id}`)}
    >
      View
    </Button>,
  ];

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : taskList.length > 0 ? (
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
    </>
  );
};

export default CaseTask;
