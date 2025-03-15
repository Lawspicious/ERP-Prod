import * as XLSX from 'xlsx';
import { useClient } from '@/hooks/useClientHook';
import { useCases } from '@/hooks/useCasesHook';
import { useTask } from '@/hooks/useTaskHooks';
import { useTeam } from '@/hooks/useTeamHook';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { usePerformanceHook } from '@/hooks/usePerformanceHook';

export const exportAllData = async () => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Get data from all hooks
    const { normalClient, prospectClient } = useClient();
    const { allCases } = useCases();
    const { allTask } = useTask();
    const { allUser } = useTeam();
    const { allAppointments } = useAppointment();
    const { getAllUsersWithTasksAndCases } = usePerformanceHook();
    const performanceData = await getAllUsersWithTasksAndCases();

    // Format and add normal clients data
    if (normalClient && normalClient.length > 0) {
      const normalClientsData = normalClient.map((client) => ({
        Name: client.name,
        Email: client.email,
        Mobile: client.mobile,
        City: client.city,
        Rating: client.rating,
      }));
      const wsNormal = XLSX.utils.json_to_sheet(normalClientsData);
      XLSX.utils.book_append_sheet(wb, wsNormal, 'Normal Clients');
    }

    // Format and add prospect clients data
    if (prospectClient && prospectClient.length > 0) {
      const prospectClientsData = prospectClient.map((client) => ({
        Name: client.name,
        Mobile: client.mobile,
        Location: client.location,
        'Follow-up': client.followUp ? 'YES' : 'NO',
        'Next Follow-up Date': client.nextFollowUpDate || 'N/A',
        Source: client.source,
        Service: client.service,
        Feedback: client.client_feedback || 'N/A',
        Rating: client.rating,
      }));
      const wsProspect = XLSX.utils.json_to_sheet(prospectClientsData);
      XLSX.utils.book_append_sheet(wb, wsProspect, 'Prospect Clients');
    }

    // Format and add cases data
    if (allCases && allCases.length > 0) {
      const casesData = allCases.map((caseItem) => ({
        'Case No': caseItem.caseNo,
        'Case Type': caseItem.caseType,
        'Court Name': caseItem.courtName || 'N/A',
        Petitioner: caseItem.petition?.petitioner || 'N/A',
        Respondent: caseItem.respondent?.respondentee || 'N/A',
        'Next Hearing': caseItem.nextHearing || 'TBD',
        Status: caseItem.caseStatus,
        Client: caseItem.clientDetails?.name || 'N/A',
        Lawyer: caseItem.lawyer?.name || 'N/A',
        Priority: caseItem.priority,
      }));
      const wsCases = XLSX.utils.json_to_sheet(casesData);
      XLSX.utils.book_append_sheet(wb, wsCases, 'Cases');
    }

    // Format and add tasks data
    if (allTask && allTask.length > 0) {
      const tasksData = allTask.map((task) => ({
        'Task Name': task.taskName,
        'Task Type': task.taskType,
        'Related To': task.caseDetails?.caseNo
          ? `Case: ${task.caseDetails.caseNo}`
          : 'Other',
        'Start Date': task.startDate || 'TBD',
        'End Date': task.endDate || 'TBD',
        Status: task.taskStatus,
        Priority: task.priority,
        'Assigned To':
          task.lawyerDetails?.map((lawyer: any) => lawyer.name).join(', ') ||
          'No Lawyers Assigned',
      }));
      const wsTasks = XLSX.utils.json_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');
    }

    // Format and add team data
    if (allUser && allUser.length > 0) {
      const teamData = allUser.map((user) => ({
        Name: user.name,
        Email: user.email,
        'Contact No': user.phoneNumber || 'N/A',
        Role: user.role,
      }));
      const wsTeam = XLSX.utils.json_to_sheet(teamData);
      XLSX.utils.book_append_sheet(wb, wsTeam, 'Team Members');
    }

    // Format and add appointments data
    if (allAppointments && allAppointments.length > 0) {
      const appointmentsData = allAppointments.map((appointment) => ({
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
      const wsAppointments = XLSX.utils.json_to_sheet(appointmentsData);
      XLSX.utils.book_append_sheet(wb, wsAppointments, 'Appointments');
    }

    // Format and add performance data
    if (performanceData && performanceData.length > 0) {
      const performanceExportData = performanceData.map((user) => ({
        'User Name': user.lawyer.name,
        'Total Tasks': user.tasks.length,
        'Total Cases': user.cases.length,
        'Completed Tasks': user.tasks.filter(
          (task) => task.taskStatus === 'COMPLETED',
        ).length,
        'Decided Cases': user.cases.filter(
          (caseItem) => caseItem.caseStatus === 'DECIDED',
        ).length,
      }));
      const wsPerformance = XLSX.utils.json_to_sheet(performanceExportData);
      XLSX.utils.book_append_sheet(wb, wsPerformance, 'Performance Data');
    }

    // Write the workbook to file
    XLSX.writeFile(wb, 'lawspicious_complete_data.xlsx');

    return true;
  } catch (error) {
    console.error('Error exporting all data:', error);
    return false;
  }
};
