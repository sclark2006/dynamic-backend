import { Module, OnModuleInit } from '@nestjs/common';
import { DynamicApiModule } from '../dynamic-api/dynamic-api.module';
import { EndpointRegistryService } from '../dynamic-api/endpoint-registry.service';

const POLIZAS_SQL = `
    SELECT
        V.COMPANIA                                                        AS CODIGO_COMPANIA,
        V.RAMO                                                            AS CODIGO_RAMO,
        V.SECUENCIAL                                                      AS NUMERO_POLIZA,
        V.FEC_VER                                                         AS FECHA_VERSION,
        V.FEC_TRA                                                         AS FECHA_TRANSACCION,
        V.TIP_VER                                                         AS TIPO_VERSION,
        DECODE(V.TIP_VER,
            'E', 'Emisión',
            'M', 'Modificación',
            'C', 'Cancelación',
            'R', 'Renovación',
            'S', 'Suspensión',
            'Otro')                                                       AS DESCRIPCION_TIPO_VERSION,
        TO_CHAR(V.FEC_FAC,   'YYYY-MM-DD')                               AS FECHA_PROXIMA_FACTURACION,
        TO_CHAR(V.FEC_U_FAC, 'YYYY-MM-DD')                               AS FECHA_ULTIMA_FACTURACION,
        V.FACTURABLE                                                      AS ES_FACTURABLE,
        DECODE(V.CON_FAC,
            'C', 'Completa',
            'I', 'Incompleta',
            'No Especificada')                                            AS CONDICION_FACTURACION,
        V.FRE_PAG                                                         AS CODIGO_FRECUENCIA_PAGO,
        DECODE(V.FRE_PAG,
            1,   'DIARIO',
            7,   'SEMANAL',
            15,  'QUINCENAL',
            30,  'MENSUAL',
            60,  'BIMENSUAL',
            90,  'TRIMESTRAL',
            120, 'CUATRIMESTRAL',
            180, 'SEMESTRAL',
            365, 'ANUAL',
            'OTRA')                                                       AS DESCRIPCION_FRECUENCIA_PAGO,
        V.SUB_RAM                                                         AS CODIGO_SUBRAMO,
        V.ESTATUS                                                         AS CODIGO_ESTATUS_POLIZA,
        EST.DESCRIPCION                                                   AS DESCRIPCION_ESTATUS,
        DBAPER.F_CLIENTES_NOM(V.CLIENTE)                                  AS NOMBRE_CLIENTE,
        CLI.TIPO                                                          AS TIPO_CLIENTE,
        V.CLIENTE                                                         AS CODIGO_CLIENTE,
        V.FEC_INI                                                         AS FECHA_INICIO_VIGENCIA,
        V.FEC_FIN                                                         AS FECHA_FIN_VIGENCIA,
        V.POL_ADM                                                         AS ES_ADMINISTRADA
    FROM poliza v
    JOIN estatus est ON est.codigo = v.estatus
    JOIN cliente  cli ON cli.codigo = v.cliente
`;

@Module({
    imports: [DynamicApiModule],
})
export class PolizasModule implements OnModuleInit {
    constructor(private readonly registry: EndpointRegistryService) {}

    onModuleInit() {
        this.registry.register({
            name: 'polizas',
            sql: POLIZAS_SQL,
            type: 'query',
            method: 'GET',
            isCollection: true,
            pagination: true,
            primaryKey: 'NUMERO_POLIZA',
            description: 'Consultar pólizas. Filtrar por compañía: q={"CODIGO_COMPANIA":1}',
        });
    }
}
