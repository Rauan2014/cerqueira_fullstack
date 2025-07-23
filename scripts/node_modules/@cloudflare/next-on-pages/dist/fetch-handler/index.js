"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/fetch-handler/index.ts
  var import_server_only = __require("server-only");
  var fetch_handler_default = {
    async fetch() {
      throw new Error(
        "Invalid invocation of the next-on-pages fetch handler - this method should only be used alongside the --custom-entrypoint CLI option. For more details, see: https://github.com/cloudflare/next-on-pages/blob/main/packages/next-on-pages/docs/advanced-usage.md#custom-entrypoint"
      );
    }
  };
})();
