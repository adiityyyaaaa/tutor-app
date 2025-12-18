import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import StarRating from './StarRating';
import { reviewsAPI } from '../services/api';

const ReviewSubmissionModal = ({ booking, isOpen, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await reviewsAPI.create({
                bookingId: booking._id,
                teacherId: booking.teacherId._id,
                rating,
                comment
            });

            if (response.data.success) {
                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }
                onClose();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Write a Review</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden">
                            {booking.teacherId.photo ? (
                                <img src={booking.teacherId.photo} alt={booking.teacherId.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                                    {booking.teacherId.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">How was your class with {booking.teacherId.name}?</h4>
                        <p className="text-sm text-gray-500">{booking.subject} • {booking.class}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6 flex flex-col items-center">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate your experience</label>
                            <StarRating rating={rating} editable={true} onChange={setRating} size="w-10 h-10" />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed feedback (Optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us what you liked or what could be improved..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                rows="4"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmissionModal;
