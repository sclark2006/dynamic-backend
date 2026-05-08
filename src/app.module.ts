import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DynamicApiModule } from './features/dynamic-api/dynamic-api.module';
import { PolizasModule } from './features/polizas/polizas.module';
import { AseguradosModule } from './features/asegurados/asegurados.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    DynamicApiModule,
    PolizasModule,
    AseguradosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
