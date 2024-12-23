import React from 'react';
import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { AnnouncementListProps } from '@/types/announcement';

const priorityColors = {
  high: 'red',
  medium: 'orange',
  low: 'green',
};

const priorityIcons = {
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  onDelete,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {announcements.map((announcement) => {
        const PriorityIcon = priorityIcons[announcement.priority];
        return (
          <Box
            key={announcement.id}
            borderWidth={1}
            borderRadius="md"
            p={4}
            boxShadow="sm"
            position="relative"
          >
            <Flex justify="space-between" align="start">
              <Badge colorScheme={priorityColors[announcement.priority]} mb={2}>
                {announcement.priority}
              </Badge>
              <Tooltip label="Delete announcement" placement="top">
                <IconButton
                  icon={<Trash2 size={16} />}
                  aria-label="Delete announcement"
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => onDelete(announcement.id)}
                />
              </Tooltip>
            </Flex>
            <Flex align="center" mb={2}>
              <PriorityIcon
                size={20}
                color={priorityColors[announcement.priority]}
              />
              <Text fontWeight="bold" ml={2}>
                {announcement.title}
              </Text>
            </Flex>
            <Text mb={2}>{announcement.message}</Text>
            <Text fontSize="sm" color="gray.500">
              Published: {new Date(announcement.publishedAt).toLocaleString()}
            </Text>
          </Box>
        );
      })}
    </VStack>
  );
};

export default AnnouncementList;
