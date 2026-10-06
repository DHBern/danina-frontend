import { getChapter, getChapterIndex } from '#lib/server/tei.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = async () =>
	(await getChapterIndex()).chapters.map(({ slug }) => ({ chapter: slug }));

export const GET: RequestHandler = async ({ params }) =>
	Response.json(await getChapter(params.chapter));
