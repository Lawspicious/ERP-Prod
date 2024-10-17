'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar'; // Import Google Calendar plugin
import useCalendarEvents from '@/hooks/useCalendarHook';
import { useEffect } from 'react';

export const CalendarTest = () => {
  const { adminCalendarEvents, calendarEvents } = useCalendarEvents();

  useEffect(() => {
    console.log(
      'Google Calendar API Key:',
      process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY,
    );
    console.log(
      'Google Calendar ID:',
      process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SECRET_ID,
    );
  }, []);

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
    <div className="">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          listPlugin,
          googleCalendarPlugin,
        ]} // Include Google Calendar plugin
        googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY} // Use API key from environment
        events={[
          {
            googleCalendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SECRET_ID, // Replace with your calendar ID
          },
        ]}
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
      />
    </div>
  );
};
