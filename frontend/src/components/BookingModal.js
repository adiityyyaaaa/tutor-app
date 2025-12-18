import React, { useState } from 'react';
import { X, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { formatCurrency, loadScript } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ teacher, isOpen, onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [bookingType, setBookingType] = useState('monthly'); // 'demo', 'monthly', 'exam'
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [subject, setSubject] = useState(teacher.subjects[0] || '');
    const [studentClass, setStudentClass] = useState(teacher.classesCanTeach[0] || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const getAvailableSlots = (dateStr) => {
        if (!dateStr) return [];
        const date = new Date(dateStr);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[date.getDay()];

        const dayAvailability = teacher.availability.find(a => a.day === dayName);
        return dayAvailability ? dayAvailability.slots : [];
    };

    const calculateAmount = () => {
        if (bookingType === 'demo') return 500; // Fixed demo fee (refundable/hold)
        if (bookingType === 'exam') return teacher.examSpecialistRate || 10000;
        return teacher.monthlyRate;
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Create Booking Order
            const bookingData = {
                teacherId: teacher._id,
                subject,
                class: studentClass,
                bookingType,
                scheduledDate: selectedDate,
                scheduledTime: selectedSlot,
                amount: calculateAmount(),
                address: user.address || {}, // Use user address or prompt for one
                notes: 'Booking from web app'
            };

            const response = await bookingsAPI.create(bookingData);

            if (response.data.success) {
                const { booking, razorpayOrderId } = response.data;

                // 2. Open Razorpay
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Use env or mock
                    amount: booking.amount * 100,
                    currency: 'INR',
                    name: 'HomeTutor',
                    description: `${bookingType.toUpperCase()} Session with ${teacher.name}`,
                    image: '/logo192.png',
                    order_id: razorpayOrderId,
                    handler: async function (response) {
                        // 3. Verify Payment
                        try {
                            await bookingsAPI.verifyPayment({
                                bookingId: booking._id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });
                            alert('Booking Successful!');
                            onClose();
                        } catch (err) {
                            console.error('Verification failed', err);
                            setError('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.phone
                    },
                    theme: {
                        color: '#0D8ABC'
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            }
        } catch (err) {
            console.error('Booking failed', err);
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white">Book Session</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && <div className="alert alert-error mb-4">{error}</div>}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Select Session Type</h4>
                            <div className="space-y-3">
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${bookingType === 'demo' ? 'border-primary bg-primary-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <input type="radio" name="type" className="radio radio-primary mr-3" checked={bookingType === 'demo'} onChange={() => setBookingType('demo')} />
                                    <div className="flex-1">
                                        <div className="font-bold">Demo Session</div>
                                        <div className="text-xs text-gray-500">1 Hour • ₹500 (Refundable if unsatisfied)</div>
                                    </div>
                                </label>
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${bookingType === 'monthly' ? 'border-primary bg-primary-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <input type="radio" name="type" className="radio radio-primary mr-3" checked={bookingType === 'monthly'} onChange={() => setBookingType('monthly')} />
                                    <div className="flex-1">
                                        <div className="font-bold">Monthly Tuition</div>
                                        <div className="text-xs text-gray-500">Regular Classes • {formatCurrency(teacher.monthlyRate)}/mo</div>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="label">Subject</label>
                                <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
                                    {teacher.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="mt-2">
                                <label className="label">Class</label>
                                <select className="input" value={studentClass} onChange={e => setStudentClass(e.target.value)}>
                                    {teacher.classesCanTeach.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <button onClick={handleNext} className="btn btn-primary w-full mt-6">Next</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Select Date & Time</h4>
                            <div>
                                <label className="label">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="input w-full pl-10"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                                    />
                                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <label className="label">Available Slots</label>
                                {selectedDate ? (
                                    getAvailableSlots(selectedDate).length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {getAvailableSlots(selectedDate).map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedSlot(slot.start)}
                                                    className={`py-2 px-1 text-sm border rounded hover:bg-primary hover:text-white transition-colors ${selectedSlot === slot.start ? 'bg-primary text-white' : ''}`}
                                                >
                                                    {slot.start} - {slot.end}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-500">No slots available on this day. (Check teacher availability: {teacher.availability.map(a => a.day).join(', ')})</p>
                                    )
                                ) : (
                                    <p className="text-sm text-gray-500">Select a date first</p>
                                )}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={handleBack} className="btn btn-outline flex-1">Back</button>
                                <button onClick={handleNext} disabled={!selectedDate || !selectedSlot} className="btn btn-primary flex-1">Next</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold">Payment Summary</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Teacher:</span>
                                    <span className="font-medium">{teacher.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subject:</span>
                                    <span className="font-medium">{subject}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-medium">{selectedDate} at {selectedSlot}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2 flex justify-between font-bold text-lg">
                                    <span>Total Amount:</span>
                                    <span className="text-primary">{formatCurrency(calculateAmount())}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : `Pay ${formatCurrency(calculateAmount())}`}
                            </button>
                            <button onClick={handleBack} className="btn btn-link w-full text-sm">Go Back</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
