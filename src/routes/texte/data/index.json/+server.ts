import { getChapterIndex } from '#lib/server/tei.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => Response.json(await getChapterIndex());
