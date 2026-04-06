"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_server_1 = require("@hono/node-server");
var hono_1 = require("hono");
var cors_1 = require("hono/cors");
var hono_file_router_1 = require("hono-file-router");
var serve_static_1 = require("serve-static");
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var connection_js_1 = require("./db/connection.js");
var error_handler_js_1 = require("./middleware/error-handler.js");
var request_logger_js_1 = require("./middleware/request-logger.js");
var response_js_1 = require("./utils/response.js");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// Load environment variables from .env file
function loadEnv() {
    try {
        var envPath = path_1.default.resolve(__dirname, '../.env');
        if (fs_1.default.existsSync(envPath)) {
            var content = fs_1.default.readFileSync(envPath, 'utf8');
            var lines = content.split('\n');
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                var match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    var key = match[1];
                    var value = match[2] || '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = value.trim();
                    }
                }
            }
            console.log('Environment variables loaded from .env');
        }
        else {
            console.log('No .env file found, using system environment variables');
        }
    }
    catch (error) {
        console.warn('Could not load .env file:', error);
    }
}
loadEnv();
var app = new hono_1.Hono();
app.use('*', request_logger_js_1.requestIdMiddleware);
app.use('*', request_logger_js_1.requestLogger);
app.use('*', (0, cors_1.cors)({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 600,
    credentials: true,
}));
var uploadsDir = path_1.default.resolve(__dirname, '../uploads').replace(/\\/g, '/');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads/*', (0, serve_static_1.default)(uploadsDir));
var routesDir = fs_1.default.existsSync('./dist') ? './dist/routes' : './src/routes';
var routes = await (0, hono_file_router_1.createFolderRoute)({ path: routesDir });
app.route('/api/v1', routes);
app.get('/api/v1/health', function (c) {
    return (0, response_js_1.success)(c, { status: 'ok' });
});
var port = parseInt(process.env.PORT || '3001');
app.use('*', error_handler_js_1.errorHandler);
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var dbResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n' + '='.repeat(50));
                    console.log('Starting E-Commerce API Server...');
                    console.log('='.repeat(50));
                    console.log('\nTesting database connection...');
                    return [4 /*yield*/, (0, connection_js_1.testConnection)()];
                case 1:
                    dbResult = _a.sent();
                    if (dbResult.success) {
                        console.log(dbResult.message);
                    }
                    else {
                        console.log(dbResult.message);
                        console.log('Server will start but database operations may fail');
                    }
                    console.log('\nConfiguration:');
                    console.log("  - Port: ".concat(port));
                    console.log("  - DB Host: ".concat(process.env.DB_HOST || 'not set'));
                    console.log("  - DB Name: ".concat(process.env.DB_NAME || 'not set'));
                    console.log("  - DB User: ".concat(process.env.DB_USER || 'not set'));
                    console.log('\n' + '='.repeat(50));
                    console.log("Server running on http://localhost:".concat(port));
                    console.log('='.repeat(50));
                    (0, node_server_1.serve)({
                        fetch: app.fetch,
                        port: port
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
