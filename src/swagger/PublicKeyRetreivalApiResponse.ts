export class PublicKeyRetrievalApiResponse {
	static Signature = {
		Response200: {
			status: 200,
			description: 'The public signature key has been retrieved.',
			schema: {
				properties: {
					signature: {
						properties: {
							pk: { type: 'string' }
						}
					}
				}
			}
		}
	}

	static Pke = {
		Response200: {
			status: 200,
			description: 'The public encryption key has been retrieved.',
			schema: {
				properties: {
					pke: {
						properties: {
							pk: { type: 'string' }
						}
					}
				}
			}
		}
	}
}