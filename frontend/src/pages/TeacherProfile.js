import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teachersAPI, reviewsAPI } from '../services/api';
import { formatCurrency, stringToColor, getInitials } from '../utils/helpers';
import { MapPin, Star, BookOpen, Clock, BadgeCheck, PlayCircle, Calendar, MessageCircle, Share2, Heart } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const TeacherProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const response = await teachersAPI.getById(id);
                if (response.data.success) {
                    setTeacher(response.data.teacher);
                }

                // Fetch reviews
                const reviewsRes = await reviewsAPI.getByTeacher(id);
                if (reviewsRes.data.success) {
                    setReviews(reviewsRes.data.reviews);
                }
            } catch (error) {
                console.error('Error fetching teacher:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!teacher) return <div className="min-h-screen flex items-center justify-center">Teacher not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header/Nav */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                <div className="container-custom py-3 flex justify-between items-center">
                    <Link to="/search" className="flex items-center space-x-2 text-primary font-bold">
                        <BookOpen className="w-6 h-6" />
                        <span>HomeTutor</span>
                    </Link>
                    <Link to="/search" className="text-sm font-medium hover:text-primary">Back to Search</Link>
                </div>
            </nav>

            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <div className="card">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 mx-auto md:mx-0">
                                    {teacher.photo ? (
                                        <img src={teacher.photo} alt={teacher.name} className="w-full h-full rounded-full object-cover border-4 border-primary-50" />
                                    ) : (
                                        <div className="w-full h-full rounded-full flex items-center justify-center text-4xl text-white font-bold" style={{ backgroundColor: stringToColor(teacher.name) }}>
                                            {getInitials(teacher.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-start">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                                {teacher.name}
                                                {teacher.isPremium && <BadgeCheck className="w-6 h-6 text-blue-500" fill="currentColor" color="white" />}
                                            </h1>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                                                <MapPin className="w-4 h-4" /> {teacher.address?.city}, {teacher.address?.state}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex gap-2 justify-center">
                                            <button className="btn btn-ghost p-2 rounded-full border border-gray-200"><Share2 className="w-5 h-5 text-gray-600" /></button>
                                            <button className="btn btn-ghost p-2 rounded-full border border-gray-200"><Heart className="w-5 h-5 text-gray-600" /></button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
                                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 text-yellow-700">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <span className="font-bold">{teacher.rating?.toFixed(1) || 'New'}</span>
                                            <span>({teacher.totalReviews} reviews)</span>
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <span className="font-bold text-gray-900 dark:text-white">{teacher.experience} Years</span> Experience
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                                        {teacher.subjects?.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
                                        {teacher.boards?.map(b => <span key={b} className="badge badge-secondary">{b}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs content */}
                        <div className="card p-0 overflow-hidden">
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {['about', 'reviews', 'availability'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-lg font-bold mb-3">About Me</h3>
                                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{teacher.bio || "No bio provided."}</p>
                                        </section>

                                        {teacher.videoIntro && (
                                            <section>
                                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><PlayCircle className="w-5 h-5" /> Introduction Video</h3>
                                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                    <video controls src={teacher.videoIntro} className="w-full h-full object-cover">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            </section>
                                        )}

                                        <section>
                                            <h3 className="text-lg font-bold mb-3">Qualifications</h3>
                                            <ul className="space-y-3">
                                                {teacher.qualifications?.map((q, i) => (
                                                    <li key={i} className="flex gap-3">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0"></div>
                                                        <div>
                                                            <div className="font-semibold">{q.degree}</div>
                                                            <div className="text-sm text-gray-500">{q.institution} • {q.year}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'availability' && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Weekly Schedule</h3>
                                        <div className="space-y-4">
                                            {teacher.availability?.map((daySlot, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                                    <div className="w-32 font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">{daySlot.day}</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {daySlot.slots?.map((slot, j) => (
                                                            <span key={j} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                                                                {slot.start} - {slot.end}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!teacher.availability || teacher.availability.length === 0) && (
                                                <p className="text-gray-500 italic">No availability listed.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold">Student Reviews ({reviews.length})</h3>
                                        {reviews.length > 0 ? (
                                            reviews.map(review => (
                                                <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold">{review.studentId?.name || 'Student'}</div>
                                                            <span className="text-gray-400 text-sm">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex text-yellow-500">
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No reviews yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="card sticky top-24">
                                <h3 className="text-xl font-bold mb-4">Pricing</h3>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(teacher.hourlyRate)}</span>
                                </div>
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-600 dark:text-gray-400">Monthly (approx)</span>
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(teacher.monthlyRate)}</span>
                                </div>

                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="btn btn-primary w-full py-3 mb-3 text-lg shadow-lg shadow-blue-500/30"
                                >
                                    Book a Session
                                </button>

                                {/* Start Chat Button */}
                                <Link
                                    to={`/chat`} // Ideally pass state or use query param to auto-select
                                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" /> Message Teacher
                                </Link>

                                <div className="mt-6 text-xs text-gray-500 text-center">
                                    <p>100% Satisfaction Guarantee</p>
                                    <p>Free cancellation up to 24hrs before</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <BookingModal
                    teacher={teacher}
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                />
            </div>
        </div>

    );
};

export default TeacherProfile;
