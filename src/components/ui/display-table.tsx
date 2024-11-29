import React, { ReactElement, useMemo, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';

// Types
interface Column {
  key: string;
  label: string;
  sortable?: boolean; // Optional property to enable/disable sorting
}

interface TableData {
  [key: string]: any;
}

interface DisplayTableProps {
  data: TableData[];
  columns: Column[];
  tabField: string; // Field used for tab generation
  otherField?: string;
  actionButton: (id: string, deletename: string) => ReactElement[]; // Action buttons callback
  tableStyle?: {
    colKey: string;
    style: string;
  };
}

// Sort direction constants
enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const DisplayTable: React.FC<DisplayTableProps> = ({
  data,
  columns,
  tabField,
  otherField,
  actionButton,
  tableStyle,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortOrder | null;
  }>({ key: null, direction: null });

  // Handle sorting
  const handleSort = (key: string) => {
    let direction = SortOrder.ASC;
    if (sortConfig.key === key && sortConfig.direction === SortOrder.ASC) {
      direction = SortOrder.DESC;
    }
    setSortConfig({ key, direction });
  };

  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === SortOrder.ASC ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === SortOrder.ASC ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [sortConfig, data]);

  // Filtering logic
  const filteredData = useMemo(() => {
    return sortedData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, sortedData]);

  // Get unique values for the tab field
  const tabValues = Array.from(new Set(data.map((item) => item[tabField])));

  // Render the table based on filtered data
  const renderTable = (tableData: TableData[]) => (
    <TableContainer>
      <Table
        variant={tableData[0]?.rowColor ? 'simple' : 'striped'}
        colorScheme="blackAlpha"
      >
        <Thead>
          <Tr>
            {columns.map((col) => (
              <Th key={col.key}>
                {col.label}
                {col.sortable && ( // Only show sorting icon if column is sortable
                  <IconButton
                    ml={2}
                    size="sm"
                    icon={
                      sortConfig.key === col.key &&
                      sortConfig.direction === SortOrder.ASC ? (
                        <ArrowUp />
                      ) : (
                        <ArrowDown />
                      )
                    }
                    onClick={() => handleSort(col.key)}
                    aria-label={`Sort by ${col.label}`}
                  />
                )}
              </Th>
            ))}
            {/* Add Action Column */}
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <Tr key={index} className={row.rowColor}>
              {columns.map((col) => (
                <Td key={col.key} className={`text-wrapper`}>
                  {row[col.key]}
                </Td>
              ))}
              {/* Action Buttons as a Three-Dot Menu */}
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<MoreVertical />}
                    variant="outline"
                  />
                  <MenuList zIndex={50} maxWidth={100}>
                    {actionButton(row.id, row.deleteName).map((action, i) => (
                      <MenuItem as={'div'} key={i}>
                        {action}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );

  return (
    <div>
      {/* Tabs for filtering based on the tabField */}
      <Tabs variant={'enclosed'} isLazy>
        <Flex justify={'space-between'} gap={6}>
          <TabList overflowX="auto" overflowY={'hidden'} whiteSpace="nowrap">
            <Tab key="all">All</Tab>
            {tabValues.map((value) => (
              <Tab key={value}>{value}</Tab>
            ))}
          </TabList>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
        </Flex>

        <TabPanels>
          {/* Tab for "All" data */}
          <TabPanel>
            {filteredData.length > 0 ? (
              renderTable(filteredData)
            ) : (
              <h1 className="heading-secondary text-center">
                No Data to View!
              </h1>
            )}
          </TabPanel>

          {/* Individual Tabs */}
          {tabValues.map((value) => (
            <TabPanel key={value}>
              {filteredData.length > 0 ? (
                renderTable(
                  filteredData.filter((row) => row[tabField] === value),
                )
              ) : (
                <h1 className="heading-primary">No Data to View</h1>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default DisplayTable;
