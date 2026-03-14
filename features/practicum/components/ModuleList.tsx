'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Search, ExternalLink, FileText, LayoutGrid, List } from 'lucide-react';
import type { PracticumModuleWithCourse } from '@/features/practicum/types';
import type { CourseWithLecturer } from '@/features/courses/types';

interface ModuleListProps {
    modules: PracticumModuleWithCourse[];
    courses: CourseWithLecturer[];
}

export default function ModuleList({ modules, courses }: ModuleListProps) {
    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourseId, setFilterCourseId] = useState('');

    // Pagination & View Mode
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'list' : 'grid';
        }
        return 'list';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // Filtered modules
    const filteredModules = useMemo(() => {
        return modules.filter(m => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!m.name.toLowerCase().includes(query)) {
                    return false;
                }
            }
            if (filterCourseId) {
                if (m.courseId !== parseInt(filterCourseId)) {
                    return false;
                }
            }
            return true;
        });
    }, [modules, searchQuery, filterCourseId]);

    // Apply pagination
    const totalPages = Math.ceil(filteredModules.length / perPage);
    const paginatedModules = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage;
        return filteredModules.slice(startIndex, startIndex + perPage);
    }, [filteredModules, currentPage, perPage]);

    // Handle search/filter changes (reset pagination)
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleCourseFilterChange = (val: string) => {
        setFilterCourseId(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Modul Praktikum</h1>
                <p className="text-gray-500 text-sm mt-1">Daftar modul praktikum yang tersedia</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari modul..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={filterCourseId}
                        onChange={(e) => handleCourseFilterChange(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:min-w-[11.25rem] sm:w-auto"
                    >
                        <option value="">Semua Mata Kuliah</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                    </select>
                </div>

            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Menampilkan {filteredModules.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-{Math.min(currentPage * perPage, filteredModules.length)} dari {filteredModules.length} modul
                </p>
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-0.5">
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

            {/* Module List */}
            {filteredModules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                        {searchQuery || filterCourseId ? 'Tidak ada modul yang sesuai filter.' : 'Belum ada modul praktikum.'}
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                                    <th className="px-6 py-3 font-medium">Judul Modul</th>
                                    <th className="px-4 py-3 font-medium">Mata Kuliah</th>
                                    <th className="px-4 py-3 font-medium">Deskripsi</th>
                                    <th className="px-4 py-3 font-medium">File</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedModules.map((module) => (
                                    <tr key={module.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-[#0F4C81] flex-shrink-0" />
                                                <span className="font-medium text-gray-900 line-clamp-1">{module.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {module.courseName ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
                                                    {module.courseCode} - {module.courseName}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            <p className="line-clamp-2 max-w-xs">{module.description || '-'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {module.filePath ? (
                                                <a
                                                    href={module.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#0F4C81] hover:text-blue-700 text-sm font-medium"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Buka
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Tidak tersedia</span>
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
                    {paginatedModules.map((module) => (
                        <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-5 h-5 text-[#0F4C81]" />
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{module.name}</h3>
                            </div>
                            {module.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>
                            )}
                            {module.courseName && (
                                <div className="mb-3">
                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                        {module.courseCode} - {module.courseName}
                                    </span>
                                </div>
                            )}
                            {module.filePath ? (
                                <a
                                    href={module.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-white bg-[#0F4C81] hover:bg-[#0F4C81]/90 px-3 py-1.5 rounded-lg transition-colors w-max"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Download Modul
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                                    <FileText className="w-3 h-3" />
                                    File belum tersedia
                                </span>
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
