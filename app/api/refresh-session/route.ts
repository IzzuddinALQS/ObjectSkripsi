import { NextRequest, NextResponse } from 'next/server';
import { getSession, encrypt } from '@/lib/auth';
import { db } from '@/db';
import { users, roles, permissions, rolePermissions, userPermissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getEffectivePermissions(
    userId: string,
    roleId: number
): Promise<string[]> {
    const rolePerms = await db
        .select({ code: permissions.code })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId));

    const defaultCodes = new Set(rolePerms.map((rp) => rp.code));

    const userOverrides = await db
        .select({ code: permissions.code, granted: userPermissions.granted })
        .from(userPermissions)
        .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
        .where(eq(userPermissions.userId, userId));

    for (const override of userOverrides) {
        if (override.granted) {
            defaultCodes.add(override.code);
        } else {
            defaultCodes.delete(override.code);
        }
    }

    return Array.from(defaultCodes);
}

export async function GET(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';

    // Fetch fresh user data from DB
    const userRows = await db
        .select()
        .from(users)
        .where(eq(users.identifier, session.user.identifier))
        .limit(1);

    if (!userRows[0]) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const foundUser = userRows[0];

    const roleRows = await db
        .select()
        .from(roles)
        .where(eq(roles.id, foundUser.roleId))
        .limit(1);

    const roleName = roleRows[0]?.name;

    const effectivePermissions = await getEffectivePermissions(
        foundUser.identifier,
        foundUser.roleId
    );

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newSession = await encrypt({
        user: { ...foundUser, role: roleName, permissions: effectivePermissions },
        expires,
    });

    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.set('session', newSession, { expires, httpOnly: true });
    return response;
}
