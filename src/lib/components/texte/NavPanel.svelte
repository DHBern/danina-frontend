<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Eye from '@lucide/svelte/icons/eye';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import type { ClassValue } from 'svelte/elements';
	import type { TocNode } from '#lib/tei/types.ts';
	import TocTree from './TocTree.svelte';

	interface Props {
		toc: TocNode[];
		activeSlug?: string;
		onselect?: (slug: string, event: MouseEvent) => void;
		class?: ClassValue;
	}

	let { toc, activeSlug, onselect, class: className }: Props = $props();

	let open = $state(false);
</script>

<nav
	aria-label="Textnavigation"
	class={['flex min-h-0 flex-col gap-2.5 bg-neutral px-3 py-4', className]}
>
	<div class="flex items-center gap-2.5">
		<h2 class="flex-1 text-xl text-neutral-content">Navigation</h2>
		<button
			type="button"
			class="btn btn-square border-base-300 bg-base-100"
			disabled
			title="Faksimile (in Vorbereitung)"
			aria-label="Faksimile anzeigen"
		>
			<ScrollText />
		</button>
		<button
			type="button"
			class="btn btn-square border-base-300 bg-base-100"
			disabled
			title="Ansicht (in Vorbereitung)"
			aria-label="Ansicht wechseln"
		>
			<Eye />
		</button>
		<button
			type="button"
			class="btn btn-square border-base-300 bg-base-100 lg:hidden"
			aria-expanded={open}
			aria-controls="text-navigation-tree"
			aria-label="Navigation ein-/ausblenden"
			onclick={() => (open = !open)}
		>
			<ChevronDown class={['transition-transform', open && 'rotate-180']} />
		</button>
	</div>
	<div
		id="text-navigation-tree"
		class={['min-h-0 flex-1 overflow-y-auto rounded bg-base-100 py-6', !open && 'max-lg:hidden']}
	>
		<ul class="menu w-full font-sans text-sm">
			<TocTree nodes={toc} {activeSlug} {onselect} />
		</ul>
	</div>
</nav>
