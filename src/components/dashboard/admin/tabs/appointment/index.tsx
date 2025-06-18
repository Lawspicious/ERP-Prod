import React, { useEffect, useState } from 'react';
import TabLayout from '../tab-layout';
import CreateAppointmentModal from './create-appointment-modal';
import { useAppointment } from '@/hooks/useAppointmentHook';
import AppointmentTable from './appointment-table';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';
import { useAuth } from '@/context/user/userContext';
import { Checkbox, Button } from '@chakra-ui/react';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  const handleExport = () => {
    try {
      // Transform the data for export
      const exportData = allAppointments.map((appointment) => ({
        'Client/Other': appointment.clientDetails
          ? appointment.clientDetails.name
          : appointment.otherRelatedTo,
        Lawyer: appointment.lawyerDetails?.name || 'N/A',
        Time: appointment.time,
        Date: appointment.date,
        Location: appointment.location,
        Description: appointment.description || 'N/A',
        Status: appointment.status,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
      XLSX.writeFile(wb, 'appointments_list.xlsx');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex flex-col items-start justify-start gap-3">
          <h1 className="heading-primary">Appointment</h1>
          {(role === 'ADMIN' || role === 'HR') && (
            <Checkbox isChecked={isChecked} onChange={handleCheckboxChange}>
              My Appointments
            </Checkbox>
          )}
        </div>
        <div className="flex gap-2">
          {/* <Button
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            onClick={handleExport}
          >
            Export
          </Button> */}
          <CreateAppointmentModal />
        </div>
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
