'use client';
import { useRouter } from 'next/navigation';
import TeamTable from './team-table';
import TabLayout from '../tab-layout';
import { useEffect } from 'react';
import LoaderComponent from '@/components/ui/loader';
import { useTeam } from '@/hooks/useTeamHook';
import { Button } from '@chakra-ui/react';
import { useLoading } from '@/context/loading/loadingContext';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

const TeamsTab = () => {
  const router = useRouter();
  const { allUser, getAllUser } = useTeam();
  const { loading, setLoading } = useLoading();

  const handleExport = () => {
    try {
      // Transform the data for export
      const exportData = allUser.map((user) => ({
        Name: user.name,
        Email: user.email,
        'Contact No': user.phoneNumber || 'N/A',
        Role: user.role,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Team Members');
      XLSX.writeFile(wb, 'team_members.xlsx');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  useEffect(() => {
    setLoading(true);

    if (allUser) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [allUser]);

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Team Members</h1>
        <div className="flex gap-2">
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => router.push('/dashboard/admin/add-member')}
          >
            Add Member
          </Button>
        </div>
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allUser.length > 0 ? (
        <TeamTable allTeam={allUser} />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Team to Show!
        </div>
      )}
    </TabLayout>
  );
};

export default TeamsTab;
