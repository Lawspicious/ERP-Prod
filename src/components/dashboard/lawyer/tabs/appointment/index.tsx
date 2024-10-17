import React, { useEffect } from 'react';
import TabLayout from '../tab-layout';
import { useAppointment } from '@/hooks/useAppointmentHook';
import AppointmentTable from '@/components/dashboard/admin/tabs/appointment/appointment-table';
import { useAuth } from '@/context/user/userContext';
import CreateAppointmentModalLawyer from './create-appointment-modal';
import AppointmentTableLawyer from './appointment-table';

const AppointmentTab = () => {
  const { allAppointmentsLawyer, getAppointmentsByLawyerId } = useAppointment();
  const { authUser } = useAuth();

  useEffect(() => {
    const fetchAppointment = async () => {
      await getAppointmentsByLawyerId(authUser?.uid as string);
    };
    fetchAppointment();
  }, []);

  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <h1 className="heading-primary mb-6">Appointments</h1>
        <CreateAppointmentModalLawyer />
      </section>
      {allAppointmentsLawyer.length > 0 ? (
        <>
          <AppointmentTableLawyer appointments={allAppointmentsLawyer} />
        </>
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Appointment!!
        </div>
      )}
    </TabLayout>
  );
};

export default AppointmentTab;
