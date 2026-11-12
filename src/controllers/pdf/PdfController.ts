import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResolutionProofDto } from 'src/dto/ResolverResponseDto';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { API_V1 } from '../../api/ApiVersion';
import { ResolutionProofToPdf } from 'src/utils/pdf/ResolutionProofToPdf';
import { PdfFromOutputDto, PdfFromInputDto } from 'src/dto/PdfGenerationDto';
import { PdfSignatureDto } from 'src/dto/PdfSignatureDto';
import { PdfResponseDto } from 'src/dto/PdfResponseDto';
import { ResolverOutput } from '@cmts-dev/carmentis-sdk-core';
import { PdfAsDataUrl } from 'src/utils/pdf/PdfAsDataUrl';
import { PdfSigner } from 'src/utils/pdf/PdfSigner';

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
        summary: 'Generate a PDF file from resolution output',
        description: 'Generates a PDF file from a resolution proof output.'
    })
    @ApiBody({ type: PdfFromOutputDto })
    @ApiCreatedResponse({
        type: PdfResponseDto
    })
    @ApiSecurity('api-key')
    @Post('/pdf/generate-from-output')
    async generatePdfFromOutput(
        @Body() pdfGenerationDto: PdfFromOutputDto,
    ): Promise<PdfResponseDto> {
		const walletEntity = await this.walletByIdPipe.transform(pdfGenerationDto.walletId);
		const provider = walletEntity.getProvider();

        const pdfBytes = await this.resolutionProofToPdf.renderFromOutput(
            walletEntity,
            provider,
            pdfGenerationDto.proof.proof as ResolverOutput,
            pdfGenerationDto.options,
        );

        return {
            pdf: PdfAsDataUrl.binaryToDataUrl(pdfBytes)
        };
    }

    @ApiOperation({
        summary: 'Generate a PDF file from resolution input',
        description: 'Generates a PDF file from a resolution proof input.'
    })
    @ApiBody({ type: PdfFromInputDto })
    @ApiCreatedResponse({
        type: PdfResponseDto
    })
    @ApiSecurity('api-key')
    @Post('/pdf/generate-from-input')
    async generatePdfFromInput(
        @Body() pdfGenerationDto: PdfFromInputDto,
    ): Promise<PdfResponseDto> {
		const walletEntity = await this.walletByIdPipe.transform(pdfGenerationDto.resolution.walletId);
		const provider = walletEntity.getProvider();

        const pdfBytes = await this.resolutionProofToPdf.renderFromInput(
            walletEntity,
            provider,
            pdfGenerationDto.resolution,
            pdfGenerationDto.options,
        );

        return {
            pdf: PdfAsDataUrl.binaryToDataUrl(pdfBytes)
        };
    }

    @ApiOperation({
        summary: 'Signs a PDF file',
        description: 'Signs a PDF file using a p12 file and the associated password.'
    })
    @ApiBody({ type: PdfSignatureDto })
    @ApiCreatedResponse({
        description: 'A Carmentis proof containing the resolved data.',
        type: ResolutionProofDto
    })
    @ApiSecurity('api-key')
    @Post('/pdf/sign')
    async signPdf(
        @Body() pdfSignatureDto: PdfSignatureDto,
    ): Promise<PdfResponseDto> {
        let pdfBytes: Buffer = PdfAsDataUrl.dataUrlToBinary(pdfSignatureDto.pdf);
        const match = pdfSignatureDto.p12.match(/^data:application\/x-pkcs12;base64,(.*)/);
        if (!match) {
            throw new Error(`invalid data URL for p12 content; expected "data:application/x-pkcs12;base64,..."`);
        }
        const p12Buffer = Buffer.from(match[1], 'base64');
        const signer = new PdfSigner(pdfBytes);
        await signer.signWithP12(p12Buffer, pdfSignatureDto.password);
        pdfBytes = signer.getPdfBytes();
        return {
            pdf: PdfAsDataUrl.binaryToDataUrl(pdfBytes)
        };
    }
}
