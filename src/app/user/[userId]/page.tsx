'use client';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { IndividualUser } from '@/components/user/user-page-main';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useTeam } from '@/hooks/useTeamHook';
import { ICase } from '@/types/case';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const IndividualUserPage = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { user, getUserById } = useTeam();
  const { fetchCasesByLawyerId } = useCases();
  const [casesByLawyer, setCasesByLawyer] = useState<ICase[]>([]);

  useEffect(() => {
    const handleFetchUser = async () => {
      setLoading(true);
      if (userId) {
        await getUserById(userId as string);
        const _cases = await fetchCasesByLawyerId(userId);
        setCasesByLawyer(_cases as ICase[]);
      }
      setLoading(false);
    };

    handleFetchUser();
  }, [router]);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : user ? (
        <IndividualUser user={user} cases={casesByLawyer} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No such User Exist
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'LAWYER', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(IndividualUserPage, allowedRoles);
