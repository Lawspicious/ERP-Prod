'use client';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { IndividualUser } from '@/components/user/user-page-main';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useTeam } from '@/hooks/useTeamHook';
import { useEarlyLeave } from '@/hooks/useEarlyLeave';
import { ICase } from '@/types/case';
import { IEarlyLeave } from '@/types/attendance';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const IndividualUserPage = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { user, getUserById } = useTeam();
  const { fetchCasesByLawyerId, allCasesLawyer } = useCases();
  const { earlyLeaves } = useEarlyLeave();
  const [casesByLawyer, setCasesByLawyer] = useState<ICase[]>([]);
  const [userEarlyLeaves, setUserEarlyLeaves] = useState<IEarlyLeave[]>([]);

  useEffect(() => {
    const handleFetchUser = async () => {
      setLoading(true);
      if (userId) {
        await getUserById(userId as string);
        await fetchCasesByLawyerId(userId);
        setCasesByLawyer(allCasesLawyer);

        // Filter early leaves for this user
        const userLeaves = earlyLeaves.filter(
          (leave) => leave.userId === userId && leave.status === 'approved',
        );
        setUserEarlyLeaves(userLeaves);
      }
      setLoading(false);
    };

    handleFetchUser();
  }, [router, earlyLeaves]);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : user ? (
        <IndividualUser
          user={user}
          cases={casesByLawyer}
          absentDays={0} // This would be calculated from attendance data
          earlyLeaves={userEarlyLeaves}
        />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No such User Exist
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'HR', 'LAWYER', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(IndividualUserPage, allowedRoles);
