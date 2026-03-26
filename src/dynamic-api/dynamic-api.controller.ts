import { Controller, All, Param, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { DynamicApiService } from './dynamic-api.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@ApiTags('Dynamic API')
@Controller('api')
export class DynamicApiController {
    constructor(private readonly dynamicApiService: DynamicApiService) { }

    @All(':endpoint/:id')
    @ApiOperation({ summary: 'Get single resource by ID' })
    async executeEndpointById(
        @Param('endpoint') endpoint: string,
        @Param('id') id: string,
        @Query() query: any,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const result = await this.dynamicApiService.execute(endpoint, query, req.method, req, id);
            return res.status(HttpStatus.OK).json(result);
        } catch (e: any) {
            if (e.status) {
                return res.status(e.status).json({ message: e.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message || 'Error' });
        }
    }

    @All(':endpoint')
    @ApiOperation({ summary: 'Execute a dynamic endpoint query' })
    @ApiQuery({ name: 'q', required: false, description: 'JSON filter object (ORDS style)', example: '{"dept_id": 10}' })
    @ApiQuery({ name: 'fields', required: false, description: 'Comma-separated list of fields', example: 'name,email' })
    @ApiQuery({ name: 'limit', required: false, description: 'Pagination limit', example: 25 })
    @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset', example: 0 })
    async executeEndpoint(
        @Param('endpoint') endpoint: string,
        @Query() query: any,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const result = await this.dynamicApiService.execute(endpoint, query, req.method);
            return res.status(HttpStatus.OK).json(result);
        } catch (e: any) {
            if (e.status) {
                return res.status(e.status).json({ message: e.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message || 'Error' });
        }
    }
}
