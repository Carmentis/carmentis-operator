import { ResolutionProofWrapper, JsonData } from '@cmts-dev/carmentis-sdk-core';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResolverDto } from 'src/dto/ResolverDto';
import { ResolutionProofDto } from 'src/dto/ResolverResponseDto';
import { ResolverHandler } from 'src/utils/resolver/ResolverHandler';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { API_V1 } from '../../api/ApiVersion';

@ApiTags('Resolver')
@Controller({ path: '', version: API_V1 })
export class WalletResolverController {
    private logger = new Logger();

    constructor(
        private readonly resolver: ResolverHandler,
        private readonly walletByIdPipe: WalletByIdPipe,
    ) {
    }

    @ApiOperation({
        summary: 'Resolve data stored in microblocks',
        description: 'Recursively resolves microblock data.'
    })
    @ApiBody({ type: ResolverDto })
    @ApiCreatedResponse({
        description: 'A Carmentis proof containing the resolved data.',
        type: ResolutionProofDto
    })

    @ApiSecurity('api-key')
    @Post('/resolve')
    async resolve(
        @Body() resolverDto: ResolverDto,
    ): Promise<ResolutionProofDto> {
		const walletEntity = await this.walletByIdPipe.transform(resolverDto.walletId);
		const provider = walletEntity.getProvider();
        const chainId = await provider.getChainId();
        const proofContent = await this.resolver.resolve(
            walletEntity,
            provider,
            resolverDto
        );
        const proof = ResolutionProofWrapper.createEmptyProof(chainId);
        proof.setLinkedJson(proofContent.linkedJson);
        proof.setResolvedJson(proofContent.resolvedJson);
        proof.setProofs(proofContent.proofs);

        return proof.getObject();
    }
}
