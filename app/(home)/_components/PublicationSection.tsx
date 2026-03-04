import { BookOpen, Eye, User, ArrowRight } from 'lucide-react';
import PublicationLink from '@/features/publications/components/PublicationLink';
import Link from 'next/link';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface Publication {
    id: number;
    title: string;
    authorName: string;
    viewCount: number;
    link: string | null;
    publishYear: number | null;
    publishMonth: number | null;
    publishDay: number | null;
}

interface PublicationSectionProps {
    topPublications: Publication[];
}

function formatDate(year?: number | null, month?: number | null): string {
    if (!year) return '';
    if (month) return MONTHS_SHORT[month - 1] + ' ' + year;
    return String(year);
}

export default function PublicationSection({ topPublications }: PublicationSectionProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="w-6 h-6 text-[#0F4C81]" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Publikasi Terpopuler
                    </h2>
                </div>
                <Link
                    href="/publications"
                    className="text-sm font-medium text-[#0F4C81] hover:underline flex items-center gap-1"
                >
                    Lihat Semua
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex flex-col gap-4">
                {topPublications.length === 0 ? (
                    <div className="flex items-center justify-center p-8 text-gray-500 italic bg-gray-50 rounded-xl border border-gray-100">
                        Tidak ada publikasi
                    </div>
                ) : (
                    topPublications.map((pub) => (
                        <div key={pub.id} className="group relative bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                        <Eye className="w-3 h-3" />
                                        {pub.viewCount} Views
                                    </div>
                                    {pub.publishYear && (
                                        <span className="text-xs text-gray-500">
                                            {formatDate(pub.publishYear, pub.publishMonth)}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#0F4C81] transition-colors">
                                    {pub.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span className="line-clamp-1">{pub.authorName}</span>
                                </div>
                            </div>

                            {pub.link && (
                                <PublicationLink
                                    id={pub.id}
                                    url={pub.link}
                                    className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[#0F4C81] hover:underline bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-200 transition-all shadow-sm"
                                >
                                    Baca Selengkapnya &rarr;
                                </PublicationLink>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
