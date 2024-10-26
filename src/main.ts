import { morganOption } from '../winston.logger';
import { NestFactory } from '@nestjs/core';
import { config } from 'convict-config';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      }
    }),
  );
  
  app.setGlobalPrefix(config.get('basePath'));
  
  app.enableCors();

  const format = `\n\b:remote-addr - ':method :url HTTP/:http-version' :status :response-time ms - :res[content-length] ":referrer" ":user-agent"\n + '\n\b'`;
  app.use(morgan(format, morganOption));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(config.get('port'));
}
bootstrap();