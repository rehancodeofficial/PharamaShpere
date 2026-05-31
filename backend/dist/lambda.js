"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_express_1 = require("@vendia/serverless-express");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedServer;
async function bootstrap() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
        app.enableCors();
        await app.init();
        cachedServer = (0, serverless_express_1.configure)({ app: expressApp });
    }
    return cachedServer;
}
const handler = async (event, context, callback) => {
    const server = await bootstrap();
    return server(event, context, callback);
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map