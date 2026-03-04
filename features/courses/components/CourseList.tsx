'use client';

import { useState, useMemo } from 'react';
import { GraduationCap, User, Search, LayoutGrid, List } from 'lucide-react';
import type { CourseWithLecturer } from '@/features/courses/types';

interface CourseListProps {
    courses: CourseWithLecturer[];
}

export default function CourseList({ courses }: CourseListProps) {
    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSemester, setFilterSemester] = useState('');

    // Pagination & View Mode
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // Filtered courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!course.name.toLowerCase().includes(query) && !course.code.toLowerCase().includes(query)) {
                    return false;
                }
            }
            if (filterSemester) {
                if (course.semester !== filterSemester) {
                    return false;
                }
            }
            return true;
        });
    }, [courses, searchQuery, filterSemester]);

    // Apply pagination
    const totalPages = Math.ceil(filteredCourses.length / perPage);
    const paginatedCourses = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        return filteredCourses.slice(startIndex, startIndex + perPage);
    }, [filteredCourses, currentPage, perPage]);

    // Handle search/filter changes (reset pagination)
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleSemesterFilterChange = (val: string) => {
        setFilterSemester(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
                <p className="text-gray-500 text-sm mt-1">Daftar mata kuliah yang tersedia</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari kode atau nama mata kuliah..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={filterSemester}
                        onChange={(e) => handleSemesterFilterChange(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:min-w-[11.25rem] sm:w-auto"
                    >
                        <option value="">Semua Semester</option>
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Menampilkan {filteredCourses.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-{Math.min(currentPage * perPage, filteredCourses.length)} dari {filteredCourses.length} mata kuliah
                </p>
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan Grid">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan List">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Course List */}
            {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                        {searchQuery || filterSemester ? 'Tidak ada mata kuliah yang sesuai filter.' : 'Belum ada mata kuliah.'}
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                                    <th className="px-6 py-3 font-medium">Mata Kuliah</th>
                                    <th className="px-4 py-3 font-medium">Semester</th>
                                    <th className="px-4 py-3 font-medium">SKS</th>
                                    <th className="px-4 py-3 font-medium">Dosen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{course.name}</div>
                                                    <div className="text-xs text-gray-500">{course.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${course.semester === 'Ganjil' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-700'}`}>
                                                {course.semester || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {course.sks || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {course.lecturerName ? (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <span>{course.lecturerName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Belum di set</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1" title={course.name}>{course.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 flex gap-1.5 items-center">
                                        <span>{course.code}</span>
                                        <span>•</span>
                                        <span className={`inline-flex px-1.5 py-0.5 rounded font-medium ${course.semester === 'Ganjil' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-700'}`}>
                                            {course.semester}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{course.sks || '-'} SKS</p>
                                </div>
                            </div>
                            {course.lecturerName && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-600 truncate" title={course.lecturerName}>{course.lecturerName}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ← Sebelumnya
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) pageNum = i + 1;
                        else if (currentPage <= 4) pageNum = i + 1;
                        else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
                        else pageNum = currentPage - 3 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${pageNum === currentPage
                                    ? 'bg-[#0F4C81] text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Selanjutnya →
                    </button>
                </div>
            )}
        </div>
    );
}
