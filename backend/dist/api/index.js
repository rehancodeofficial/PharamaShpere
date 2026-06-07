"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedServer;
async function handler(req, res) {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            credentials: true,
        });
        await app.init();
        cachedServer = expressApp;
    }
    cachedServer(req, res);
}
//# sourceMappingURL=index.js.map