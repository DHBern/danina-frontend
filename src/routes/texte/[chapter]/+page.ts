import { error } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ChapterData, ChapterIndex } from '#lib/tei/types.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [chapterRes, indexRes] = await Promise.all([
		fetch(resolve('/texte/data/[chapter].json', { chapter: params.chapter })),
		fetch(resolve('/texte/data/index.json'))
	]);
	if (!chapterRes.ok) error(chapterRes.status, `Unknown chapter: ${params.chapter}`);
	return {
		chapter: (await chapterRes.json()) as ChapterData,
		index: (await indexRes.json()) as ChapterIndex
	};
};
