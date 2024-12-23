import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pagesWithContent: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pagesWithContent,
}) => {
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isLastPageWithContent = i === Math.max(...pagesWithContent);
      buttons.push(
        <Button
          key={i}
          size="sm"
          onClick={() => onPageChange(i)}
          colorScheme={
            currentPage === i
              ? 'blue'
              : isLastPageWithContent
                ? 'green'
                : 'gray'
          }
          variant={currentPage === i ? 'solid' : 'outline'}
          fontWeight={pagesWithContent.includes(i) ? 'bold' : 'normal'}
        >
          {i}
        </Button>,
      );
    }

    return buttons;
  };

  return (
    <Flex justify="center" align="center" gap={2} mt={6} wrap="wrap">
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        mr={2}
      >
        <ChevronLeft size={18} />
      </Button>
      {renderPageButtons()}
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ml={2}
      >
        <ChevronRight size={18} />
      </Button>
    </Flex>
  );
};

export default Pagination;
