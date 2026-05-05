'use client';

import { useEffect } from 'react';
import { refreshUserSession } from '@/features/auth/actions';

export default function SessionRefresher() {
    useEffect(() => {
        refreshUserSession();
    }, []);

    return null;
}
