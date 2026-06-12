/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as auth from "../auth.js";
import type * as convex__generated_api from "../convex/_generated/api.js";
import type * as convex__generated_server from "../convex/_generated/server.js";
import type * as embeddings from "../embeddings.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as lib_authHelper from "../lib/authHelper.js";
import type * as lib_cosineSimilarity from "../lib/cosineSimilarity.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_sanitize from "../lib/sanitize.js";
import type * as semanticSearch from "../semanticSearch.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auth: typeof auth;
  "convex/_generated/api": typeof convex__generated_api;
  "convex/_generated/server": typeof convex__generated_server;
  embeddings: typeof embeddings;
  http: typeof http;
  items: typeof items;
  "lib/authHelper": typeof lib_authHelper;
  "lib/cosineSimilarity": typeof lib_cosineSimilarity;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/sanitize": typeof lib_sanitize;
  semanticSearch: typeof semanticSearch;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
