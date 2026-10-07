<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { createScrollSync } from '#lib/tei/scroll-sync.ts';
	import type { ChapterData, ChapterIndex } from '#lib/tei/types.ts';
	import NavPanel from './NavPanel.svelte';
	import TextPane from './TextPane.svelte';
	import '#lib/styles/tei.css';

	interface Props {
		initial: ChapterData;
		index: ChapterIndex;
	}

	let { initial, index }: Props = $props();

	let chapters = $derived([initial]);
	let activeSlug = $derived(initial.slug);
	let ruEl = $state<HTMLElement>();
	let deEl = $state<HTMLElement>();
	let drawerOpen = $state(true);

	let loadingPrev = false;
	let loadingNext = false;
	let frame = 0;

	$effect(() => {
		if (ruEl && deEl) return createScrollSync(ruEl, deEl);
	});

	async function fetchChapter(slug: string): Promise<ChapterData> {
		const res = await fetch(resolve('/texte/data/[chapter].json', { chapter: slug }));
		if (!res.ok) throw new Error(`Failed to load chapter ${slug}: ${res.status}`);
		return res.json();
	}

	async function loadNext() {
		const next = chapters.at(-1)?.next;
		if (!next || loadingNext) return;
		loadingNext = true;
		try {
			const chapter = await fetchChapter(next);
			chapters = [...chapters, chapter];
		} finally {
			loadingNext = false;
		}
	}

	async function loadPrev() {
		const prev = chapters[0]?.prev;
		if (!prev || loadingPrev) return;
		loadingPrev = true;
		try {
			const chapter = await fetchChapter(prev);
			const panes = [ruEl, deEl].filter((pane) => pane !== undefined);
			const heights = panes.map((pane) => pane.scrollHeight);
			chapters = [chapter, ...chapters];
			await tick();
			// Keep the visible text in place; overflow-anchor is not supported everywhere (Safari).
			panes.forEach((pane, i) => (pane.scrollTop += pane.scrollHeight - heights[i]));
		} finally {
			loadingPrev = false;
		}
	}

	function updateActive() {
		if (!ruEl) return;
		const probe = ruEl.getBoundingClientRect().top + ruEl.clientHeight / 3;
		for (const section of ruEl.querySelectorAll<HTMLElement>('[data-slug]')) {
			const rect = section.getBoundingClientRect();
			if (rect.top > probe || rect.bottom <= probe) continue;
			const slug = section.dataset.slug;
			if (slug && slug !== activeSlug) {
				activeSlug = slug;
				goto(resolve(`texte/${slug}/`), { shallow: true, replace: true });
			}
			return;
		}
	}

	function onscroll() {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(updateActive);
	}

	function select(slug: string, event: MouseEvent) {
		if (!chapters.some((chapter) => chapter.slug === slug)) return;
		event.preventDefault();
		for (const pane of [ruEl, deEl]) {
			const section = pane?.querySelector(`[data-slug="${CSS.escape(slug)}"]`);
			if (pane && section) {
				pane.scrollTop += section.getBoundingClientRect().top - pane.getBoundingClientRect().top;
			}
		}
	}
</script>

<div class="drawer h-[calc(100dvh-4rem)] grid-rows-[minmax(0,1fr)] lg:drawer-open">
	<input
		id="text-navigation-drawer"
		type="checkbox"
		class="drawer-toggle"
		bind:checked={drawerOpen}
	/>
	<div
		class="drawer-content grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 p-4 lg:grid-cols-2 lg:grid-rows-1 lg:gap-6"
	>
		<TextPane
			title="Transkription"
			lang="ru"
			{chapters}
			bind:scrollEl={ruEl}
			textClass="mb-12 text-[18px] leading-[22px]"
			{onscroll}
			onreachstart={loadPrev}
			onreachend={loadNext}
		/>
		<TextPane
			title="Übersetzung"
			lang="de"
			{chapters}
			bind:scrollEl={deEl}
			textClass="mb-12 text-xl"
		/>
	</div>
	<NavPanel toc={index.toc} {activeSlug} onselect={select} drawerId="text-navigation-drawer" />
</div>
