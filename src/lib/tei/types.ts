export type Lang = 'ru' | 'de';

export interface TocNode {
	label: string;
	slug?: string;
	children?: TocNode[];
}

export interface ChapterMeta {
	slug: string;
	label: string;
}

export interface ChapterIndex {
	chapters: ChapterMeta[];
	toc: TocNode[];
}

export interface ChapterData {
	slug: string;
	ru: string;
	de: string;
	prev: string | null;
	next: string | null;
}
