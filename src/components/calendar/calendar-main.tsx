'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import { Box } from '@chakra-ui/react';
import useCalendarEvents from '@/hooks/useCalendarHook';

export const CalendarMain = () => {
  const { adminCalendarEvents, calendarEvents } = useCalendarEvents();

  // Combine both admin and lawyer events into one array for rendering
  const events = [
    ...calendarEvents.map((event) => ({
      title: event.title,
      start: event.start,
      url: event.url,
      color: event.color,
    })),
    ...adminCalendarEvents.map((event) => ({
      title: event.title,
      start: event.start,
      url: event.url,
      color: event.color,
    })),
  ];

  return (
    <Box
      width={{ base: '100%', md: '90%', lg: '80%' }} // Responsive width
      margin="0 auto" // Center the calendar
      padding="1rem" // Add some padding for spacing
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        initialView="dayGridMonth"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={events} // Pass the combined events array to FullCalendar
        height="auto" // Allow the calendar to adjust its height based on content
      />
    </Box>
  );
};
