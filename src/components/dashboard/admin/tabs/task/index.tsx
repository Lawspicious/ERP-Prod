// components/tabs/TaskTab.tsx
import { Button, Checkbox, useDisclosure } from '@chakra-ui/react';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import TabLayout from '../tab-layout';
import LoaderComponent from '@/components/ui/loader';
import { useTask } from '@/hooks/useTaskHooks';
import { DialogButton } from '@/components/ui/alert-dialog';
import TaskEditModal from './action-button/edit-task-modal';
import TaskModal from './task-modal';
import TasksTable from './TasksTable'; // Import the new TasksTable
import { differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { useAuth } from '@/context/user/userContext';
import * as XLSX from 'xlsx';
import { useFollowUp } from '@/hooks/useFollowUp';

const TaskTab = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    allTask,
    deleteTasks,
    loading,
    getTasksByLawyerId,
    getAllTask,
    updateTask,
    setLoading,
    getTaskById,
  } = useTask();
  const [isChecked, setIsChecked] = useState(false);
  const { authUser, role } = useAuth();

  const { createFollowUp } = useFollowUp();

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
    { key: 'petitionVsRespondent', label: 'Pet vs Resp', sortable: false },
    { key: 'startDate', label: 'Start Date', sortable: true },
    { key: 'endDate', label: 'End Date', sortable: true },
    { key: 'member', label: 'Member', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  const transformedTaskData = useMemo(() => {
    const today = new Date();
    const prevDate = today.setDate(today.getDate() - 1);
    return allTask.map((taskData, index) => {
      const endDate = taskData.endDate ? parseISO(taskData.endDate) : null;

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

      const isCreatedByInLawyerDetails = taskData?.lawyerDetails?.some(
        (lawyer) => lawyer.id === taskData?.createdBy?.id,
      );

      return {
        No: `${index + 1}`,
        id: taskData.id,
        taskName: taskData.taskName,
        relatedTo: taskData?.caseDetails?.caseId
          ? `CaseNo:${taskData.caseDetails.caseNo}`
          : 'Other',
        petitionVsRespondent: taskData.caseDetails?.caseId
          ? `${taskData.caseDetails.petition.petitioner || 'NA'}\nvs\n${taskData.caseDetails.respondent.respondentee || 'NA'}`
          : 'N/A',
        startDate: taskData.startDate || 'TBD',
        endDate: taskData.endDate || 'TBD',
        member:
          taskData.lawyerDetails?.map((lawyer) => lawyer.name).join(', ') ||
          'No Lawyers Assigned',
        status: taskData.taskStatus,
        priority: taskData.priority,
        rowColor,
        deleteName: taskData.taskName,
        isMyTask: isCreatedByInLawyerDetails,
        selected: false,
        lastFollowUpAt: taskData.lastFollowUpAt,
      };
    });
  }, [allTask]);

  // Only stop loading after both data fetching and transformation are complete
  useEffect(() => {
    setLoading(true);
    if (transformedTaskData) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [transformedTaskData]);

  const taskActionButtons = (
    id: string,
    deleteName: string,
    data: { lastFollowUpAt?: any; status: string },
  ): ReactElement[] => {
    const canFollowUp = (() => {
      if (!data.lastFollowUpAt) return true;
      const last = new Date(data.lastFollowUpAt);
      const now = new Date();
      const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
      return diffHours > 3;
    })();
    const buttons: ReactElement[] = [
      <DialogButton
        key="delete"
        title={'Delete'}
        message={'Do you want to delete the task?'}
        onConfirm={async () => deleteTasks(id, deleteName)}
        confirmButtonColorScheme="red"
        confirmButtonText="Delete"
      >
        Delete
      </DialogButton>,

      <TaskEditModal key="edit" taskId={id} />,

      <Button
        key="view"
        colorScheme="purple"
        className="w-full"
        onClick={() => window.open(`/task/${id}`, '_blank')}
      >
        View
      </Button>,
    ];

    if (data.status === 'PENDING') {
      buttons.splice(
        2,
        0,
        <Button
          key="follow-up"
          disabled={!canFollowUp}
          colorScheme="purple"
          className="w-full"
          onClick={() =>
            createFollowUp({
              taskId: id,
              userId: authUser?.uid as string,
              userName: authUser?.displayName as string,
            })
          }
        >
          Follow Up
        </Button>,
      );
    }

    return buttons;
  };

  // Bulk Update Handlers
  const handleBulkUpdate = async (
    selectedTasks: Set<string>,
    field: string,
    value: string,
  ) => {
    // Skip processing if no tasks are selected
    if (selectedTasks.size === 0) return;

    try {
      // Handle the special case for combined updates
      if (field === 'combinedUpdate') {
        console.log('Processing combined update:', value);

        try {
          const updateValues = JSON.parse(value);

          for (const taskId of selectedTasks) {
            const task = allTask.find((t) => t.id === taskId);
            if (task && taskId) {
              const updatedTask = { ...task } as Record<string, any>;

              Object.keys(updateValues).forEach((key) => {
                updatedTask[key] = updateValues[key];
              });
              await updateTask(taskId, updatedTask, task.taskName);
            }
          }
        } catch (parseError) {
          console.error('Error parsing combined update:', parseError);
        }

        return;
      }

      // Regular single field update
      console.log(
        'Updating tasks:',
        selectedTasks,
        'Field:',
        field,
        'Value:',
        value,
      );

      for (const taskId of selectedTasks) {
        const task = allTask.find((t) => t.id === taskId);
        if (task && taskId) {
          const updatedTask = { ...task, [field]: value } as Record<
            string,
            any
          >;
          console.log('Updating task:', taskId, 'with value:', value);
          await updateTask(taskId, updatedTask, task.taskName);
        }
      }
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  const handleDeleteTasks = async (ids: string[]) => {
    for (const id of ids) {
      const task = allTask.find((t) => t.id === id);
      if (task) {
        await deleteTasks(id, task.taskName);
      }
    }
  };

  const handleExport = () => {
    try {
      // Transform the data for export, removing internal fields
      const exportData = transformedTaskData.map((task) => ({
        'Task Name': task.taskName,
        'Related To': task.relatedTo,
        'Petitioner vs Respondent': task.petitionVsRespondent,
        'Start Date': task.startDate,
        'End Date': task.endDate,
        Member: task.member,
        Status: task.status,
        Priority: task.priority,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
      XLSX.writeFile(wb, 'tasks_list.xlsx');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <div className="mb-6 flex flex-col items-start justify-start gap-3">
          <h1 className="heading-primary">Task</h1>
          {(role === 'ADMIN' || role === 'SUPERADMIN' || role === 'HR') && (
            <Checkbox
              isChecked={isChecked}
              onChange={handleCheckboxChange}
              transition={'step-start'}
            >
              My Tasks
            </Checkbox>
          )}
        </div>

        <div className="flex gap-2">
          {/* <Button
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            onClick={handleExport}
          >
            Export
          </Button> */}
          <Button colorScheme="purple" onClick={onOpen}>
            Add Task
          </Button>
        </div>
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allTask.length > 0 ? (
        <TasksTable
          data={transformedTaskData}
          columns={taskColumns}
          tabField={'status'}
          actionButton={taskActionButtons}
          onBulkUpdate={handleBulkUpdate}
          onDeleteTasks={handleDeleteTasks}
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
