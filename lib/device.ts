import { headers } from 'next/headers';

/**
 * Detect if the request is from a mobile device using User-Agent header.
 * Returns true if mobile, false if desktop/tablet.
 */
export async function isMobileRequest(): Promise<boolean> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

/**
 * Get the default view mode based on device type.
 * Desktop => 'list', Mobile => 'grid'
 */
export async function getDefaultViewMode(): Promise<'list' | 'grid'> {
    const mobile = await isMobileRequest();
    return mobile ? 'grid' : 'list';
}
