import { EncoderFactory, Hash, Microblock } from '@cmts-dev/carmentis-sdk-core';

export class MicroblockUtils {
	static encodeMicroblock(microblock: Microblock): string {
		const {microblockData} = microblock.serialize();
		const hexEncoder = EncoderFactory.bytesToHexEncoder();
		return hexEncoder.encode(microblockData);
	}

	static decodeMicroblock(encodedMicroblock: string): Microblock {
		const hexDecoder = EncoderFactory.bytesToHexEncoder();
		const microblockData = hexDecoder.decode(encodedMicroblock);
		return Microblock.loadFromSerializedMicroblock(microblockData);
	}

	static decodeMicroblockHash(microblocHash: string) {
		return Hash.fromHex(microblocHash)
	}
}