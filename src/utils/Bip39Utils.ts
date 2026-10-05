import { generateMnemonic, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

/**
 * BIP39 helpers for the actor passphrase (an English-wordlist mnemonic).
 */
export class Bip39Utils {

	/** Number of bits of entropy of a generated mnemonic (256 bits = 24 words). */
	static readonly ENTROPY_BITS = 256;

	static generate(): string {
		return generateMnemonic(wordlist, Bip39Utils.ENTROPY_BITS);
	}

	/**
	 * Trims, lowercases and collapses the whitespace of a user-provided mnemonic, so that the
	 * stored value (and hence the derived identities) does not depend on how it was pasted.
	 */
	static normalize(mnemonic: string): string {
		return mnemonic.trim().toLowerCase().split(/\s+/).join(' ');
	}

	/** Checks the word list membership, the word count and the checksum. */
	static isValid(mnemonic: string): boolean {
		return validateMnemonic(Bip39Utils.normalize(mnemonic), wordlist);
	}
}
