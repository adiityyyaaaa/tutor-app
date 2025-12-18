import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import { BookOpen, Search, MessageCircle, LogOut, Calendar, TrendingUp, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';

import DemoCompletionModal from '../components/DemoCompletionModal';
import NotificationBell from '../components/NotificationBell';
import ReviewSubmissionModal from '../components/ReviewSubmissionModal';
import DashboardCalendar from '../components/DashboardCalendar';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const openCompletionModal = (booking) => {
        setSelectedBooking(booking);
        setIsCompletionModalOpen(true);
    };

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setIsReviewModalOpen(true);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getAll();
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">HomeTutor</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/search" className="btn btn-secondary flex items-center space-x-2">
                                <Search className="w-5 h-5" />
                                <span className="hidden md:inline">Find Tutors</span>
                            </Link>
                            <Link to="/chat" className="btn btn-secondary flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden md:inline">Messages</span>
                            </Link>
                            <NotificationBell />
                            <button onClick={handleLogout} className="btn btn-secondary flex items-center space-x-2">
                                <LogOut className="w-5 h-5" />
                                <span className="hidden md:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container-custom py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Here's what's happening with your learning journey
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.bookingStatus === 'confirmed').length}
                                </p>
                            </div>
                            <Calendar className="w-12 h-12 text-primary" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Classes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.bookingStatus === 'completed').length}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-success" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Demos</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.bookingType === 'demo' && !b.demoCompleted).length}
                                </p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                        <Link to="/search" className="btn btn-primary">
                            Find More Tutors
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You haven't booked any classes yet
                            </p>
                            <Link to="/search" className="btn btn-primary">
                                Find a Tutor
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-bold text-primary">
                                                    {booking.teacherId?.name?.charAt(0) || 'T'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {booking.teacherId?.name || 'Teacher'}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {booking.subject} • {booking.class}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className={`badge ${booking.bookingStatus === 'confirmed' ? 'badge-success' :
                                                booking.bookingStatus === 'completed' ? 'badge-primary' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                }`}>
                                                {booking.bookingStatus}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(booking.amount)}
                                            </p>

                                            {/* Phase 6: Demo Completion Action */}
                                            {booking.bookingType === 'demo' &&
                                                booking.bookingStatus === 'confirmed' &&
                                                !booking.demoCompleted && (
                                                    <button
                                                        onClick={() => openCompletionModal(booking)}
                                                        className="btn btn-xs btn-outline-primary"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}

                                            {/* Phase 10: Review Action */}
                                            {booking.bookingStatus === 'completed' && (
                                                <button
                                                    onClick={() => openReviewModal(booking)}
                                                    className="btn btn-xs btn-secondary"
                                                >
                                                    Write Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions & Calendar */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="card">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Schedule</h3>
                        <DashboardCalendar bookings={bookings} />
                    </div>

                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/search" className="flex flex-col items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors border border-primary-100 dark:border-primary-800 text-center group">
                                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Search className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Find Tutors</span>
                                </Link>
                                <Link to="/chat" className="flex flex-col items-center justify-center p-4 bg-secondary-50 dark:bg-gray-700/50 rounded-lg hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors border border-secondary-100 dark:border-gray-600 text-center group">
                                    <div className="w-10 h-10 bg-secondary-100 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-5 h-5 text-secondary-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Messages</span>
                                </Link>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Student Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Student Name:</span>
                                    <span className="font-medium">{user?.studentName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Class:</span>
                                    <span className="font-medium">{user?.class || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Board:</span>
                                    <span className="font-medium">{user?.board || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DemoCompletionModal
                booking={selectedBooking}
                isOpen={isCompletionModalOpen}
                onClose={() => setIsCompletionModalOpen(false)}
                onUpdate={fetchBookings}
            />

            <ReviewSubmissionModal
                booking={selectedBooking}
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onReviewSubmitted={fetchBookings}
            />
        </div>
    );
};

export default StudentDashboard;
