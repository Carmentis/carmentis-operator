export type AccountTransactionHistoryEntry = {
	height: number,
	previousHistoryHash: string,
	type: number,
	name: string,
	timestamp: number,
	linkedAccount: string,
	amount: number,
	chainReference: string
}
