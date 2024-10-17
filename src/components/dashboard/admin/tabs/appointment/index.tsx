import React from 'react';
import TabLayout from '../tab-layout';
import CreateAppointmentModal from './create-appointment-modal';
import { useAppointment } from '@/hooks/useAppointmentHook';
import AppointmentTable from './appointment-table';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';

const AppointmentTab = () => {
  const { allAppointments } = useAppointment();
  const { loading } = useLoading();

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Appointments</h1>
        <CreateAppointmentModal />
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allAppointments.length > 0 ? (
        <AppointmentTable appointments={allAppointments} />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Appointment!!
        </div>
      )}
    </TabLayout>
  );
};

export default AppointmentTab;
