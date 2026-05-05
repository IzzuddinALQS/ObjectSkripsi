'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ViewportPortalProps {
    children: React.ReactNode;
}

export default function ViewportPortal({ children }: ViewportPortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(children, document.body);
}
