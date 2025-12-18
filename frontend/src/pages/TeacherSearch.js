import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../services/api';
import { getCurrentLocation } from '../utils/helpers';
import TeacherCard from '../components/TeacherCard';
import { Filter, MapPin, Search as SearchIcon, X } from 'lucide-react';

const TeacherSearch = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: '',
        board: '',
        class: '',
        minRate: '',
        maxRate: '',
        rating: '',
        lat: '',
        lng: '',
        radius: 10 // default 10km
    });
    const [keyword, setKeyword] = useState('');
    const [locationStatus, setLocationStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    const SUBJECTS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Economics', 'Computer Science'];
    const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
    const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        fetchTeachers();
    }, [filters]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            // Construct query params
            const params = {
                ...filters,
                search: keyword
            };
            // Remove empty keys
            Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await teachersAPI.search(params);
            if (response.data.success && Array.isArray(response.data.teachers)) {
                setTeachers(response.data.teachers);
            } else {
                setTeachers([]);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTeachers();
    };

    const handleLocation = async () => {
        setLocationStatus('detecting');
        try {
            const position = await getCurrentLocation();
            setFilters(prev => ({
                ...prev,
                lat: position.latitude,
                lng: position.longitude
            }));
            setLocationStatus('detected');
        } catch (error) {
            console.error('Location error:', error);
            setLocationStatus('error');
        }
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            board: '',
            class: '',
            minRate: '',
            maxRate: '',
            rating: '',
            lat: '',
            lng: '',
            radius: 10
        });
        setKeyword('');
        setLocationStatus('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container-custom">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Find the Perfect Home Tutor
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by name or subject (e.g. 'Math Tutor')"
                                className="input pl-10 w-full"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <button type="submit" className="absolute right-2 top-2 btn btn-primary px-4 py-1.5 h-auto text-sm">
                                Search
                            </button>
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary md:hidden flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`w-full md:w-1/4 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="card sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Filter className="w-5 h-5" /> Filters
                                </h3>
                                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                                    Clear All
                                </button>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                <label className="label">Location</label>
                                <button
                                    onClick={handleLocation}
                                    className={`btn w-full flex items-center justify-center gap-2 ${locationStatus === 'detected' ? 'btn-success' : 'btn-outline'
                                        }`}
                                    disabled={locationStatus === 'detecting'}
                                >
                                    <MapPin className="w-4 h-4" />
                                    {locationStatus === 'detecting' ? 'Locating...' :
                                        locationStatus === 'detected' ? 'Location Set' : 'Use My Location'}
                                </button>
                                {locationStatus === 'error' && (
                                    <p className="text-red-500 text-xs mt-2">Location access denied or failed.</p>
                                )}
                            </div>

                            {/* Subject Filter */}
                            <div className="mb-4">
                                <label className="label">Subject</label>
                                <select
                                    className="input"
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                >
                                    <option value="">All Subjects</option>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div className="mb-4">
                                <label className="label">Class</label>
                                <select
                                    className="input"
                                    value={filters.class}
                                    onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                                >
                                    <option value="">All Classes</option>
                                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                                </select>
                            </div>

                            {/* Board Filter */}
                            <div className="mb-4">
                                <label className="label">Board</label>
                                <select
                                    className="input"
                                    value={filters.board}
                                    onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                                >
                                    <option value="">All Boards</option>
                                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            {/* Hourly Rate */}
                            <div className="mb-4">
                                <label className="label">Max Hourly Rate (₹)</label>
                                <input
                                    type="range"
                                    min="100"
                                    max="2000"
                                    step="100"
                                    className="w-full"
                                    value={filters.maxRate || 2000}
                                    onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                                />
                                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                                    ₹{filters.maxRate || 2000}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full md:w-3/4">
                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="card h-64 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="flex-1 space-y-4">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : teachers.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No teachers found</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try adjusting your filters or search criteria.
                                </p>
                                <button onClick={clearFilters} className="btn btn-link mt-4">
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {teachers.map((teacher) => (
                                    <TeacherCard key={teacher._id} teacher={teacher} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherSearch;
