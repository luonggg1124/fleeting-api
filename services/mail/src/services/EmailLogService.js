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
exports.EmailLogService = void 0;
const data_source_1 = require("../config/data-source");
const EmailLogRepository_1 = require("../models/repositories/EmailLogRepository");
class EmailLogService {
    constructor(emailLogRepository = new EmailLogRepository_1.EmailLogRepository(data_source_1.AppDataSource.manager)) {
        this.logMail = (data) => __awaiter(this, void 0, void 0, function* () {
            const mail = yield this.emailLogRepository.logMail(data);
            return mail;
        });
        this.emailLogRepository = emailLogRepository;
    }
}
exports.EmailLogService = EmailLogService;
