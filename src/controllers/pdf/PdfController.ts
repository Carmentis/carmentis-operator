import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResolverDto } from 'src/dto/ResolverDto';
import { ResolutionProofDto } from 'src/dto/ResolverResponseDto';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { API_V1 } from '../../api/ApiVersion';
import { ResolutionProofToPdf } from 'src/utils/pdf/ResolutionProofToPdf';
import { PdfGenerationDto } from 'src/dto/PdfGenerationDto';
import { PdfGenerationResponseDto } from 'src/dto/PdfGenerationResponseDto';
import { ResolverOutput } from '@cmts-dev/carmentis-sdk-core';
import { PdfAsDataUrl } from 'src/utils/pdf/PdfAsDataUrl';
import { PdfAttachment } from 'src/utils/pdf/PdfAttachment';

@ApiTags('PDF')
@Controller({ path: '', version: API_V1 })
export class PdfController {
    private logger = new Logger();

    constructor(
        private readonly resolutionProofToPdf: ResolutionProofToPdf,
        private readonly walletByIdPipe: WalletByIdPipe,
    ) {
    }

    @ApiOperation({
        summary: 'Generates a PDF file',
        description: 'Generates a PDF file from a resolution proof.'
    })
    @ApiBody({ type: ResolverDto })
    @ApiCreatedResponse({
        description: 'A Carmentis proof containing the resolved data.',
        type: ResolutionProofDto
    })

    @ApiSecurity('api-key')
    @Post('/pdf/generate')
    async generatePdf(
        @Body() pdfGenerationDto: PdfGenerationDto,
    ): Promise<PdfGenerationResponseDto> {
		const walletEntity = await this.walletByIdPipe.transform(pdfGenerationDto.walletId);
		const provider = walletEntity.getProvider();

        let pdfBytes = await this.resolutionProofToPdf.render(
            walletEntity,
            provider,
            pdfGenerationDto.proof.proof as ResolverOutput,
            pdfGenerationDto.options,
        );
        const attacher = new PdfAttachment(pdfBytes);
        await attacher.attach("carmentis-proof.json", JSON.stringify(pdfGenerationDto.proof));
        pdfBytes = attacher.getPdfBytes();

        return {
            pdf: PdfAsDataUrl.binaryToDataUrl(pdfBytes)
        };
    }

/*
    @ApiOperation({
        summary: 'Signs a PDF file',
        description: 'Signs a PDF file using a p12 file and the associated password.'
    })
    @ApiBody({ type: ResolverDto })
    @ApiCreatedResponse({
        description: 'A Carmentis proof containing the resolved data.',
        type: ResolutionProofDto
    })
    @ApiSecurity('api-key')
    @Post('/pdf/sign')
    async signPdf(
        @Body() resolverDto: ResolverDto,
    ): Promise<ResolutionProofDto> {
    }
*/
}
