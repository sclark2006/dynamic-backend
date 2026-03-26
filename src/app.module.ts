import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DynamicApiModule } from './dynamic-api/dynamic-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    DynamicApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
