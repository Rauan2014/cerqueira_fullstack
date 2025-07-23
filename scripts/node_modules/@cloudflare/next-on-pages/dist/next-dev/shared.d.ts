import type { PlatformProxy } from 'wrangler';
/**
 * Next.js uses the Node.js vm module's `runInContext()` function to evaluate the edge functions
 * in a runtime context that tries to simulate as accurately as possible the actual production runtime
 * behavior, see: https://github.com/vercel/next.js/blob/ec0a8da/packages/next/src/server/web/sandbox/context.ts#L450-L452
 *
 * This function monkey-patches the Node.js vm module to override the `runInContext()` function so that
 * miniflare binding proxies can be added to the runtime context's `process.env` before the actual edge
 * functions are evaluated.
 *
 * @param platformProxy platform proxy obtained via wrangler's getPlatformProxy utility
 */
export declare function monkeyPatchVmModule({ env, cf, ctx, caches }: PlatformProxy): void;
/**
 * Next dev server imports the config file twice (in two different processes, making it hard to track),
 * this causes the setup to run twice as well, to keep things clean and not allocate extra resources
 * (i.e. instantiate two miniflare instances) it would be best to run this function only once, this
 * function is used to try to run the setup only once, it returns a flag which indicates if the setup
 * should run in the current process or not.
 *
 * @returns boolean indicating if the setup should continue
 */
export declare function shouldSetupContinue(): boolean;
