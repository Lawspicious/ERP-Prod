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
import { MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/user/userContext';
import CaseTask from './case-task';
import CaseInvoiceTable from './case-invoice';

const IndividualCase = ({ caseData }: { caseData: ICase }) => {
  const { role } = useAuth();
  return (
    <Tabs variant="enclosed">
      <Flex justify={'space-between'} gap={4}>
        <TabList className="w-full" overflowX="auto" overflowY={'hidden'}>
          <Tab>Details</Tab>
          <Tab>History</Tab>
          <Tab>Tasks</Tab>
          <Tab>Invoices</Tab>
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
              {role === 'ADMIN' && (
                <MenuItem as={'div'}>
                  <TransferCaseButton caseDetails={caseData} />
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center justify-end gap-4">
            <UpdateNextDateButton caseDetails={caseData} />
            {role === 'ADMIN' && <TransferCaseButton caseDetails={caseData} />}
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
        <TabPanel>
          <CaseInvoiceTable caseId={caseData.caseId as string} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default IndividualCase;
