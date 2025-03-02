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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmailLogTable1739693317877 = void 0;
const typeorm_1 = require("typeorm");
class CreateEmailLogTable1739693317877 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.createTable(new typeorm_1.Table({
                name: "email_logs",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "identity",
                        default: "uuid_generate_v4()",
                    },
                    { name: "email", type: "varchar", isNullable: false },
                    { name: "subject", type: "varchar", isNullable: false },
                    { name: "content", type: "text", isNullable: false },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["success", "failed", "pending"],
                        default: "'pending'",
                    },
                    { name: "errorMessage", type: "varchar", isNullable: true },
                    { name: "provider", type: "varchar", isNullable: false },
                    { name: "retryCount", type: "int", default: 0 },
                    { name: "metadata", type: "jsonb", isNullable: true },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }));
            yield queryRunner.query(`CREATE INDEX idx_email ON email_logs(email)`);
            yield queryRunner.query(`CREATE INDEX idx_status ON email_logs(status)`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.dropTable("email_logs");
        });
    }
}
exports.CreateEmailLogTable1739693317877 = CreateEmailLogTable1739693317877;
