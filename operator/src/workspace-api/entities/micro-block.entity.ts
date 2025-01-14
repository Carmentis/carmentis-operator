class MicroBlock {
	hash: string;
	header: {
		magicString: string;
		version: number;
		height: number;
		previousHash: string;
		timestamp: number;
		gas: number;
		gasPrice: number;
	};

	constructor(
		hash: string,
		header: {
			magicString: string;
			version: number;
			height: number;
			previousHash: string;
			timestamp: number;
			gas: number;
			gasPrice: number;
		},
	) {
		this.hash = hash;
		this.header = header;
	}
}