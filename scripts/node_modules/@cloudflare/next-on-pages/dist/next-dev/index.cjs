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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  setupDevBindings: () => setupDevBindings,
  setupDevPlatform: () => setupDevPlatform
});
module.exports = __toCommonJS(src_exports);
var import_wrangler2 = require("wrangler");

// src/shared.ts
var cloudflareRequestContextSymbol = Symbol.for(
  "__cloudflare-request-context__"
);
var processEnvIsPatched = Symbol("PROCESS.ENV_IS_PATCHED");
var globalsArePatched = Symbol("GLOBALS_ARE_PATCHED");
function monkeyPatchVmModule({ env, cf, ctx, caches }) {
  const vmModule = require("vm");
  const originalRunInContext = vmModule.runInContext.bind(vmModule);
  vmModule.runInContext = (...args) => {
    const runtimeContext = args[1];
    runtimeContext[cloudflareRequestContextSymbol] ??= {
      env,
      ctx,
      cf
    };
    monkeyPatchProcessEnv(runtimeContext, env);
    monkeyPatchAuxiliaryGlobals(runtimeContext, caches);
    return originalRunInContext(...args);
  };
}
function monkeyPatchProcessEnv(runtimeContext, env) {
  if (runtimeContext.process?.env && !runtimeContext.process.env[processEnvIsPatched]) {
    if (runtimeContext.process.env) {
      for (const [name, binding] of Object.entries(env)) {
        runtimeContext.process.env[name] = binding;
      }
    }
    runtimeContext.process.env[processEnvIsPatched] = true;
  }
}
function monkeyPatchAuxiliaryGlobals(runtimeContext, caches) {
  if (!runtimeContext[globalsArePatched]) {
    runtimeContext["caches"] = caches;
    runtimeContext["Request"] = new Proxy(Request, {
      construct(target, args, newTarget) {
        if (args.length >= 2 && typeof args[1] === "object" && args[1].duplex === void 0) {
          args[1].duplex = "half";
        }
        return Reflect.construct(target, args, newTarget);
      }
    });
    runtimeContext["Response"] = Response;
    runtimeContext["Headers"] = Headers;
    runtimeContext[globalsArePatched] = true;
  }
}
function shouldSetupContinue() {
  const AsyncLocalStorage = globalThis["AsyncLocalStorage"];
  return !!AsyncLocalStorage;
}

// src/deprecated.ts
var import_wrangler = require("wrangler");
var import_node_path = require("node:path");
var import_promises = require("node:fs/promises");
var tmpWranglerJsonPath = (0, import_node_path.resolve)(
  "node_modules",
  "@cloudflare",
  "next-on-pages",
  "__next-dev",
  "wrangler.json"
);
async function setupDevBindings(options) {
  const continueSetup = shouldSetupContinue2();
  if (!continueSetup)
    return;
  if (!options) {
    throwError("No options provided to setupDevBindings");
  }
  if (!options.bindings) {
    throwError("The provided options object doesn't include a bindings field");
  }
  await buildWranglerJson(options.bindings);
  monkeyPatchVmModule(
    await (0, import_wrangler.getPlatformProxy)({
      ...options,
      configPath: tmpWranglerJsonPath,
      experimentalJsonConfig: true
    })
  );
}
function shouldSetupContinue2() {
  const AsyncLocalStorage = globalThis["AsyncLocalStorage"];
  return !!AsyncLocalStorage;
}
function throwError(message) {
  throw new Error(`\u26A0\uFE0F [setupDevBindings Error]: ${message}`);
}
async function buildWranglerJson(bindings) {
  const bindingsEntries = Object.entries(bindings);
  const vars = Object.fromEntries(
    bindingsEntries.map(([bindingName, binding]) => {
      if (binding.type !== "var")
        return null;
      return [bindingName, binding.value];
    }).filter(Boolean)
  );
  function extractBindings(type, fn) {
    return bindingsEntries.map(([bindingName, binding]) => {
      if (binding.type !== type) {
        return null;
      }
      return fn({
        bindingName,
        binding
      });
    }).filter(Boolean);
  }
  const services = extractBindings("service", ({ bindingName, binding }) => ({
    binding: bindingName,
    service: binding.service.name
  }));
  const kv_namespaces = extractBindings("kv", ({ bindingName, binding }) => ({
    binding: bindingName,
    id: binding.id
  }));
  const doBindings = extractBindings(
    "durable-object",
    ({ bindingName, binding }) => ({
      name: bindingName,
      script_name: binding.service.name,
      class_name: binding.className
    })
  );
  const d1_databases = extractBindings("d1", ({ bindingName, binding }) => {
    const database = "databaseName" in binding ? binding.databaseName : binding.databaseId;
    return {
      binding: bindingName,
      database_name: database,
      database_id: database
    };
  });
  const r2_buckets = extractBindings("r2", ({ bindingName, binding }) => ({
    binding: bindingName,
    bucket_name: binding.bucketName
  }));
  const wranglerJson = JSON.stringify({
    vars,
    kv_namespaces,
    services,
    durable_objects: { bindings: doBindings },
    d1_databases,
    r2_buckets
  });
  await (0, import_promises.mkdir)((0, import_node_path.dirname)(tmpWranglerJsonPath), { recursive: true });
  await (0, import_promises.writeFile)(tmpWranglerJsonPath, wranglerJson, "utf8");
}

// src/index.ts
async function setupDevPlatform(options) {
  const continueSetup = shouldSetupContinue();
  if (!continueSetup)
    return;
  monkeyPatchVmModule(await (0, import_wrangler2.getPlatformProxy)(options));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setupDevBindings,
  setupDevPlatform
});
