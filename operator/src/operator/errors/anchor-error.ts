export class AnchorError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class VirtualBlockchainLoadingError extends AnchorError {
	constructor(ledgerId: string) {
		super(`Virtual blockchain id ${ledgerId} specified but cannot load.`)
	}
}