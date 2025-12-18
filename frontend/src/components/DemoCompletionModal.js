import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { bookingsAPI } from '../services/api';

const DemoCompletionModal = ({ booking, isOpen, onClose, onUpdate }) => {
    const [satisfactory, setSatisfactory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !booking) return null;

    const handleSubmit = async () => {
        if (satisfactory === null) return;
        setLoading(true);
        setError('');

        try {
            const response = await bookingsAPI.completeDemo(booking._id, satisfactory);
            if (response.data.success) {
                onUpdate(); // Refresh dashboard
                onClose();
            }
        } catch (err) {
            console.error('Error completing demo:', err);
            setError(err.response?.data?.message || 'Error updating booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Complete Demo Class</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        How was your demo session with <span className="font-semibold">{booking.teacherId.name}</span>?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSatisfactory(true)}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${satisfactory === true
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-200 text-gray-500'
                                }`}
                        >
                            <ThumbsUp className="w-8 h-8" />
                            <span className="font-bold">Satisfactory</span>
                        </button>

                        <button
                            onClick={() => setSatisfactory(false)}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${satisfactory === false
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-200 text-gray-500'
                                }`}
                        >
                            <ThumbsDown className="w-8 h-8" />
                            <span className="font-bold">Not Satisfied</span>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                        {satisfactory === true && (
                            <p className="flex items-start gap-2 text-green-700 dark:text-green-300">
                                <ThumbsUp className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>The payment of <b>₹{booking.amount}</b> will be released to the teacher.</span>
                            </p>
                        )}
                        {satisfactory === false && (
                            <p className="flex items-start gap-2 text-red-700 dark:text-red-300">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>The payment of <b>₹{booking.amount}</b> will be refunded to your original payment method.</span>
                            </p>
                        )}
                        {satisfactory === null && (
                            <p className="text-gray-500 text-center">Please select an option to proceed.</p>
                        )}
                    </div>
                </div>

                {error && <div className="alert alert-error mb-4">{error}</div>}

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={satisfactory === null || loading}
                        className={`btn flex-1 ${satisfactory === false ? 'btn-error' : 'btn-primary'}`}
                    >
                        {loading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoCompletionModal;
