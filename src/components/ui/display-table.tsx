import React, { ReactElement, useEffect, useMemo, useState } from 'react';
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
  Button,
  HStack,
} from '@chakra-ui/react';
import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import Pagination from '../dashboard/shared/Pagination';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

// Types
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableData {
  [key: string]: any;
}

interface DisplayTableProps {
  data: TableData[];
  columns: Column[];
  tabField: string;
  otherField?: string;
  actionButton: (id: string, deletename: string) => ReactElement[];
  tableStyle?: {
    colKey: string;
    style: string;
  };
}

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
    key: string;
    direction: SortOrder | null;
  }>({ key: '', direction: null });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<string>('All'); // Track the active tab
  const rowsPerPage = 10;

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
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === SortOrder.ASC ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === SortOrder.ASC ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [sortConfig, data]);

  // Filtering logic
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      );
      const matchesTab = currentTab === 'All' || item[tabField] === currentTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, currentTab, sortedData, tabField]);

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentTab]);

  // Ensure currentPage is valid
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
    }
  }, [filteredData, rowsPerPage]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get unique values for the tab field
  const tabValues = Array.from(new Set(data.map((item) => item[tabField])));

  // Render the table based on filtered and paginated data
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
                {col.sortable && (
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
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <Tr key={index} className={row.rowColor}>
              {columns.map((col) => (
                <Td key={col.key} className="text-wrapper">
                  {row[col.key]}
                </Td>
              ))}
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
                      <MenuItem as="div" key={i}>
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

  const handleExport = (dataToExport: TableData[], tabName: string) => {
    try {
      // Transform the data for export, using column definitions
      const exportData = dataToExport.map((item) => {
        const rowData: { [key: string]: any } = {};
        columns.forEach((col) => {
          rowData[col.label] = item[col.key];
        });
        return rowData;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tabName);
      XLSX.writeFile(wb, `${tabName.toLowerCase()}_data.xlsx`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div>
      <Tabs
        variant="enclosed"
        isLazy
        onChange={(index) => {
          setCurrentTab(index === 0 ? 'All' : tabValues[index - 1]);
        }}
      >
        <Flex direction="column" gap={4} mb={4}>
          <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
            <Tab key="all" onClick={() => setCurrentPage(1)}>
              All
            </Tab>
            {tabValues.map((value) => (
              <Tab key={value} onClick={() => setCurrentPage(1)}>
                {value}
              </Tab>
            ))}
          </TabList>

          <Flex justify="space-between" align="center">
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="green"
              size="sm"
              onClick={() =>
                handleExport(
                  filteredData,
                  currentTab === 'All' ? 'All_Data' : currentTab,
                )
              }
            >
              Export {currentTab}
            </Button>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
            />
          </Flex>
        </Flex>

        <TabPanels>
          <TabPanel>
            {paginatedData.length > 0 ? (
              <>
                {renderTable(paginatedData)}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  pagesWithContent={Array.from(
                    { length: totalPages },
                    (_, i) => i + 1,
                  )}
                />
              </>
            ) : (
              <h1 className="heading-secondary text-center">
                No Data to View!
              </h1>
            )}
          </TabPanel>
          {tabValues.map((value) => (
            <TabPanel key={value}>
              {paginatedData.length > 0 ? (
                <>
                  {renderTable(
                    paginatedData.filter((row) => row[tabField] === value),
                  )}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    pagesWithContent={Array.from(
                      { length: totalPages },
                      (_, i) => i + 1,
                    )}
                  />
                </>
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
