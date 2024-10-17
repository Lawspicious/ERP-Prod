'use client';
import IndividualCase from '@/components/case/case-page/case-page-main';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CaseDetailsPage = ({ params }: { params: { caseId: string } }) => {
  const caseId = params.caseId;
  const { inividualCase, getCaseById } = useCases();
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    const handleFetchCase = async () => {
      if (caseId) {
        await getCaseById(caseId as string);
      }
      setLoading(false);
    };

    handleFetchCase();
  }, [router]);

  return (
    <PageLayout screen="margined">
      {inividualCase ? (
        <IndividualCase caseData={inividualCase} />
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

export default withAuth(CaseDetailsPage, allowedRoles);
