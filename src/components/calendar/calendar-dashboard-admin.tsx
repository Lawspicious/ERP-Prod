'use client';
import React from 'react';

const Calendar = () => {
  // Days of the week and a sample array for days can be dynamic based on your requirements
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-bold">August 2024</h3>
      <div className="grid grid-cols-7 gap-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {daysInMonth.map((day) => (
          <div
            key={day}
            className="cursor-pointer rounded-lg border p-2 text-center hover:bg-gray-200"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
