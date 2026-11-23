// @ts-check
import { module } from "@prisma/composer";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import warungmamazaviyarContractJson from "./src/prisma/contract.json" with { type: "json" };
import warungmamazaviyarService from "./service.mjs";

export default module("agenon-vercel", ({ provision }) => {
  const database = provision(postgres({ name: "database", contract: dataContract(warungmamazaviyarContractJson), config: "./prisma.config.ts" }));
  provision(warungmamazaviyarService, { deps: { db: database } });
});
