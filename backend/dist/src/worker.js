"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const aws_lambda_1 = __importDefault(require("@fastify/aws-lambda"));
const hono_1 = require("hono");
let proxy;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    await app.init();
    const instance = app.getHttpAdapter().getInstance();
    proxy = (0, aws_lambda_1.default)(instance);
}
const honoApp = new hono_1.Hono();
honoApp.all('*', async (c) => {
    if (!proxy) {
        await bootstrap();
    }
    const url = new URL(c.req.url);
    const event = {
        httpMethod: c.req.method,
        path: url.pathname,
        headers: Object.fromEntries(c.req.raw.headers.entries()),
        queryStringParameters: Object.fromEntries(url.searchParams.entries()),
        body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? await c.req.text() : null,
        isBase64Encoded: false,
    };
    const response = await proxy(event, {});
    return new Response(response.body, {
        status: response.statusCode,
        headers: response.headers,
    });
});
exports.default = {
    fetch(request, env, ctx) {
        return honoApp.fetch(request, env, ctx);
    },
};
//# sourceMappingURL=worker.js.map