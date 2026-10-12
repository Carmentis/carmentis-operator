export enum AnchorRequestStatus {
	/**
	 * Means that the anchor request has been created but no interaction has been made.
	 */
	CREATED = "created",

	/**
	 * Means that the microblock of the anchor request has been published to the node, but its presence on chain
	 * has not been confirmed by the indexer yet.
	 */
	SUBMITTED = "submitted",

	/**
	 * Means that the indexer has confirmed that the submitted microblock is anchored on chain.
	 */
	ANCHORED = "anchored",


	/**
	 * Means that the anchor request has failed.
	 */
	FAILED = "failed",



	// Status below are only meaningful for "anchor with wallet" action
	// which is no longer supported.
	/**
	 * Means that the anchor request has been created and the user has initiated the process.
	 */
	INITIATED = "initiated",

	/**
	 * Means that the anchor request has been cancelled.
	 */
	CANCELLED = "cancelled",

}