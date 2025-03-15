'use client';
import { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';

const ExportAllData = () => {
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Fetch data directly from Firestore
      // Normal Clients
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const normalClientsData = clientsSnapshot.docs
        .filter((doc) => doc.data().clientType === 'normal')
        .map((doc) => {
          const data = doc.data();
          return {
            Name: data.name,
            Email: data.email,
            Mobile: data.mobile,
            City: data.city,
            Rating: data.rating,
          };
        });

      if (normalClientsData.length > 0) {
        const wsNormal = XLSX.utils.json_to_sheet(normalClientsData);
        XLSX.utils.book_append_sheet(wb, wsNormal, 'Normal Clients');
      }

      // Prospect Clients
      const prospectClientsData = clientsSnapshot.docs
        .filter((doc) => doc.data().clientType === 'prospect')
        .map((doc) => {
          const data = doc.data();
          return {
            Name: data.name,
            Mobile: data.mobile,
            Location: data.location,
            'Follow-up': data.followUp ? 'YES' : 'NO',
            'Next Follow-up Date': data.nextFollowUpDate || 'N/A',
            Source: data.source,
            Service: data.service,
            Feedback: data.client_feedback || 'N/A',
            Rating: data.rating,
          };
        });

      if (prospectClientsData.length > 0) {
        const wsProspect = XLSX.utils.json_to_sheet(prospectClientsData);
        XLSX.utils.book_append_sheet(wb, wsProspect, 'Prospect Clients');
      }

      // Cases
      const casesSnapshot = await getDocs(collection(db, 'cases'));
      const casesData = casesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          'Case No': data.caseNo,
          'Case Type': data.caseType,
          'Court Name': data.courtName || 'N/A',
          Petitioner: data.petition?.petitioner || 'N/A',
          Respondent: data.respondent?.respondentee || 'N/A',
          'Next Hearing': data.nextHearing || 'TBD',
          Status: data.caseStatus,
          Client: data.clientDetails?.name || 'N/A',
          Lawyer: data.lawyer?.name || 'N/A',
          Priority: data.priority,
        };
      });

      if (casesData.length > 0) {
        const wsCases = XLSX.utils.json_to_sheet(casesData);
        XLSX.utils.book_append_sheet(wb, wsCases, 'Cases');
      }

      // Tasks
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = tasksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          'Task Name': data.taskName,
          'Task Type': data.taskType,
          'Related To': data.caseDetails?.caseNo
            ? `Case: ${data.caseDetails.caseNo}`
            : 'Other',
          'Start Date': data.startDate || 'TBD',
          'End Date': data.endDate || 'TBD',
          Status: data.taskStatus,
          Priority: data.priority,
          'Assigned To':
            data.lawyerDetails?.map((lawyer: any) => lawyer.name).join(', ') ||
            'No Lawyers Assigned',
        };
      });

      if (tasksData.length > 0) {
        const wsTasks = XLSX.utils.json_to_sheet(tasksData);
        XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');
      }

      // Team Members
      const teamSnapshot = await getDocs(collection(db, 'users'));
      const teamData = teamSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Name: data.name,
          Email: data.email,
          'Contact No': data.phoneNumber || 'N/A',
          Role: data.role,
        };
      });

      if (teamData.length > 0) {
        const wsTeam = XLSX.utils.json_to_sheet(teamData);
        XLSX.utils.book_append_sheet(wb, wsTeam, 'Team Members');
      }

      // Appointments
      const appointmentsSnapshot = await getDocs(
        collection(db, 'appointments'),
      );
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          'Client/Other': data.clientDetails
            ? data.clientDetails.name
            : data.otherRelatedTo,
          Lawyer: data.lawyerDetails?.name || 'N/A',
          Time: data.time,
          Date: data.date,
          Location: data.location,
          Description: data.description || 'N/A',
          Status: data.status,
        };
      });

      if (appointmentsData.length > 0) {
        const wsAppointments = XLSX.utils.json_to_sheet(appointmentsData);
        XLSX.utils.book_append_sheet(wb, wsAppointments, 'Appointments');
      }

      // Performance Data
      // For performance data, we'll need to combine users, tasks, and cases
      const usersData = teamSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      const performanceData = usersData
        .map((user) => {
          const userTasks = tasksData.filter((task) =>
            task['Assigned To'].includes(user.name),
          );

          const userCases = casesData.filter(
            (caseItem) => caseItem['Lawyer'] === user.name,
          );

          return {
            'User Name': user.name,
            'Total Tasks': userTasks.length,
            'Total Cases': userCases.length,
            'Completed Tasks': userTasks.filter(
              (task) => task['Status'] === 'COMPLETED',
            ).length,
            'Decided Cases': userCases.filter(
              (caseItem) => caseItem['Status'] === 'DECIDED',
            ).length,
          };
        })
        .filter((user) => user['Total Tasks'] > 0 || user['Total Cases'] > 0);

      if (performanceData.length > 0) {
        const wsPerformance = XLSX.utils.json_to_sheet(performanceData);
        XLSX.utils.book_append_sheet(wb, wsPerformance, 'Performance Data');
      }

      // Write the workbook to file
      XLSX.writeFile(wb, 'lawspicious_complete_data.xlsx');

      toast({
        title: 'Export Successful',
        description: 'All data has been exported to Excel',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return true;
    } catch (error) {
      console.error('Error exporting all data:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      leftIcon={<Download size={20} />}
      colorScheme="green"
      my={4}
      className="w-full"
      onClick={handleExportAll}
      isLoading={isExporting}
      loadingText="Exporting..."
    >
      Export All Data
    </Button>
  );
};

export default ExportAllData;
