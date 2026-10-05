<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import type { ChapterData, Lang } from '#lib/tei/types.ts';

	interface Props {
		title: string;
		lang: Lang;
		chapters: ChapterData[];
		scrollEl?: HTMLElement;
		textClass?: ClassValue;
		onscroll?: () => void;
		onreachstart?: () => void;
		onreachend?: () => void;
	}

	let {
		title,
		lang,
		chapters,
		scrollEl = $bindable(),
		textClass,
		onscroll,
		onreachstart,
		onreachend
	}: Props = $props();

	let first = $derived(chapters[0]);
	let last = $derived(chapters.at(-1));

	function sentinel(callback: () => void): Attachment<HTMLElement> {
		return (node) => {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) callback();
				},
				{ root: node.parentElement, rootMargin: '800px 0px' }
			);
			observer.observe(node);
			return () => observer.disconnect();
		};
	}
</script>

<div class="flex min-h-0 flex-col gap-2 bg-neutral p-3">
	<h2 class="text-xl text-neutral-content">{title}</h2>
	<div
		bind:this={scrollEl}
		role="region"
		aria-label={title}
		{lang}
		{onscroll}
		class="tei min-h-0 flex-1 overflow-y-auto border border-base-300 bg-base-100 px-4 py-3"
	>
		{#if onreachstart && first?.prev}
			<!-- Remount on change so the observer re-checks an already visible sentinel. -->
			{#key first.slug}
				<div {@attach sentinel(onreachstart)}></div>
			{/key}
		{/if}
		{#each chapters as chapter (chapter.slug)}
			<article data-slug={chapter.slug} class={textClass}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted build-time output of the project's TEI data -->
				{@html chapter[lang]}
			</article>
		{/each}
		{#if onreachend && last?.next}
			{#key last.slug}
				<div {@attach sentinel(onreachend)}></div>
			{/key}
		{/if}
	</div>
</div>
