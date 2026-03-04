import { getPublicPublications, getPublicationKeywords, getPublicationLikeCounts, getUserLikedPublicationIds, getPublicationYears } from '@/features/publications/actions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookOpen, ExternalLink, Search, User, Eye, Tag, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import PublicationLink from '@/features/publications/components/PublicationLink';
import LikeButton from '@/features/publications/components/LikeButton';

interface SearchParams {
    search?: string;
    keyword?: string;
    year?: string;
    month?: string;
    page?: string;
    perPage?: string;
    view?: string;
}

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatPublishDate(year?: number | null, month?: number | null, day?: number | null): string {
    if (!year) return '';
    let str = String(year);
    if (month) {
        str = MONTHS[month - 1] + ' ' + str;
        if (day) str = day + ' ' + str;
    }
    return str;
}

function buildUrl(base: string, params: Record<string, string | undefined>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
}

export default async function StudentPublicationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const session = await getSession();
    if (!session) redirect('/login');

    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const perPage = Number(params.perPage) || 20;
    const viewMode = params.view || 'grid';

    const result = await getPublicPublications({
        search: params.search,
        keyword: params.keyword,
        year: params.year ? Number(params.year) : undefined,
        month: params.month ? Number(params.month) : undefined,
        page: currentPage,
        perPage,
    });
    const keywords = await getPublicationKeywords();
    const years = await getPublicationYears();

    // Get like data
    const publicationIds = result.data.map(p => p.id);
    const likeCounts = await getPublicationLikeCounts(publicationIds);
    const userLikedIds = await getUserLikedPublicationIds(session.user.identifier, publicationIds);

    const baseFilterParams = {
        search: params.search,
        keyword: params.keyword,
        year: params.year,
        month: params.month,
        perPage: params.perPage,
        view: params.view,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Publikasi</h1>
                <p className="text-gray-500 text-sm mt-1">Lihat publikasi Informatika UAI</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form method="GET" className="flex flex-col md:flex-row gap-4">
                    <input type="hidden" name="view" value={viewMode} />
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Cari judul atau penulis..."
                            defaultValue={params.search}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select name="keyword" defaultValue={params.keyword || ''} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Semua Kata Kunci</option>
                        {keywords.map((kw) => (
                            <option key={kw} value={kw}>{kw}</option>
                        ))}
                    </select>
                    <select name="year" defaultValue={params.year || ''} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Semua Tahun</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select name="month" defaultValue={params.month || ''} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Semua Bulan</option>
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors">
                        Cari
                    </button>
                    {(params.search || params.keyword || params.year || params.month) && (
                        <Link href={`/student/publications?view=${viewMode}`} className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm">
                            Reset
                        </Link>
                    )}
                </form>
            </div>

            {/* Active Filters */}
            {(params.search || params.keyword || params.year || params.month) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    <span>Filter aktif:</span>
                    {params.search && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Pencarian: &quot;{params.search}&quot;</span>}
                    {params.keyword && <span className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><Tag className="w-3 h-3" />{params.keyword}</span>}
                    {params.year && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Tahun: {params.year}</span>}
                    {params.month && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Bulan: {MONTHS[Number(params.month) - 1]}</span>}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    Menampilkan {Math.min((currentPage - 1) * perPage + 1, result.totalCount)}-{Math.min(currentPage * perPage, result.totalCount)} dari {result.totalCount} publikasi
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Per halaman:</span>
                        {[10, 20, 50, 100].map(n => (
                            <Link key={n} href={buildUrl('/student/publications', { ...baseFilterParams, perPage: String(n), page: '1' })}
                                className={`px-2 py-1 rounded text-sm ${perPage === n ? 'bg-[#0F4C81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {n}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <Link href={buildUrl('/student/publications', { ...baseFilterParams, view: 'grid', page: params.page })}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan Grid">
                            <LayoutGrid className="w-4 h-4" />
                        </Link>
                        <Link href={buildUrl('/student/publications', { ...baseFilterParams, view: 'list', page: params.page })}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan List">
                            <List className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Publications */}
            {result.data.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                        {params.search || params.keyword ? 'Tidak ada publikasi yang sesuai filter.' : 'Belum ada publikasi.'}
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                                    <th className="px-6 py-3 font-medium">Judul</th>
                                    <th className="px-4 py-3 font-medium">Penulis</th>
                                    <th className="px-4 py-3 font-medium">Tahun</th>
                                    <th className="px-4 py-3 font-medium text-center">Views</th>
                                    <th className="px-4 py-3 font-medium text-center">Likes</th>
                                    <th className="px-4 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {result.data.map((pub) => (
                                    <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {(pub.link || pub.filePath) ? (
                                                <PublicationLink id={pub.id} url={pub.link || pub.filePath || '#'} className="font-medium text-gray-900 hover:text-[#0F4C81] line-clamp-1">
                                                    {pub.title}
                                                </PublicationLink>
                                            ) : (
                                                <span className="font-medium text-gray-900 line-clamp-1">{pub.title}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{pub.authorName}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{formatPublishDate(pub.publishYear, pub.publishMonth, pub.publishDay)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm text-gray-500 flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{pub.viewCount}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <LikeButton publicationId={pub.id} userId={session.user.identifier} initialLiked={userLikedIds.includes(pub.id)} initialLikeCount={likeCounts[pub.id] || 0} />
                                        </td>
                                        <td className="px-4 py-4">
                                            {(pub.link || pub.filePath) && (
                                                <PublicationLink id={pub.id} url={pub.link || pub.filePath || '#'} className="inline-flex items-center gap-1 text-[#0F4C81] hover:text-blue-700 text-sm">
                                                    <ExternalLink className="w-3 h-3" />Lihat
                                                </PublicationLink>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.data.map((pub) => {
                        let pubKeywords: string[] = [];
                        if (pub.keywords) { try { pubKeywords = JSON.parse(pub.keywords); } catch { } }
                        return (
                            <div key={pub.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                {(pub.link || pub.filePath) ? (
                                    <PublicationLink id={pub.id} url={pub.link || pub.filePath || '#'} className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#0F4C81] cursor-pointer block">
                                        {pub.title}
                                    </PublicationLink>
                                ) : (
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{pub.title}</h3>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <User className="w-4 h-4" /><span>{pub.authorName}</span>
                                </div>
                                {pub.abstract && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pub.abstract}</p>}
                                {pubKeywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {pubKeywords.slice(0, 3).map((kw) => (
                                            <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{kw}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{formatPublishDate(pub.publishYear, pub.publishMonth, pub.publishDay)}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{pub.viewCount}</span>
                                        <LikeButton publicationId={pub.id} userId={session.user.identifier} initialLiked={userLikedIds.includes(pub.id)} initialLikeCount={likeCounts[pub.id] || 0} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {currentPage > 1 ? (
                        <Link href={buildUrl('/student/publications', { ...baseFilterParams, page: String(currentPage - 1) })} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">← Sebelumnya</Link>
                    ) : (
                        <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400 cursor-not-allowed">← Sebelumnya</span>
                    )}
                    {Array.from({ length: Math.min(result.totalPages, 7) }, (_, i) => {
                        let pageNum: number;
                        if (result.totalPages <= 7) pageNum = i + 1;
                        else if (currentPage <= 4) pageNum = i + 1;
                        else if (currentPage >= result.totalPages - 3) pageNum = result.totalPages - 6 + i;
                        else pageNum = currentPage - 3 + i;
                        return (
                            <Link key={pageNum} href={buildUrl('/student/publications', { ...baseFilterParams, page: String(pageNum) })}
                                className={`px-3 py-2 rounded-lg text-sm ${pageNum === currentPage ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                {pageNum}
                            </Link>
                        );
                    })}
                    {currentPage < result.totalPages ? (
                        <Link href={buildUrl('/student/publications', { ...baseFilterParams, page: String(currentPage + 1) })} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Selanjutnya →</Link>
                    ) : (
                        <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400 cursor-not-allowed">Selanjutnya →</span>
                    )}
                </div>
            )}
        </div>
    );
}
