declare module 'CETEIcean' {
	interface CETEIOptions {
		documentObject?: Document;
		base?: string;
		omitDefaultBehaviors?: boolean;
		ignoreFragmentId?: boolean;
		debug?: boolean;
	}

	export default class CETEI {
		constructor(options?: CETEIOptions);
		domToHTML5(xml: Document): DocumentFragment;
		makeHTML5(xml: string): DocumentFragment;
		addBehaviors(behaviors: Record<string, unknown>): void;
	}
}
