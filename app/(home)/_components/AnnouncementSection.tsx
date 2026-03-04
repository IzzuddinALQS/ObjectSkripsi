'use client';

interface AnnouncementSectionProps {
    maintenanceRooms: any[];
    maintenanceItems: any[];
}

export default function AnnouncementSection({ maintenanceRooms, maintenanceItems }: AnnouncementSectionProps) {
    const hasAnnouncements = maintenanceRooms.length > 0 || maintenanceItems.length > 0;

    return (
        <div className="bg-white p-4 sm:p-6 h-auto max-h-[15.625rem] overflow-y-auto rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#0F4C81] rounded-full"></span>
                Pengumuman
            </h3>

            {!hasAnnouncements ? (
                <div className="flex items-center justify-center min-h-[8rem] text-gray-400 italic">
                    Tidak ada pengumuman
                </div>
            ) : (
                <div className="space-y-3">
                    {maintenanceRooms.map((room) => (
                        <div key={`room-${room.id}`} className="bg-orange-50 p-3 rounded-md border border-orange-100">
                            <p className="font-semibold text-orange-800">Ruangan Maintenance</p>
                            <p className="text-sm text-gray-600">
                                Ruangan <span className="font-medium">{room.name}</span> ({room.location}) sedang dalam pemeliharaan.
                            </p>
                        </div>
                    ))}

                    {maintenanceItems.map((item) => (
                        <div key={`item-${item.id}`} className="bg-orange-50 p-3 rounded-md border border-orange-100">
                            <p className="font-semibold text-orange-800">Alat Maintenance</p>
                            <p className="text-sm text-gray-600">
                                Alat <span className="font-medium">{item.name}</span> di {item.room.name} sedang dalam pemeliharaan.
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

