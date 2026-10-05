<script lang="ts">
	import TextReader from '#lib/components/texte/TextReader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.chapter.slug} – Edition Danina</title>
</svelte:head>

{#key data.chapter.slug}
	<TextReader initial={data.chapter} index={data.index} />
{/key}
