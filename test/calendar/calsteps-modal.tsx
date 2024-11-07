import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Icon,
} from '@chakra-ui/react';
import { ListCheckIcon } from 'lucide-react';

const GoogleCalendarPublicModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue">
        How to Make Google Calendar Public
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Steps to Make Google Calendar Public</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Follow these steps to make your Google Calendar public, so it can
              be shared and accessed by others.
            </Text>
            <List spacing={3} pl={3}>
              <ListItem display="flex" alignItems="center">
                Go to{' '}
                <Box as="span" fontWeight="bold" color="blue.500" ml={1}>
                  Google Calendar
                </Box>{' '}
                and locate the calendar you want to share.
              </ListItem>
              <ListItem display="flex" alignItems="center">
                Hover over the calendar name in the left panel, click the{' '}
                <Box as="span" fontWeight="bold" color="blue.500" ml={1}>
                  three-dot menu
                </Box>{' '}
                icon, then select{' '}
                <Box as="span" fontWeight="bold" ml={1}>
                  Settings and sharing
                </Box>
                .
              </ListItem>
              <ListItem display="flex" alignItems="center">
                Scroll down to the{' '}
                <Box as="span" fontWeight="bold" color="blue.500" ml={1}>
                  Access permissions for events
                </Box>{' '}
                section.
              </ListItem>
              <ListItem display="flex" alignItems="center">
                Check the box labeled{' '}
                <Box as="span" fontWeight="bold" color="blue.500" ml={1}>
                  Make available to public
                </Box>
                . You will see a prompt confirming that events will be visible
                to anyone.
              </ListItem>
              <ListItem display="flex" alignItems="center">
                Under{' '}
                <Box as="span" fontWeight="bold" color="blue.500" ml={1}>
                  Get shareable link
                </Box>
                , select{' '}
                <Box as="span" fontWeight="bold" ml={1}>
                  See all event details
                </Box>{' '}
                to allow viewers to see complete information.
              </ListItem>
              <ListItem display="flex" alignItems="center">
                Copy the calendar's public link, or use the embed code to
                display it on websites or apps.
              </ListItem>
            </List>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Got It
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GoogleCalendarPublicModal;
