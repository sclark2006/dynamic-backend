import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const type = configService.get<string>('DB_TYPE');
        if (type === 'oracle') {
          return {
            type: 'oracle',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            sid: configService.get<string>('DB_SID'),
            serviceName: configService.get<string>('DB_SERVICE_NAME'),
            synchronize: false, // careful with this in production
            logging: true,
          };
        } else {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            synchronize: false,
            logging: true,
          };
        }
      },
    }),
  ],
})
export class DatabaseModule {}
