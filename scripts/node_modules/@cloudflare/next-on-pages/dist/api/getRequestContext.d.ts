/// <reference types="@cloudflare/workers-types" />
import 'server-only';
declare global {
    interface CloudflareEnv {
    }
}
type RequestContext<CfProperties extends Record<string, unknown> = IncomingRequestCfProperties, Context = ExecutionContext> = {
    env: CloudflareEnv;
    cf: CfProperties;
    ctx: Context;
};
export declare function getOptionalRequestContext<CfProperties extends Record<string, unknown> = IncomingRequestCfProperties, Context = ExecutionContext>(): undefined | RequestContext<CfProperties, Context>;
export declare function getRequestContext<CfProperties extends Record<string, unknown> = IncomingRequestCfProperties, Context = ExecutionContext>(): RequestContext<CfProperties, Context>;
export {};
//# sourceMappingURL=getRequestContext.d.ts.map