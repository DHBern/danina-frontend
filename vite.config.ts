import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			adapter: adapter(),
			prerender: {
				// '/index' can be treated specially by crawlers due to index URL normalization,
				// so include it explicitly as an entry to guarantee generation.
				entries: ['*', '/index', '/index/']
			},
			experimental: { remoteFunctions: true }
		})
	]
});
