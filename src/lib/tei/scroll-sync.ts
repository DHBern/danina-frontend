const ANCHORS = '[id], [corresp]';
const SECTIONS = '[data-slug]';

interface Match {
	counterpart: HTMLElement;
	ratio: number;
	gap: number;
}

// First element visible at the pane's top edge that has a counterpart in the other pane.
function findMatch(
	pane: HTMLElement,
	selector: string,
	counterpartOf: (element: HTMLElement) => HTMLElement | null
): Match | undefined {
	const top = pane.getBoundingClientRect().top;
	for (const element of pane.querySelectorAll<HTMLElement>(selector)) {
		const rect = element.getBoundingClientRect();
		if (rect.height === 0 || rect.bottom <= top) continue;
		const counterpart = counterpartOf(element);
		if (counterpart) {
			return {
				counterpart,
				ratio: Math.max(0, (top - rect.top) / rect.height),
				gap: Math.max(0, rect.top - top)
			};
		}
	}
}

function findCounterpart(element: HTMLElement, other: HTMLElement): HTMLElement | null {
	const id = element.getAttribute('id');
	if (id) {
		const match = other.querySelector<HTMLElement>(`[corresp~="#${CSS.escape(id)}"]`);
		if (match) return match;
	}
	const ref = element
		.getAttribute('corresp')
		?.split(/\s+/)
		.find((token) => token.startsWith('#'));
	return ref ? other.querySelector<HTMLElement>(`#${CSS.escape(ref.slice(1))}`) : null;
}

function align(source: HTMLElement, target: HTMLElement) {
	const match =
		findMatch(source, ANCHORS, (element) => findCounterpart(element, target)) ??
		findMatch(source, SECTIONS, (element) =>
			target.querySelector<HTMLElement>(`[data-slug="${CSS.escape(element.dataset.slug ?? '')}"]`)
		);
	if (!match) return;

	const rect = match.counterpart.getBoundingClientRect();
	target.scrollTop +=
		rect.top + match.ratio * rect.height - match.gap - target.getBoundingClientRect().top;
}

// The pane the user last interacted with drives the other; scroll events of the follower are ignored.
export function createScrollSync(a: HTMLElement, b: HTMLElement): () => void {
	let driver: HTMLElement | undefined;
	let frame = 0;
	const controller = new AbortController();
	const { signal } = controller;

	for (const pane of [a, b]) {
		const other = pane === a ? b : a;
		const claim = () => (driver = pane);
		for (const type of ['pointerenter', 'wheel', 'touchstart', 'focusin', 'keydown'] as const) {
			pane.addEventListener(type, claim, { passive: true, signal });
		}
		pane.addEventListener(
			'scroll',
			() => {
				if (driver !== pane) return;
				cancelAnimationFrame(frame);
				frame = requestAnimationFrame(() => align(pane, other));
			},
			{ passive: true, signal }
		);
	}

	return () => {
		controller.abort();
		cancelAnimationFrame(frame);
	};
}
