import { ApplicationLedgerVb } from '@cmts-dev/carmentis-sdk-core';
import { CryptoUtils } from './CryptoUtils';

export class ApplicationLedgerUtils {
	static getAllActorNames(vb: ApplicationLedgerVb): string[] {
		return vb.getAllActors().map(a => a.name);
	}

	static getAllChannelNames(vb: ApplicationLedgerVb): string[] {
		return vb.getAllChannels().map(c => c.name);
	}

	static getAllActor(vb: ApplicationLedgerVb) {
		return vb.getAllActors();
	}

	static getAllActorsWithAccessibleChannels(vb: ApplicationLedgerVb) {
		const actors = this.getAllActor(vb);
		return actors.map(actor => {
			return {
				name: actor.name,
				subscribed: actor.subscribed,
				channels: ApplicationLedgerUtils.getChannelsWhereActorIs(vb, actor.name)
			};
		});
	}

	static getAllChannel(vb: ApplicationLedgerVb) {
		return vb.getAllChannels();
	}

	static getChannelsWhereActorIs(vb: ApplicationLedgerVb, actorName: string): string[] {
		// we first search through all channels where the actor is the creator
		const actorId = vb.getActorIdFromActorName(actorName);
		const channelsWithActorAsCreator = vb.getAllChannels()
			.filter(c => c.creatorId === actorId)
			.map(c => c.name);

		// we then search through all channels where the actor is invited
		const channelIdsWhereActorsIsInvited =
			vb.getActor(actorName)
				.invitations
				.map(i => i.channelId)
				.map(channelId => vb.getChannelById(channelId))
				.map(c => c.name);

		const unified = new Set([
			...channelsWithActorAsCreator,
			...channelIdsWhereActorsIsInvited
		]);
		return [...unified];
	}

	static getActorPublicSignatureKey(vb: ApplicationLedgerVb, actorName: string) {
		return vb.getPublicSignatureKeyByActorId(vb.getActorIdFromActorName(actorName));
	}

	static getActorPublicEncryption(vb: ApplicationLedgerVb, actorName: string) {
		return vb.getPublicEncryptionKeyByActorId(vb.getActorIdFromActorName(actorName));
	}

	static async getActorKeys(vb: ApplicationLedgerVb, actorName: string) {
		const pkSig = await CryptoUtils.encodePublicSignatureKey(
			await this.getActorPublicSignatureKey(vb, actorName)
		)
		const pkPke = await CryptoUtils.encodePublicEncryptionKey(
			await this.getActorPublicEncryption(vb, actorName)
		)
		return {
			actor: actorName,
			sig: {
				pk: pkSig
			},
			pke: {
				pk: pkPke
			}
		}
	}

	static getActorsAndChannels(vb: ApplicationLedgerVb) {
		return {
			channels: ApplicationLedgerUtils.getAllChannelNames(vb),
			actors: ApplicationLedgerUtils.getAllActorsWithAccessibleChannels(vb),
		}
	}
}