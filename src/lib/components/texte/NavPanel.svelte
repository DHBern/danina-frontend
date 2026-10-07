<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import type { ClassValue } from 'svelte/elements';
	import type { TocNode } from '#lib/tei/types.ts';
	import TocTree from './TocTree.svelte';

	interface Props {
		toc: TocNode[];
		activeSlug?: string;
		onselect?: (slug: string, event: MouseEvent) => void;
		drawerId: string;
		class?: ClassValue;
	}

	let { toc, activeSlug, onselect, drawerId, class: className }: Props = $props();
</script>

<div class="drawer-side min-h-0 is-drawer-close:overflow-visible lg:h-full">
	<label for={drawerId} aria-label="Navigation schließen" class="drawer-overlay"></label>
	<nav
		aria-label="Textnavigation"
		class={[
			'flex h-full min-h-0 flex-col gap-2.5 bg-neutral px-3 py-4 transition-[width] is-drawer-close:w-16 is-drawer-open:w-[345px]',
			className
		]}
	>
		<div class="flex items-center gap-2.5 is-drawer-close:flex-col">
			<h2 class="flex-1 text-xl text-neutral-content is-drawer-close:hidden">Navigation</h2>
			<button
				type="button"
				class="btn btn-square border-base-300 bg-base-100 is-drawer-close:hidden"
				disabled
				title="Faksimile (in Vorbereitung)"
				aria-label="Faksimile anzeigen"
			>
				<ScrollText />
			</button>
			<button
				type="button"
				class="btn btn-square border-base-300 bg-base-100 is-drawer-close:hidden"
				disabled
				title="Ansicht (in Vorbereitung)"
				aria-label="Ansicht wechseln"
			>
				<Eye />
			</button>
			<div
				class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
				data-tip="Navigation öffnen"
			>
				<label
					for={drawerId}
					class="btn btn-square border-base-300 bg-base-100 drawer-button"
					aria-label="Navigation ein-/ausblenden"
				>
					<PanelLeftClose class="transition-transform is-drawer-open:rotate-y-180" />
				</label>
			</div>
		</div>
		<div class="min-h-0 flex-1 overflow-y-auto rounded bg-base-100 py-6 is-drawer-close:hidden">
			<ul class="menu w-full font-sans text-sm">
				<TocTree nodes={toc} {activeSlug} {onselect} />
			</ul>
		</div>
	</nav>
</div>
