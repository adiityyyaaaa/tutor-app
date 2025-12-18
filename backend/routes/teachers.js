const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { calculateDistance } = require('../utils/distance');
const { protect } = require('../middleware/auth');

// @route   GET /api/teachers/search
// @desc    Search teachers with filters and location-based sorting
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            subject,
            board,
            class: studentClass,
            minRating,
            minPrice,
            maxPrice,
            minExperience,
            examSpecialist,
            maxDistance,
            day,
            time,
            search // Add search param
        } = req.query;

        // Build query
        let query = { isActive: true };

        // Search text filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { subjects: searchRegex },
                { bio: searchRegex }
            ];
        }

        // Subject filter
        if (subject) {
            query.subjects = subject;
        }

        // Board filter
        if (board) {
            query.boards = board;
        }

        // Class filter
        if (studentClass) {
            query.classesCanTeach = studentClass;
        }

        // Rating filter
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.monthlyRate = {};
            if (minPrice) query.monthlyRate.$gte = parseFloat(minPrice);
            if (maxPrice) query.monthlyRate.$lte = parseFloat(maxPrice);
        }

        // Experience filter
        if (minExperience) {
            query.experience = { $gte: parseInt(minExperience) };
        }

        // Exam specialist filter
        if (examSpecialist === 'true') {
            query.examSpecialist = true;
        }

        // Availability filter
        if (day && time) {
            query.availability = {
                $elemMatch: {
                    day: day,
                    'slots.start': { $lte: time },
                    'slots.end': { $gte: time }
                }
            };
        }

        // Execute query
        let teachers = await Teacher.find(query).select('-password');

        // If location provided, calculate distances and sort
        if (latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);

            teachers = teachers.map(teacher => {
                const teacherCoords = teacher.address.coordinates.coordinates;
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    teacherCoords[1], // latitude
                    teacherCoords[0]  // longitude
                );

                return {
                    ...teacher.toObject(),
                    distance
                };
            });

            // Filter by maximum distance if specified
            if (maxDistance) {
                teachers = teachers.filter(t => t.distance <= parseFloat(maxDistance));
            }

            // Sort by distance (nearest first)
            teachers.sort((a, b) => a.distance - b.distance);
        }

        // Prioritize promoted teachers
        teachers.sort((a, b) => {
            if (a.promotionActive && !b.promotionActive) return -1;
            if (!a.promotionActive && b.promotionActive) return 1;
            return 0;
        });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });
    } catch (error) {
        console.error('Teacher search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching teachers',
            error: error.message
        });
    }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).select('-password');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // If user location is provided, calculate distance
        if (req.query.latitude && req.query.longitude) {
            const userLat = parseFloat(req.query.latitude);
            const userLon = parseFloat(req.query.longitude);
            const teacherCoords = teacher.address.coordinates.coordinates;

            const distance = calculateDistance(
                userLat,
                userLon,
                teacherCoords[1],
                teacherCoords[0]
            );

            return res.status(200).json({
                success: true,
                teacher: {
                    ...teacher.toObject(),
                    distance
                }
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher',
            error: error.message
        });
    }
});

// @route   PUT /api/teachers/profile
// @desc    Update teacher profile
// @access  Private (Teacher only)
router.put('/profile', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can update teacher profiles'
            });
        }

        const updates = req.body;

        // Don't allow updating sensitive fields
        delete updates.password;
        delete updates.email;
        delete updates.role;
        delete updates.rating;
        delete updates.totalReviews;
        delete updates.totalStudents;

        const teacher = await Teacher.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            teacher
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// @route   POST /api/teachers/upload-photo
// @desc    Upload teacher profile photo
// @access  Private (Teacher only)
const { uploadPhoto } = require('../middleware/upload');
router.post('/upload-photo', protect, uploadPhoto.single('photo'), async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can upload photos'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a photo'
            });
        }

        const photoPath = `/uploads/photos/${req.file.filename}`;

        await Teacher.findByIdAndUpdate(req.user._id, { photo: photoPath });

        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            photoPath
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading photo',
            error: error.message
        });
    }
});

// @route   POST /api/teachers/upload-video
// @desc    Upload teacher video (intro or teaching demo)
// @access  Private (Teacher only)
const { uploadVideo } = require('../middleware/upload');
router.post('/upload-video', protect, uploadVideo.single('video'), async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can upload videos'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a video'
            });
        }

        const { videoType } = req.body; // 'intro' or 'teaching'
        const videoPath = `/uploads/videos/${req.file.filename}`;

        const updateField = videoType === 'intro' ? 'videoIntro' : 'teachingVideo';
        await Teacher.findByIdAndUpdate(req.user._id, { [updateField]: videoPath });

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            videoPath
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading video',
            error: error.message
        });
    }
});

module.exports = router;
