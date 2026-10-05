import { error } from '@sveltejs/kit';
import CETEI from 'CETEIcean';
import { JSDOM } from 'jsdom';
import { flattenToc, toc } from '#lib/tei/toc.ts';
import type { ChapterData, ChapterIndex, Lang, TocNode } from '#lib/tei/types.ts';

const REPO = 'DHBern/danina-data';
const REF = 'main';
const DIR = 'LEAF-tests';
// Elements without xml:lang are treated as source-language text.
const DEFAULT_LANG: Lang = 'ru';
const UNASSIGNED_LABEL = 'Nicht zugeordnet';

interface GithubEntry {
	name: string;
	type: string;
	download_url: string | null;
}

interface Source {
	index: ChapterIndex;
	urls: Map<string, string>;
}

let sourcePromise: Promise<Source> | undefined;
const chapterCache = new Map<string, Promise<ChapterData>>();

function loadSource(): Promise<Source> {
	sourcePromise ??= (async () => {
		const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${REF}`, {
			headers: { Accept: 'application/vnd.github+json' }
		});
		if (!res.ok) {
			throw new Error(`Listing ${REPO}/${DIR} failed: ${res.status} ${res.statusText}`);
		}
		const entries = (await res.json()) as GithubEntry[];
		const urls = new Map<string, string>();
		for (const entry of entries) {
			if (entry.type === 'file' && entry.name.endsWith('.xml') && entry.download_url) {
				urls.set(entry.name.slice(0, -'.xml'.length), entry.download_url);
			}
		}

		const listed = flattenToc(toc);
		const missing = listed.filter((chapter) => !urls.has(chapter.slug));
		if (missing.length > 0) {
			throw new Error(
				`TOC references files missing in ${REPO}/${DIR}: ${missing.map((c) => c.slug).join(', ')}`
			);
		}

		const listedSlugs = new Set(listed.map((chapter) => chapter.slug));
		const unassigned = [...urls.keys()]
			.filter((slug) => !listedSlugs.has(slug))
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
		if (unassigned.length > 0) {
			console.warn(
				`[tei] Files not in TOC, appended to "${UNASSIGNED_LABEL}": ${unassigned.join(', ')}`
			);
		}

		const fullToc: TocNode[] = unassigned.length
			? [
					...toc,
					{ label: UNASSIGNED_LABEL, children: unassigned.map((slug) => ({ label: slug, slug })) }
				]
			: toc;

		return { index: { chapters: flattenToc(fullToc), toc: fullToc }, urls };
	})();
	return sourcePromise;
}

export async function getChapterIndex(): Promise<ChapterIndex> {
	return (await loadSource()).index;
}

export async function getChapter(slug: string): Promise<ChapterData> {
	const { index, urls } = await loadSource();
	const url = urls.get(slug);
	const position = index.chapters.findIndex((chapter) => chapter.slug === slug);
	if (!url || position === -1) error(404, `Unknown chapter: ${slug}`);

	let chapter = chapterCache.get(slug);
	if (!chapter) {
		chapter = (async () => {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Fetching ${url} failed: ${res.status} ${res.statusText}`);
			const xml = await res.text();
			return {
				slug,
				ru: toHtml(xml, 'ru', slug),
				de: toHtml(xml, 'de', slug),
				prev: index.chapters[position - 1]?.slug ?? null,
				next: index.chapters[position + 1]?.slug ?? null
			};
		})();
		chapterCache.set(slug, chapter);
	}
	return chapter;
}

function toHtml(xml: string, lang: Lang, slug: string): string {
	const xmlDoc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
	// Default "title" behavior writes into an HTML <head>, so drop the header before conversion.
	xmlDoc.querySelector('teiHeader')?.remove();
	const body = xmlDoc.querySelector('text > body');
	if (body) keepLang(body, lang);

	const htmlDoc = new JSDOM('').window.document;
	const fragment = new CETEI({ documentObject: htmlDoc }).domToHTML5(xmlDoc);
	const text = fragment.querySelector('tei-text');
	if (!text) throw new Error(`No <text> element in chapter ${slug}`);
	prefixIds(text, slug);
	return text.outerHTML;
}

function hasLangDescendant(el: Element): boolean {
	return Array.from(el.getElementsByTagName('*')).some((child) => child.hasAttribute('xml:lang'));
}

function keepLang(parent: Element, lang: Lang) {
	for (const child of Array.from(parent.children)) {
		const own = child.getAttribute('xml:lang');
		if (own) {
			if (own !== lang) child.remove();
		} else if (hasLangDescendant(child)) {
			keepLang(child, lang);
		} else if (lang !== DEFAULT_LANG) {
			child.remove();
		}
	}
}

// Chapters share xml:ids (e.g. p0002-ru), so make them unique once several are on one page.
function prefixIds(root: Element, slug: string) {
	for (const el of [root, ...Array.from(root.querySelectorAll('[id], [corresp]'))]) {
		const id = el.getAttribute('id');
		if (id) el.setAttribute('id', `${slug}--${id}`);
		const corresp = el.getAttribute('corresp');
		if (corresp) {
			el.setAttribute(
				'corresp',
				corresp
					.split(/\s+/)
					.map((ref) => (ref.startsWith('#') ? `#${slug}--${ref.slice(1)}` : ref))
					.join(' ')
			);
		}
	}
}
