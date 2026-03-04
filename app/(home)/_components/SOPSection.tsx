import { FileText } from 'lucide-react';
import Link from 'next/link';

interface SOP {
    id: number;
    title: string;
    filePath: string;
    coverPath?: string | null;
    createdAt: Date | null;
}

interface SOPSectionProps {
    sops: SOP[];
}

export default function SOPSection({ sops }: SOPSectionProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-auto max-h-[24rem] sm:max-h-[37.5rem] overflow-y-auto border border-gray-100 custom-scrollbar">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    SOP Terbaru
                </h3>
            </div>

            {sops.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                    Belum ada SOP yang tersedia
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {sops.map((sop) => (
                        <Link
                            key={sop.id}
                            href={sop.filePath}
                            target="_blank"
                            className="group flex flex-col items-center p-2 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-100"
                        >
                            {sop.coverPath ? (
                                <div className="w-full aspect-[3/4] mb-2 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                    <img
                                        src={sop.coverPath}
                                        alt={sop.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-[3/4] bg-red-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <FileText className="w-8 h-8 text-red-500" />
                                </div>
                            )}
                            <span className="text-[10px] text-center font-medium text-gray-700 group-hover:text-blue-700 line-clamp-2 leading-tight">
                                {sop.title}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
