'use client';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Flex,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import UpdateNextDateButton from '../../ui/update-next-date';
import CaseDetail from './case-detail';
import { ICase } from '@/types/case';
import TransferCaseButton from '@/components/ui/transfer-case-button';
import CaseHistoryTable from './case-history';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/user/userContext';
import CaseTask from './case-task';
import CaseInvoiceTable from './case-invoice';
import { useRouter } from 'next/navigation';

const IndividualCase = ({ caseData }: { caseData: ICase }) => {
  const { role } = useAuth();
  const router = useRouter();
  return (
    <Tabs variant="enclosed">
      <Flex justify={'space-between'} gap={4}>
        <TabList className="w-full" overflowX="auto" overflowY={'hidden'}>
          <Tab>Details</Tab>
          <Tab>History</Tab>
          <Tab>Tasks</Tab>
          {role !== 'LAWYER' && <Tab>Invoices</Tab>}
        </TabList>
        <div className="md:hidden">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<MoreVertical />}
              variant="outline"
            />
            <MenuList zIndex={50} maxWidth={100}>
              <MenuItem as={'div'}>
                <UpdateNextDateButton caseDetails={caseData} />
              </MenuItem>
              {(role === 'ADMIN' || role === 'SUPERADMIN' || role === 'HR') && (
                <MenuItem as={'div'}>
                  <TransferCaseButton caseDetails={caseData} />
                </MenuItem>
              )}
              <MenuItem as={'div'}>
                <Button
                  leftIcon={<ArrowLeft />}
                  colorScheme="blue"
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/dashboard/${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}/workspace-${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}#case`,
                    )
                  }
                >
                  Back
                </Button>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center justify-end gap-4">
            <UpdateNextDateButton caseDetails={caseData} />
            {(role === 'ADMIN' || role === 'SUPERADMIN' || role === 'HR') && (
              <TransferCaseButton caseDetails={caseData} />
            )}
            <Button
              leftIcon={<ArrowLeft />}
              colorScheme="blue"
              className="w-full"
              onClick={() =>
                router.push(
                  `/dashboard/${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}/workspace-${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}#case`,
                )
              }
            >
              Back
            </Button>
          </div>
        </div>
      </Flex>
      <TabPanels>
        <TabPanel>
          <CaseDetail caseData={caseData} />
        </TabPanel>
        <TabPanel>
          <CaseHistoryTable caseDetails={caseData} />
        </TabPanel>
        <TabPanel>
          <CaseTask caseId={caseData.caseId as string} />
        </TabPanel>
        {role !== 'LAWYER' && (
          <TabPanel>
            <CaseInvoiceTable caseId={caseData.caseId as string} />
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default IndividualCase;
