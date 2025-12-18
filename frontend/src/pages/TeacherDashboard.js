import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, DollarSign, Calendar, MessageCircle, LogOut } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import EarningsChart from '../components/EarningsChart';
import DashboardCalendar from '../components/DashboardCalendar';
import ProfileCompletion from '../components/ProfileCompletion';
import { analyticsAPI, bookingsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';



const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEarnings: 0, chartData: [], upcomingClassesCount: 0 });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, bookingsRes] = await Promise.all([
                    analyticsAPI.getTeacherStats(),
                    bookingsAPI.getAll()
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }
                if (bookingsRes.data.success) {
                    setBookings(bookingsRes.data.bookings);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome, {user?.name}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your teaching activities and track your progress
                    </p>
                </div>

                {/* Profile Completion Indicator */}
                <div className="max-w-3xl">
                    <ProfileCompletion user={user} />
                </div>

                {/* Stats Grid */}
                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{user?.totalStudents || 0}</p>
                            </div>
                            <Users className="w-12 h-12 text-primary" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalEarnings)}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-success" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{user?.rating?.toFixed(1) || '0.0'}</p>
                            </div>
                            <div className="text-yellow-500 text-2xl">⭐</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{user?.totalReviews || 0}</p>
                            </div>
                            <MessageCircle className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Earnings Chart */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Earnings Overview</h2>
                        <EarningsChart data={stats.chartData} />
                    </div>

                    {/* Upcoming Classes / Calendar */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Schedule</h2>
                        <DashboardCalendar bookings={bookings} />
                    </div>
                </div>

                {/* Profile Info */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {user?.subjects?.map((subject, index) => (
                                    <span key={index} className="badge badge-primary">
                                        {subject}
                                    </span>
                                )) || <span className="text-gray-500">None added</span>}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Boards</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {user?.boards?.map((board, index) => (
                                    <span key={index} className="badge badge-success">
                                        {board}
                                    </span>
                                )) || <span className="text-gray-500">None added</span>}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                            <p className="font-medium mt-1">{user?.experience || 0} years</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rate</p>
                            <p className="font-medium mt-1">{formatCurrency(user?.monthlyRate || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <button className="btn btn-primary">Update Profile</button>
                        <button className="btn btn-secondary">Manage Availability</button>
                        <Link to="/chat" className="btn btn-secondary">
                            View Messages
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
