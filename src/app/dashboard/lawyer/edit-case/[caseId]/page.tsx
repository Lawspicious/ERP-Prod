'use client';
import EditCaseForm from '@/components/case/edit-case/edit-case-form';
import EditCaseFormLawyer from '@/components/case/edit-case/edit-case-form-lawyer';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useTeam } from '@/hooks/useTeamHook';
import React, { useEffect } from 'react';

const EditCasePage = ({ params }: { params: { caseId: string } }) => {
  const { allTeam, getAllTeam } = useTeam();
  const { inividualCase, getCaseById } = useCases();
  const { loading, setLoading } = useLoading();

  const handleFetchCase = async () => {
    setLoading(true);
    await getCaseById(params.caseId);
    setLoading(false);
  };

  const handleFetchLawyer = async () => {
    setLoading(true);
    await getAllTeam();
    setLoading(false);
  };

  useEffect(() => {
    handleFetchCase();
    handleFetchLawyer();
  }, []);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : allTeam.length > 0 && inividualCase ? (
        <EditCaseFormLawyer caseData={inividualCase} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No Data Found
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'LAWYER']; // Add roles that should have access

export default withAuth(EditCasePage, allowedRoles);
