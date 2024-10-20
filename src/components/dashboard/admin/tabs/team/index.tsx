'use client';
import { useRouter } from 'next/navigation';
import TeamTable from './team-table';
import TabLayout from '../tab-layout';
import { useEffect } from 'react';
import LoaderComponent from '@/components/ui/loader';
import { useTeam } from '@/hooks/useTeamHook';
import { Button } from '@chakra-ui/react';
import { useLoading } from '@/context/loading/loadingContext';

const TeamsTab = () => {
  const router = useRouter();
  const { allUser, getAllUser } = useTeam();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);

    if (allUser) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300); // 3 seconds timeout

      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId);
    }
  }, [allUser]);

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Team Members</h1>
        <Button
          colorScheme="purple"
          onClick={() => router.push('/dashboard/admin/add-member')}
        >
          Add Member
        </Button>
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
