import React from 'react';
import { CheckCircle, AlertCircle, Trophy } from 'lucide-react';

const ProfileCompletion = ({ user }) => {
    if (!user) return null;

    // Weightage for different profile sections
    const criteria = [
        {
            id: 'photo',
            label: 'Profile Photo',
            description: 'Add a professional photo to build trust',
            weight: 10,
            isComplete: !!user.photo
        },
        {
            id: 'videoIntro',
            label: 'Video Introduction',
            description: 'Teachers with videos get 3x more bookings',
            weight: 20,
            isComplete: !!user.videoIntro
        },
        {
            id: 'teachingVideo',
            label: 'Teaching Demo',
            description: 'Showcase your teaching style',
            weight: 15,
            isComplete: !!user.teachingVideo
        },
        {
            id: 'about',
            label: 'Basic Details',
            description: 'Experience, subjects, and boards',
            weight: 15,
            isComplete: user.experience > 0 && user.subjects?.length > 0 && user.boards?.length > 0
        },
        {
            id: 'availability',
            label: 'Availability',
            description: 'Set your teaching hours',
            weight: 20,
            isComplete: user.availability?.length > 0
        },
        {
            id: 'pricing',
            label: 'Pricing',
            description: 'Set your hourly and monthly rates',
            weight: 10,
            isComplete: user.hourlyRate > 0 && user.monthlyRate > 0
        },
        {
            id: 'aadhaar',
            label: 'ID Verification',
            description: 'Verify your Aadhaar for "Verified" badge',
            weight: 10,
            isComplete: user.aadhaarVerified
        }
    ];

    const completedWeight = criteria.reduce((acc, item) => acc + (item.isComplete ? item.weight : 0), 0);
    const totalWeight = criteria.reduce((acc, item) => acc + item.weight, 0); // Should be 100
    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    const incompleteItems = criteria.filter(item => !item.isComplete);

    if (completionPercentage === 100) return null; // Don't show if complete

    return (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Profile Strength</h3>
                </div>
                <span className="font-bold text-primary text-lg">{completionPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                ></div>
            </div>

            {/* Missing Items */}
            <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complete these to get more students:</p>
                {incompleteItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start space-x-3 p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                        <button className="ml-auto text-xs font-semibold text-primary hover:text-primary-dark">
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileCompletion;
