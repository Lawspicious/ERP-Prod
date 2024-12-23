// components/tabs/TaskTab.tsx
import { Button, Checkbox, useDisclosure } from '@chakra-ui/react';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import TabLayout from '../tab-layout';
import LoaderComponent from '@/components/ui/loader';
import { useTask } from '@/hooks/useTaskHooks';
import { DialogButton } from '@/components/ui/alert-dialog';
import DisplayTable from '@/components/ui/display-table';
import TaskEditModal from './action-button/edit-task-modal';
import TaskModal from './task-modal';
import { differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { useAuth } from '@/context/user/userContext';

const TaskTab = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    allTask,
    deleteTasks,
    loading,
    getTasksByLawyerId,
    getAllTask,
    setLoading,
  } = useTask();
  const [isChecked, setIsChecked] = useState(false);
  const { authUser, role } = useAuth();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    if (isChecked) {
      getTasksByLawyerId(authUser?.uid as string);
    } else {
      getAllTask();
    }
  }, [isChecked]);

  const taskColumns = [
    { key: 'No', label: 'No', sortable: false },
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

  const transformedTaskData = useMemo(() => {
    const today = new Date();
    const prevDate = today.setDate(today.getDate() - 1);
    return allTask.map((taskData, index) => {
      const endDate = taskData.endDate ? parseISO(taskData.endDate) : null;

      // Calculate the difference between the current date and the end date
      const daysUntilEnd = endDate
        ? differenceInCalendarDays(endDate, today)
        : null;

      let rowColor = '';
      if (taskData.taskStatus === 'COMPLETED') {
        rowColor = '';
      } else if (
        isBefore(endDate as Date, prevDate) ||
        (daysUntilEnd !== null && daysUntilEnd <= 2)
      ) {
        rowColor = isBefore(endDate as Date, prevDate)
          ? 'bg-red-400'
          : 'bg-red-200';
      }

      return {
        No: `${index + 1}`, // No as index
        id: taskData.id,
        taskName: taskData.taskName, // Task Name
        relatedTo: taskData.caseDetails.caseId
          ? `CaseNo:${taskData.caseDetails.caseNo}`
          : 'Other',
        petitionVsRespondent: taskData.caseDetails?.caseId
          ? `${taskData.caseDetails.petition.petitioner || 'NA'}\nvs\n${taskData.caseDetails.respondent.respondentee || 'NA'}`
          : 'N/A',
        startDate: taskData.startDate || 'TBD', // Start Date
        endDate: taskData.endDate || 'TBD', // End Date
        member:
          taskData.lawyerDetails?.map((lawyer) => lawyer.name).join(', ') ||
          'No Lawyers Assigned',
        status: taskData.taskStatus, // Status
        priority: taskData.priority, // Priority
        rowColor, // Row color based on end date proximity
        deleteName: taskData.taskName,
      };
    });
  }, [allTask]);

  // Only stop loading after both data fetching and transformation are complete
  useEffect(() => {
    setLoading(true);
    if (transformedTaskData) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300); // 3 seconds timeout

      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId);
    }
  }, [transformedTaskData]);

  const taskActionButtons = (
    id: string,
    deleteName: string,
  ): ReactElement[] => [
    <DialogButton
      title={'Delete'}
      message={'Do you want to delete the task?'}
      onConfirm={async () => deleteTasks(id, deleteName)}
      children={'Delete'}
      confirmButtonColorScheme="red"
      confirmButtonText="Delete"
    />,
    <TaskEditModal taskId={id} />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => window.open(`/task/${id}`, '_blank')}
    >
      View
    </Button>,
  ];

  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <div className="mb-6 flex flex-col items-start justify-start gap-3">
          <h1 className="heading-primary">Task</h1>
          {role === 'ADMIN' && (
            <Checkbox
              isChecked={isChecked}
              onChange={handleCheckboxChange}
              transition={'step-start'}
            >
              My Tasks
            </Checkbox>
          )}
        </div>

        <Button colorScheme="purple" onClick={onOpen}>
          Add Task
        </Button>
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allTask.length > 0 ? (
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
