import React, { useEffect, useState } from 'react';
import TabLayout from '../tab-layout';
import CreateAppointmentModal from './create-appointment-modal';
import { useAppointment } from '@/hooks/useAppointmentHook';
import AppointmentTable from './appointment-table';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';
import { useAuth } from '@/context/user/userContext';
import { Checkbox } from '@chakra-ui/react';

const AppointmentTab = () => {
  const { allAppointments, getAppointmentsByLawyerId, allAppointmentsLawyer } =
    useAppointment();
  const { loading } = useLoading();
  const [isChecked, setIsChecked] = useState(false);
  const { authUser, role } = useAuth();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    if (isChecked) {
      getAppointmentsByLawyerId(authUser?.uid as string);
    }
  }, [isChecked]);

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex flex-col items-start justify-start gap-3">
          <h1 className="heading-primary">Appointment</h1>
          {role === 'ADMIN' && (
            <Checkbox isChecked={isChecked} onChange={handleCheckboxChange}>
              My Appointments
            </Checkbox>
          )}
        </div>
        <CreateAppointmentModal />
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allAppointments.length > 0 ? (
        <AppointmentTable
          appointments={isChecked ? allAppointmentsLawyer : allAppointments}
        />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Appointment!!
        </div>
      )}
    </TabLayout>
  );
};

export default AppointmentTab;
