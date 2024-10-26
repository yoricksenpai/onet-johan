import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from '../winston.logger';

@Module({
  imports: [    WinstonModule.forRoot(winstonLoggerConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
