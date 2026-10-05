import type { ChapterMeta, TocNode } from './types.ts';

// Hand-maintained table of contents; leaf order defines the reading order.
export const toc: TocNode[] = [
	{
		label: 'div-3',
		children: [
			{ label: 'div-3_001', slug: 'div-3_001' },
			{ label: 'div-3_002', slug: 'div-3_002' },
			{ label: 'div-3_003', slug: 'div-3_003' },
			{ label: 'div-3_004', slug: 'div-3_004' },
			{ label: 'div-3_005', slug: 'div-3_005' }
		]
	},
	{ label: 'div-4', slug: 'div-4_001' },
	{ label: 'div-5', slug: 'div-5_001' },
	{ label: 'div-6', slug: 'div-6_001' },
	{ label: 'div-7', slug: 'div-7_001' },
	{ label: 'div-8', slug: 'div-8_001' },
	{ label: 'div-9', slug: 'div-9_001' },
	{ label: 'div-10', slug: 'div-10_001' },
	{
		label: 'div-11',
		children: [
			{ label: 'div-11_001', slug: 'div-11_001' },
			{ label: 'div-11_002', slug: 'div-11_002' },
			{ label: 'div-11_003', slug: 'div-11_003' }
		]
	},
	{
		label: 'div-12',
		children: [
			{ label: 'div-12_001', slug: 'div-12_001' },
			{ label: 'div-12_002', slug: 'div-12_002' },
			{ label: 'div-12_003', slug: 'div-12_003' }
		]
	},
	{
		label: 'div-13',
		children: Array.from({ length: 12 }, (_, i) => {
			const slug = `div-13_${String(i + 1).padStart(3, '0')}`;
			return { label: slug, slug };
		})
	}
];

export function flattenToc(nodes: TocNode[]): ChapterMeta[] {
	return nodes.flatMap((node) => [
		...(node.slug ? [{ slug: node.slug, label: node.label }] : []),
		...flattenToc(node.children ?? [])
	]);
}

export function tocContains(node: TocNode, slug: string): boolean {
	return node.slug === slug || (node.children ?? []).some((child) => tocContains(child, slug));
}
