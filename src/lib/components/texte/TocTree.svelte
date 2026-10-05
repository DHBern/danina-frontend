<script lang="ts">
	import { resolve } from '$app/paths';
	import { tocContains } from '#lib/tei/toc.ts';
	import type { TocNode } from '#lib/tei/types.ts';
	import TocTree from './TocTree.svelte';

	interface Props {
		nodes: TocNode[];
		activeSlug?: string;
		onselect?: (slug: string, event: MouseEvent) => void;
		level?: number;
	}

	let { nodes, activeSlug, onselect, level = 1 }: Props = $props();
</script>

{#each nodes as node (node.slug ?? node.label)}
	<li>
		{#if node.children?.length}
			<details open={activeSlug ? tocContains(node, activeSlug) : false}>
				<summary class={[level === 1 && 'text-base font-medium']}>{node.label}</summary>
				<ul>
					<TocTree nodes={node.children} {activeSlug} {onselect} level={level + 1} />
				</ul>
			</details>
		{:else if node.slug}
			{@const slug = node.slug}
			<a
				href={resolve(`texte/${slug}/`)}
				aria-current={slug === activeSlug ? 'page' : undefined}
				class={[level === 1 && 'text-base font-medium', slug === activeSlug && 'font-semibold']}
				onclick={(event) => onselect?.(slug, event)}
			>
				{node.label}
			</a>
		{/if}
	</li>
{/each}
