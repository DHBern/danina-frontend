<script lang="ts">
	import TocTree from '#lib/components/texte/TocTree.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Texte – Edition Danina</title>
</svelte:head>

<div class="mx-auto max-w-xl p-4">
	<nav aria-label="Textnavigation" class="flex flex-col gap-2.5 bg-neutral px-3 py-4">
		<h1 class="text-xl text-neutral-content">Texte</h1>
		<div class="rounded bg-base-100 py-6">
			<ul class="menu w-full font-sans text-sm">
				<TocTree nodes={data.index.toc} />
			</ul>
		</div>
	</nav>
</div>
