"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  transactionsRoutes: () => transactionsRoutes
});
module.exports = __toCommonJS(transactions_exports);
var import_zod2 = require("zod");
var import_crypto = require("crypto");

// src/database.ts
var import_config = require("dotenv/config");
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({
    path: ".env.test"
  });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Env error: ", _env.error.format());
  throw new Error("Env error");
}
var env = _env.data;

// src/database.ts
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/middlewares/check-session-id-exist.ts
async function checkSessionIdExists(req, res) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res.status(401).send(
      "N\xE3o autorizado"
    );
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app) {
  app.get("/", {
    preHandler: [
      checkSessionIdExists
    ]
  }, async (req, res) => {
    const { sessionId } = req.cookies;
    const transactions = await knex("transactions").where("session_id", sessionId).select();
    return transactions;
  });
  app.get("/:id", {
    preHandler: [
      checkSessionIdExists
    ]
  }, async (req, res) => {
    const getTransactionsParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { id } = getTransactionsParamsSchema.parse(req.params);
    const { sessionId } = req.cookies;
    const transaction = await knex("transactions").where({
      session_id: sessionId,
      id
    }).first();
    console.log(transaction);
    return res.status(201).send(transaction);
  });
  app.get("/summary", {
    preHandler: [
      checkSessionIdExists
    ]
  }, async (req, res) => {
    const { sessionId } = req.cookies;
    const summary = await knex("transactions").sum("amount", { as: "amount" }).where("session_id", sessionId).first();
    console.log(summary);
    return { summary };
  });
  app.post("/", async (req, res) => {
    try {
      const createTransactionsBodySchema = import_zod2.z.object({
        title: import_zod2.z.string(),
        amount: import_zod2.z.number(),
        type: import_zod2.z.enum(["credit", "debit"])
      });
      const { title, amount, type } = createTransactionsBodySchema.parse(req.body);
      let sessionId = req.cookies.sessionId;
      if (!sessionId) {
        sessionId = (0, import_crypto.randomUUID)();
        res.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 1e3 * 60 * 60 * 24 * 7
          // 7 dias  
        });
      }
      await knex("transactions").insert({
        id: (0, import_crypto.randomUUID)(),
        title,
        amount: type === "credit" ? amount : amount * -1,
        session_id: sessionId
      });
      console.log(req.body);
      console.log(sessionId);
      return res.status(201).send("Criado com Sucesso!!!");
    } catch (error) {
      console.log(error);
    }
  });
  app.delete("/:id", {
    preHandler: [
      checkSessionIdExists
    ]
  }, async (req, res) => {
    const getTransactionsParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { id } = getTransactionsParamsSchema.parse(req.params);
    try {
      const deleted = await knex("transactions").where("id", id).delete();
      console.log(deleted);
      return res.status(200).send("Excluido com Sucesso!");
    } catch (error) {
      console.log(error);
      return res.status(400).send("Erro ao excluir");
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transactionsRoutes
});
