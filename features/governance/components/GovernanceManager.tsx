'use client';

import { useState } from 'react';
import { FileText, Users, FileCheck, Image as ImageIcon } from 'lucide-react';
import DocumentList from './DocumentList';
import { deleteGovernanceDoc } from '@/features/governance/actions';
import GovernanceUploadForm from './GovernanceUploadForm';
import UserList from './UserList';
import UserForm from './UserForm';
import BulkEnrollment from './BulkEnrollment';
import DataExport from './DataExport';
import HeroPhotoManager from '@/app/admin/hero-photos/_components/HeroPhotoManager';

interface HeroPhoto {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string;
    link: string | null;
    focalX: number;
    focalY: number;
}

interface GovernanceManagerProps {
    sops: any[];
    lpjs: any[];
    users: any[];
    roles: any[];
    lecturers: { identifier: string; fullName: string }[];
    heroPhotos: HeroPhoto[];
    adminId: string;
    allPermissions?: any[];
    rolePermissionMap?: Record<number, string[]>;
}

export default function GovernanceManager({ sops, lpjs, users, roles, lecturers, heroPhotos, adminId, allPermissions, rolePermissionMap }: GovernanceManagerProps) {
    const [activeTab, setActiveTab] = useState<'sop' | 'lpj' | 'users' | 'hero'>('sop');


    const [showUserForm, setShowUserForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any>(null);

    const handleEdit = (doc: any) => {
        setEditingDoc(doc);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingDoc(null);
    };

    return (
        <div className="min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tata Kelola</h1>
                    <p className="text-gray-500 text-sm mt-1">Manajemen SOP, LPJ, Foto Hero, dan Pengguna Sistem</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-full max-w-full overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => { setActiveTab('sop'); setEditingDoc(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'sop'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <FileCheck className="w-4 h-4" />
                    Dokumen SOP
                </button>
                <button
                    onClick={() => { setActiveTab('lpj'); setEditingDoc(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'lpj'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    LPJ Bulanan
                </button>
                <button
                    onClick={() => { setActiveTab('users'); setEditingDoc(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'users'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Manajemen User
                </button>
                <button
                    onClick={() => { setActiveTab('hero'); setEditingDoc(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'hero'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Hero Section
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'sop' && (
                    <>
                        <GovernanceUploadForm
                            adminId={adminId}
                            allowedTypes={['SOP']}
                            initialData={editingDoc?.type === 'SOP' ? editingDoc : null}
                            onCancel={handleCancelEdit}
                        />
                        <DocumentList
                            documents={sops}
                            onEdit={handleEdit}
                            onDelete={deleteGovernanceDoc}
                        />
                    </>
                )}

                {activeTab === 'lpj' && (
                    <>
                        <GovernanceUploadForm
                            adminId={adminId}
                            allowedTypes={['LPJ Bulanan']}
                            initialData={editingDoc?.type === 'LPJ Bulanan' ? editingDoc : null}
                            onCancel={handleCancelEdit}
                        />
                        <DocumentList
                            documents={lpjs}
                            onEdit={handleEdit}
                            onDelete={deleteGovernanceDoc}
                        />
                        <DataExport />
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        {!showUserForm ? (
                            <>
                                <div className="mb-6 flex justify-end">
                                    <button
                                        onClick={() => setShowUserForm(true)}
                                        className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors flex items-center gap-2"
                                    >
                                        <Users className="w-4 h-4" />
                                        Tambah User Baru
                                    </button>
                                </div>
                                <BulkEnrollment />
                                <UserList users={users} roles={roles} lecturers={lecturers} allPermissions={allPermissions} rolePermissionMap={rolePermissionMap} />
                            </>
                        ) : (
                            <UserForm
                                roles={roles}
                                lecturers={lecturers}
                                onSuccess={() => setShowUserForm(false)}
                                onCancel={() => setShowUserForm(false)}
                            />
                        )}
                    </>
                )}

                {activeTab === 'hero' && (
                    <HeroPhotoManager initialPhotos={heroPhotos} />
                )}
            </div>
        </div>
    );
}
