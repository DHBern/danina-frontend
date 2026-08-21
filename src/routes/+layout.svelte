<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import Menu from '@lucide/svelte/icons/menu';
	import Wind from '@lucide/svelte/icons/wind';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	let classesActive = $derived((href: string) =>
		href.split('/')[1] === page.url.pathname.split('/')[1] || href.split('/')[1] === page.url.hash
			? 'bg-accent text-accent-content'
			: ''
	);

	const menuItems: { label: string; href: '/texte' | '/index' | '/about' }[] = [
		{ label: 'Texte', href: '/texte' },
		{ label: 'Index', href: '/index' },
		{ label: 'Über das Projekt', href: '/about' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<Menu />
			</div>
			<ul
				tabindex="-1"
				class="menu dropdown-content z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
			>
				{#each menuItems as item}
					<li>
						<a href={resolve(item.href)} class={['', classesActive(item.href)]}>{item.label}</a>
					</li>
				{/each}
			</ul>
		</div>
		<a class="btn btn-ghost text-xl" href={resolve('/')}>
			<div class="self-end">
				<Wind />
			</div>
			<span class="self-baseline font-sans">Edition</span>
			<span class="self-baseline italic">Danina</span>
		</a>
		<ul class="menu menu-horizontal px-1">
			{#each menuItems as item}
				<li>
					<a href={resolve(item.href)} class={['', classesActive(item.href)]}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

{@render children()}
