import { Module, OnModuleInit } from '@nestjs/common';
import { DynamicApiModule } from '../dynamic-api/dynamic-api.module';
import { EndpointRegistryService } from '../dynamic-api/endpoint-registry.service';

@Module({
    imports: [DynamicApiModule],
})
export class AseguradosModule implements OnModuleInit {
    constructor(private readonly registry: EndpointRegistryService) {}

    onModuleInit() {
        this.registry.register({
            name: 'asegurados',
            sql: 'SELECT * FROM DBAPER.ASEGURADO',
            type: 'query',
            method: 'GET',
            isCollection: true,
            pagination: true,
            primaryKey: 'CODIGO',
            description: 'Consultar asegurados',
        });
    }
}
