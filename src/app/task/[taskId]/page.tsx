'use client';
import withAuth from '@/components/shared/hoc-middlware';
import IndividualTask from '@/components/task/task-page/task-page-main';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useTask } from '@/hooks/useTaskHooks';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const IndividualTaskPage = ({ params }: { params: { taskId: string } }) => {
  const taskId = params.taskId;
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { task, getTaskById } = useTask();

  useEffect(() => {
    const handleFetchTask = async () => {
      setLoading(true);
      if (taskId) {
        await getTaskById(taskId as string);
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
        <IndividualTask task={task} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No such case Exist
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'LAWYER', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(IndividualTaskPage, allowedRoles);
