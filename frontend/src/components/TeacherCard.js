import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, BookOpen, Clock, BadgeCheck } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const TeacherCard = ({ teacher }) => {
    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left: Photo & Rating */}
                <div className="w-full md:w-1/4 flex flex-col items-center">
                    <img
                        src={teacher.photo || `https://ui-avatars.com/api/?name=${teacher.name}&background=0D8ABC&color=fff`}
                        alt={teacher.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 dark:border-gray-700 mb-2"
                    />
                    <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {teacher.rating ? teacher.rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({teacher.totalReviews})
                        </span>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-3/4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {teacher.name}
                                {teacher.isPremium && <BadgeCheck className="w-5 h-5 text-blue-500" fill="currentColor" color="white" />}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {teacher.address?.city}, {teacher.address?.state}
                                {teacher.distance && (
                                    <span className="ml-2 text-primary font-medium">
                                        • {teacher.distance.toFixed(1)} km away
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(teacher.hourlyRate)}<span className="text-xs text-gray-500 font-normal">/hr</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatCurrency(teacher.monthlyRate)}/mo
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {teacher.subjects?.slice(0, 3).map((subject, index) => (
                            <span key={index} className="badge badge-primary text-xs">
                                {subject}
                            </span>
                        ))}
                        {teacher.boards?.slice(0, 2).map((board, index) => (
                            <span key={index} className="badge badge-secondary text-xs">
                                {board}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                            {teacher.experience} Yrs Exp
                        </div>
                        <Link to={`/teacher/${teacher._id}`} className="btn btn-sm btn-primary">
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon component since Lucide might not export Briefcase by default in all versions or I missed it in import
const BriefcaseIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

export default TeacherCard;
