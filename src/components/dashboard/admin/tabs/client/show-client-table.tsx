import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import React from 'react';
import NormalClientTable from './normal-client-table';
import ProspectClientTable from './prospect-client-table';

const ShowClientTable = () => {
  return (
    <Tabs variant="enclosed" colorScheme="purple">
      <TabList>
        <Tab>Normal Clients</Tab>
        <Tab>Prospect Clients</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <NormalClientTable />
        </TabPanel>
        <TabPanel>
          <ProspectClientTable />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ShowClientTable;
