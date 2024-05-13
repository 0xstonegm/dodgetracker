"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riotApi = exports.lolApi = void 0;
const twisted_1 = require("twisted");
exports.lolApi = new twisted_1.LolApi();
exports.riotApi = new twisted_1.RiotApi();
