'use client';
import AddEventModal from '@/components/calendar/add-event-modal';
import { CalendarMain } from '@/components/calendar/calendar-main';
import PageLayout from '@/components/ui/page-layout';
import { Button, Box, Stack } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';

export default function CalendarPage() {
  return (
    <PageLayout screen="margined">
      <CalendarMain />
      <Stack
        mt={6}
        spacing={4}
        direction={{ base: 'column', md: 'row' }} // Stack buttons vertically on mobile, horizontally on larger screens
        align="center"
        justify="center"
      >
        <Button
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() => (window.location.href = '/dashboard')}
          width={{ base: 'full', md: 'auto' }} // Full width on mobile, auto on larger screens
        >
          Back
        </Button>
        <AddEventModal />
      </Stack>
    </PageLayout>
  );
}
