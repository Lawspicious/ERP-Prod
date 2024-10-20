// components/tabs/HomeTab.tsx
import { CircleCheckBig, Handshake, Scale, Trophy } from 'lucide-react';
import DashboardCard from './dashboard-card';
import CauseList from './cause-list';
import TabLayout from '../tab-layout';
import { useClient } from '@/hooks/useClientHook';
import { useCases } from '@/hooks/useCasesHook';
import { useEffect, useState } from 'react';
import { ICase } from '@/types/case';
import { get } from 'http';
import { useLoading } from '@/context/loading/loadingContext';
const HomeTab = () => {
  // const {allClients, allCases, highPriorityCases, decidedCases} = useDashboardData();
  const { normalClient } = useClient();
  const { allCases, fetchCasesByStatus, fetchCasesByPriority } = useCases();
  const [highPriorityCases, setHighPriorityCases] = useState<number>(0);
  const [decidedCases, setDecidedCases] = useState<number>(0);
  const { loading, setLoading } = useLoading();
  useEffect(() => {
    const handleFetchCases = async () => {
      const _decidedCase = await fetchCasesByStatus('DECIDED');
      await fetchCasesByPriority('HIGH');

      setHighPriorityCases(_decidedCase?.length || 0);
      setDecidedCases(_decidedCase?.length || 0);
    };
    setLoading(true);
    // getClientByType('normal');
    handleFetchCases();
    setLoading(false);
  }, []);

  return (
    <TabLayout>
      <div className="margin-bottom-content grid grid-cols-2 justify-between gap-6 lg:grid-cols-4">
        <DashboardCard
          title="Clients"
          value={normalClient.length}
          description="Total Clients."
          Icon={Handshake}
          iconProps={{ size: 60 }}
          isloading={loading}
        />

        <DashboardCard
          title="Cases"
          value={allCases.length}
          description="Total Cases."
          Icon={Scale}
          iconProps={{ size: 60 }}
          isloading={loading}
        />

        <DashboardCard
          title="High Priority Cases"
          value={highPriorityCases}
          description="Total High Priority Cases."
          Icon={Trophy}
          iconProps={{ size: 60 }}
          isloading={loading}
        />

        <DashboardCard
          title="Decided Cases"
          value={decidedCases}
          description="Total Decided Cases."
          Icon={CircleCheckBig}
          iconProps={{ size: 60 }}
          isloading={loading}
        />
      </div>
      <CauseList />
    </TabLayout>
  );
};

export default HomeTab;
