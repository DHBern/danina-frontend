import { resolve } from '$app/paths';
import type { ChapterIndex } from '#lib/tei/types.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(resolve('/texte/data/index.json'));
	return { index: (await res.json()) as ChapterIndex };
};
