'use client';
import { IndividualAppointment } from '@/components/appointment/appointment-page-main';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const IndividualAppointmentPage = ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  const appointmentId = params.appointmentId;
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const { appointment, getAppointmentById } = useAppointment();

  useEffect(() => {
    const handleFetchAppointment = async () => {
      setLoading(true);
      if (appointmentId) {
        await getAppointmentById(appointmentId as string);
      }
      setLoading(false);
    };

    handleFetchAppointment();
  }, [router]);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : appointment ? (
        <IndividualAppointment appointment={appointment} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No such Appointment Exist
        </div>
      )}
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'LAWYER', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(IndividualAppointmentPage, allowedRoles);
