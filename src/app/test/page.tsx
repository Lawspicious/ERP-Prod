'use client';
import PDFfile from '@/components/ui/PDFfile';
import React from 'react';

import dynamic from 'next/dynamic';
import { IInvoice } from '@/types/invoice';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useTask } from '@/hooks/useTaskHooks';

const Page = () => {
  const { allTask, deleteTasks } = useTask();

  const taskArray = allTask.filter(
    (task) => task.taskName === 'Case Status Update',
  );

  console.log(taskArray);

  const deleteAllTask = () => {
    taskArray.forEach((task) => deleteTasks(task.id as string, task.taskName));
  };

  return (
    <div onClick={deleteAllTask} className="btn-primary">
      hello
    </div>
  );
};

export default Page;
