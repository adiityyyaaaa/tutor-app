const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/teacher-stats
// @desc    Get aggregated stats for teacher dashboard
// @access  Private (Teacher only)
router.get('/teacher-stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const teacherId = req.user._id;

        // 1. Calculate Total Earnings
        const totalEarningsResult = await Booking.aggregate([
            {
                $match: {
                    teacherId: teacherId,
                    paymentStatus: 'released', // Only count released payments
                    bookingStatus: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

        // 2. Monthly Earnings (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyEarnings = await Booking.aggregate([
            {
                $match: {
                    teacherId: teacherId,
                    paymentStatus: 'released',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    amount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format for frontend chart (fill missing months with 0)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const monthNum = d.getMonth() + 1;
            const yearNum = d.getFullYear();

            const found = monthlyEarnings.find(item => item._id.month === monthNum && item._id.year === yearNum);
            chartData.push({
                name: monthName,
                amount: found ? found.amount : 0
            });
        }

        // 3. Upcoming Classes Count
        const upcomingClassesCount = await Booking.countDocuments({
            teacherId: teacherId,
            bookingStatus: 'confirmed',
            scheduledDate: { $gte: new Date() }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalEarnings,
                chartData,
                upcomingClassesCount
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
