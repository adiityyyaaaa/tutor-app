import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'; // We'll need to create this for custom styling

const DashboardCalendar = ({ bookings }) => {
    const [value, onChange] = useState(new Date());

    // Function to check if a date has bookings
    const hasBooking = (date) => {
        return bookings.some(booking => {
            const bookingDate = new Date(booking.scheduledDate);
            return (
                date.getDate() === bookingDate.getDate() &&
                date.getMonth() === bookingDate.getMonth() &&
                date.getFullYear() === bookingDate.getFullYear() &&
                booking.bookingStatus === 'confirmed'
            );
        });
    };

    // Function to get bookings for a specific date
    const getBookingsForDate = (date) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.scheduledDate);
            return (
                date.getDate() === bookingDate.getDate() &&
                date.getMonth() === bookingDate.getMonth() &&
                date.getFullYear() === bookingDate.getFullYear() &&
                booking.bookingStatus === 'confirmed'
            );
        });
    };

    const selectedDayBookings = getBookingsForDate(value);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <div className="calendar-container rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                    <Calendar
                        onChange={onChange}
                        value={value}
                        className="w-full border-none"
                        tileContent={({ date, view }) => {
                            if (view === 'month' && hasBooking(date)) {
                                return (
                                    <div className="flex justify-center mt-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    </div>
                                );
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                    Schedule for {value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {selectedDayBookings.length > 0 ? (
                    <div className="space-y-3">
                        {selectedDayBookings.map(booking => (
                            <div key={booking._id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {booking.bookingType === 'demo' ? 'Demo Class' : `${booking.subject} Class`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.scheduledTime} • {booking.duration} mins
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            with {booking.teacherId ? booking.teacherId.name : booking.studentId.name}
                                        </div>
                                    </div>
                                    <span className={`badge ${booking.bookingType === 'demo' ? 'badge-warning' : 'badge-primary'}`}>
                                        {booking.bookingType}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        No classes scheduled for this day
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCalendar;
