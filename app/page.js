'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

export default function Home() {
  const [rgbData, setRgbData] = useState([]);

  useEffect(() => {
    fetch('/api/rgb')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRgbData(data.reverse()); // Reverse the order to show newest first
        } else {
          console.error('Unexpected response format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);
    const roundedDate = new Date(Math.round(date.getTime() / 60000) * 60000); // Round to nearest minute
    return format(roundedDate, 'yyyy-MM-dd HH:mm');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-light text-center mb-4">Average Color of the Portland Sky</h1>
        <h2 className="text-base font-light text-center mb-8">by Emanuel Costache</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
          {rgbData.map((item, index) => (
            <div
              key={index}
              className="relative p-0 shadow-lg group"
              style={{ backgroundColor: `rgb(${item.rgb[0]}, ${item.rgb[1]}, ${item.rgb[2]})`, minHeight: '150px' }}
            >
              <div className="absolute inset-0 bg-white dark:bg-black bg-opacity-40 p-2 opacity-0 group-hover:opacity-40 transition-opacity duration-300 ease-in-out flex flex-col justify-center">
                <p className="text-xs font-light uppercase">Date & Time</p>
                <p className="text-sm font-semibold">{formatTimestamp(item.timestamp)}</p>
                <p className="text-xs font-light uppercase mt-2">Color (RGB)</p>
                <p className="text-sm font-semibold">
                  {item.rgb[0]}, {item.rgb[1]}, {item.rgb[2]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
