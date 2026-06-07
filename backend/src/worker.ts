import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import awsLambdaFastify from '@fastify/aws-lambda';
import { Hono } from 'hono';

let proxy: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.init();

  const instance = app.getHttpAdapter().getInstance();
  proxy = awsLambdaFastify(instance);
}

const honoApp = new Hono();

honoApp.all('*', async (c) => {
  if (!proxy) {
    await bootstrap();
  }

  // Cloudflare Request to AWS API Gateway Event mapping
  const url = new URL(c.req.url);
  const event = {
    httpMethod: c.req.method,
    path: url.pathname,
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? await c.req.text() : null,
    isBase64Encoded: false,
  };

  const response = await proxy(event, {} as any);

  return new Response(response.body, {
    status: response.statusCode,
    headers: response.headers,
  });
});

export default {
  fetch(request: Request, env: any, ctx: any) {
    return honoApp.fetch(request, env, ctx);
  },
};
