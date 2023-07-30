import { SBB_AUTH_SECRET, SBB_GOOGLE_CLIENT_ID, SBB_GOOGLE_SECRET } from '$env/static/private';
import Google from '@auth/core/providers/google';
import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handleAuthorization: Handle = async function ({ event, resolve }) {
	console.group('Routing');
	const session = await event.locals.getSession();
	console.debug('path:', event.url.pathname);
	if (event.url.pathname.startsWith('/game')) {
		console.debug('trying to access restricted page');
		if (!session) {
			console.debug('not logged in, redirect to auth page');
			console.groupEnd();
			throw redirect(303, '/auth');
		}
	}

	// If the request is still here, just proceed as normally
	console.groupEnd();
	return resolve(event);
};

// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(
	SvelteKitAuth({
		// @ts-ignore
		adapter: PrismaAdapter(prisma),
		providers: [
			Google({
				clientId: SBB_GOOGLE_CLIENT_ID,
				clientSecret: SBB_GOOGLE_SECRET,
			}),
		],
		secret: SBB_AUTH_SECRET,
		trustHost: true,
	}),
	handleAuthorization
) satisfies Handle;