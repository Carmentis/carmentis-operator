export enum AnchorRequestStatus {
	/**
	 * Means that the anchor request has been created but no interaction has been made.
	 */
	CREATED = "created",


	/**
	 * Means that the anchor request has been created and the user has initiated the process.
	 */
	INITIATED = "initiated",

	/**
	 * Means that the anchor request has been created and the user has initiated the process.
	 */
	SUBMITTED = "submitted",

	/**
	 * Means that the anchor request has been cancelled.
	 */
	CANCELLED = "cancelled",

	/**
	 * Means that the anchor request has failed.
	 */
	FAILED = "failed",
}