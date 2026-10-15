import { ResolutionProofWrapper, JsonData } from '@cmts-dev/carmentis-sdk-core';
import { Body, Controller, Logger, Post, Param } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKey } from '../../decorators/ApiKeyDecorator';
import { Public } from '../../decorators/PublicDecorator';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { ResolverDto } from 'src/dto/ResolverDto';
import { ResolutionProofDto } from 'src/dto/ResolverResponseDto';
import { ResolverHandler } from 'src/utils/resolver/ResolverHandler';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { API_V1 } from '../../api/ApiVersion';

@ApiTags('Resolver')
@Controller({ path: '', version: API_V1 })
export class WalletResolverController {
    private logger = new Logger();

    constructor(
        private readonly resolver: ResolverHandler
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
    @Post('/wallet/:walletId/resolve')
    async resolve(
        @Param('walletId', WalletByIdPipe) walletEntity: WalletEntity,
        @Body() resolverDto: ResolverDto,
    ): Promise<ResolutionProofDto> {
		const provider = walletEntity.getProvider();
        const chainId = await provider.getChainId();
        const proofContent = await this.resolver.resolve(
            walletEntity,
            provider,
            resolverDto
        );
        console.log("resolverDto", resolverDto);
        console.log("proofContent", proofContent);
        const proof = ResolutionProofWrapper.createEmptyProof(chainId);
        proof.setLinkedJson(proofContent.linkedJson);
        proof.setResolvedJson(proofContent.resolvedJson);
        proof.setProofs(proofContent.proofs);

        return proof.getObject();
    }
}
