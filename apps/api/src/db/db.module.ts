import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDb, Database } from './index';

export const DB = Symbol('DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Database => {
        const url = config.get<string>('DATABASE_URL')!;
        return createDb(url);
      },
    },
  ],
  exports: [DB],
})
export class DbModule {}
