import { Module } from '@nestjs/common';
import { DynamicApiService } from './dynamic-api.service';
import { EndpointRegistryService } from './endpoint-registry.service';
import { DynamicApiController } from './dynamic-api.controller';

@Module({
    controllers: [DynamicApiController],
    providers: [DynamicApiService, EndpointRegistryService],
    exports: [EndpointRegistryService],
})
export class DynamicApiModule { }
