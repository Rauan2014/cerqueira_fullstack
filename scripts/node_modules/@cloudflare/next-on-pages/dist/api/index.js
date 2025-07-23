"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/dedent-tabs/dist/dedent-tabs.js
var require_dedent_tabs = __commonJS({
  "../../node_modules/dedent-tabs/dist/dedent-tabs.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true }), exports["default"] = dedent2;
    function dedent2(a) {
      for (var b = "string" == typeof a ? [a] : a.raw, c = "", d = 0; d < b.length; d++)
        if (c += b[d].replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\{/g, "{"), d < (1 >= arguments.length ? 0 : arguments.length - 1)) {
          var e = c.substring(c.lastIndexOf("\n") + 1), f = e.match(/^(\s*)\S?/);
          c += ((1 > d + 1 || arguments.length <= d + 1 ? void 0 : arguments[d + 1]) + "").replace(/\n/g, "\n" + f[1]);
        }
      var g = c.split("\n"), h = null;
      if (g.forEach(function(a2) {
        var b2 = Math.min, c2 = a2.match(/^(\s+)\S+/);
        if (c2) {
          var d2 = c2[1].length;
          h = h ? b2(h, d2) : d2;
        }
      }), null !== h) {
        var j = h;
        c = g.map(function(a2) {
          return " " === a2[0] || "	" === a2[0] ? a2.slice(j) : a2;
        }).join("\n");
      }
      return c.trim().replace(/\\n/g, "\n");
    }
  }
});

// src/api/index.ts
var api_exports = {};
__export(api_exports, {
  getOptionalRequestContext: () => getOptionalRequestContext,
  getRequestContext: () => getRequestContext
});
module.exports = __toCommonJS(api_exports);

// src/api/getRequestContext.ts
var import_server_only = require("server-only");
var import_dedent_tabs = __toESM(require_dedent_tabs());
var cloudflareRequestContextSymbol = Symbol.for(
  "__cloudflare-request-context__"
);
function getOptionalRequestContext() {
  const cloudflareRequestContext = globalThis[cloudflareRequestContextSymbol];
  if (inferRuntime() === "nodejs") {
    throw new Error(import_dedent_tabs.default`
			\`getRequestContext\` and \`getOptionalRequestContext\` can only be run
			inside the edge runtime, so please make sure to have included
			\`export const runtime = 'edge'\` in all the routes using such functions
			(regardless of whether they are used directly or indirectly through imports).
		`);
  }
  return cloudflareRequestContext;
}
function getRequestContext() {
  const cloudflareRequestContext = getOptionalRequestContext();
  if (!cloudflareRequestContext) {
    const isPrerendering = process?.env?.["NEXT_PHASE"] === "phase-production-build";
    if (isPrerendering) {
      throw new Error(import_dedent_tabs.default`
				\n\`getRequestContext\` is being called at the top level of a route file, this is not supported
				for more details see https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/troubleshooting/#top-level-getrequestcontext \n
			`);
    }
    let errorMessage = "Failed to retrieve the Cloudflare request context.";
    if (process.env.NODE_ENV === "development") {
      errorMessage += "\n\n" + import_dedent_tabs.default`
					For local development (using the Next.js dev server) remember to include
					a call to the \`setupDevPlatform\` function in your config file.

					For more details visit:
					  https://github.com/cloudflare/next-on-pages/tree/3846730c/internal-packages/next-dev
				` + "\n\n";
    }
    throw new Error(errorMessage);
  }
  return cloudflareRequestContext;
}
function inferRuntime() {
  if (process?.release?.name === "node") {
    return "nodejs";
  }
  return "edge";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getOptionalRequestContext,
  getRequestContext
});
