'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogIn } from 'lucide-react';
import AttendanceButton from '@/features/attendance/components/AttendanceButton';

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                        <Image
                            src="/fst-icon.png"
                            alt="Logo Lab Informatika"
                            width={48}
                            height={48}
                            className="object-contain w-full h-full"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="font-bold text-lg sm:text-xl text-[#0F4C81] leading-tight tracking-tight">
                            Laboratorium Industri
                        </h1>
                        <span className="hidden sm:block text-xs font-medium text-[#6B7280] tracking-wider">
                            UNIVERSITAS AL AZHAR INDONESIA
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <AttendanceButton />

                    <Link
                        href="/login"
                        className="flex items-center gap-2 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white px-3 py-2 sm:px-4 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="hidden sm:inline">Login</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
