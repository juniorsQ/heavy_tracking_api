"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config"));
const prisma = globalThis.prisma || new client_1.PrismaClient({
    log: config_1.default.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (config_1.default.nodeEnv !== 'production') {
    globalThis.prisma = prisma;
}
exports.default = prisma;
