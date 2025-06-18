'use client';
import withAuth from '@/components/shared/hoc-middlware';
import IndividualTask from '@/components/task/task-page/task-page-main';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { FollowUp, useFollowUp } from '@/hooks/useFollowUp';
import { useTask } from '@/hooks/useTaskHooks';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const IndividualTaskPage = ({ params }: { params: { taskId: string } }) => {
  const taskId = params.taskId;
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { task, getTaskById } = useTask();
  const [follow_ups, setFollow_ups] = useState<FollowUp[] | []>([]);
  const { getFollowUpsByTaskId } = useFollowUp();

  useEffect(() => {
    const handleFetchTask = async () => {
      setLoading(true);
      if (taskId) {
        await getTaskById(taskId as string);
        const data = await getFollowUpsByTaskId(taskId);
        console.log(data);
        setFollow_ups(data);
      }
      setLoading(false);
    };

    handleFetchTask();
  }, [router]);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : task ? (
        <IndividualTask task={task} follow_ups={follow_ups} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No such case Exist
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'HR', 'LAWYER', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(IndividualTaskPage, allowedRoles);
