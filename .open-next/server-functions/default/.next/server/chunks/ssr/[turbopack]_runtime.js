const RUNTIME_PUBLIC_PATH = "server/chunks/ssr/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/_next/";
const WORKER_FORWARDED_GLOBALS = ["NEXT_DEPLOYMENT_ID","NEXT_CLIENT_ASSET_SUFFIX"];
// Apply forwarded globals from workerData if running in a worker thread
if (typeof require !== 'undefined') {
    try {
        const { workerData } = require('worker_threads');
        if (workerData?.__turbopack_globals__) {
            Object.assign(globalThis, workerData.__turbopack_globals__);
            // Remove internal data so it's not visible to user code
            delete workerData.__turbopack_globals__;
        }
    } catch (_) {
        // Not in a worker thread context, ignore
    }
}
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
/**
 * Describes why a module was instantiated.
 * Shared between browser and Node.js runtimes.
 */ var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    /**
   * The module was instantiated because it was included in a chunk's hot module
   * update.
   * SourceData is an array of ModuleIds or undefined.
   */ SourceType[SourceType["Update"] = 2] = "Update";
    return SourceType;
}(SourceType || {});
/**
 * Flag indicating which module object type to create when a module is merged. Set to `true`
 * by each runtime that uses ModuleWithDirection (browser dev-base.ts, nodejs dev-base.ts,
 * nodejs build-base.ts). Browser production (build-base.ts) leaves it as `false` since it
 * uses plain Module objects.
 */ let createModuleWithDirectionFlag = false;
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        if (createModuleWithDirectionFlag) {
            // set in development modes for hmr support
            module = createModuleWithDirection(id);
        } else {
            module = createModuleObject(id);
        }
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
function createModuleWithDirection(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined,
        parents: [],
        children: []
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Install the factory for each module ID that doesn't already have one.
        // When some IDs in this group already have a factory, reuse that existing
        // group factory for the missing IDs to keep all IDs in the group consistent.
        // Otherwise, install the factory from this chunk.
        const moduleFactoryFn = chunkModules[end];
        let existingGroupFactory = undefined;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            const existingFactory = moduleFactories.get(id);
            if (existingFactory) {
                existingGroupFactory = existingFactory;
                break;
            }
        }
        const factoryToInstall = existingGroupFactory ?? moduleFactoryFn;
        let didInstallFactory = false;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            if (!moduleFactories.has(id)) {
                if (!didInstallFactory) {
                    if (factoryToInstall === moduleFactoryFn) {
                        applyModuleFactoryName(moduleFactoryFn);
                    }
                    didInstallFactory = true;
                }
                moduleFactories.set(id, factoryToInstall);
                newModuleId?.(id);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * Constructs an error message for when a module factory is not available.
 */ function factoryNotAvailableMessage(moduleId, sourceType, sourceData) {
    let instantiationReason;
    switch(sourceType){
        case 0:
            instantiationReason = `as a runtime entry of chunk ${sourceData}`;
            break;
        case 1:
            instantiationReason = `because it was required from module ${sourceData}`;
            break;
        case 2:
            instantiationReason = 'because of an HMR update';
            break;
        default:
            invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
    }
    return `Module ${moduleId} was instantiated ${instantiationReason}, but the module factory is not available.`;
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../../shared/runtime/runtime-utils.ts" />
/// <reference path="../../shared-node/base-externals-utils.ts" />
/// <reference path="../../shared-node/node-externals-utils.ts" />
/// <reference path="../../shared-node/node-wasm-utils.ts" />
/// <reference path="./nodejs-globals.d.ts" />
/**
 * Base Node.js runtime shared between production and development.
 * Contains chunk loading, module caching, and other non-HMR functionality.
 */ process.env.TURBOPACK = '1';
const url = require('url');
const moduleFactories = new Map();
const moduleCache = Object.create(null);
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
/**
 * Exports a URL value. No suffix is added in Node.js runtime.
 */ function exportUrl(urlValue, id) {
    exportValue.call(this, urlValue, id);
}
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
    loadedChunks.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
function loadWebAssembly(chunkPath, _edgeModule, imports) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return instantiateWebAssemblyFromPath(resolved, imports);
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return compileWebAssemblyFromPath(resolved);
}
contextPrototype.u = loadWebAssemblyModule;
/**
 * Creates a Node.js worker thread by instantiating the given WorkerConstructor
 * with the appropriate path and options, including forwarded globals.
 *
 * @param WorkerConstructor The Worker constructor from worker_threads
 * @param workerPath Path to the worker entry chunk
 * @param workerOptions options to pass to the Worker constructor (optional)
 */ function createWorker(WorkerConstructor, workerPath, workerOptions) {
    // Build the forwarded globals object
    const forwardedGlobals = {};
    for (const name of WORKER_FORWARDED_GLOBALS){
        forwardedGlobals[name] = globalThis[name];
    }
    // Merge workerData with forwarded globals
    const existingWorkerData = workerOptions?.workerData || {};
    const options = {
        ...workerOptions,
        workerData: {
            ...typeof existingWorkerData === 'object' ? existingWorkerData : {},
            __turbopack_globals__: forwardedGlobals
        }
    };
    return new WorkerConstructor(workerPath, options);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-base.ts" />
/**
 * Production Node.js runtime.
 * Uses ModuleWithDirection and simple module instantiation without HMR support.
 */ // moduleCache and moduleFactories are declared in runtime-base.ts
// this is read in runtime-utils.ts so it creates a module with direction for hmr
createModuleWithDirectionFlag = true;
const nodeContextPrototype = Context.prototype;
nodeContextPrototype.q = exportUrl;
nodeContextPrototype.M = moduleFactories;
// Cast moduleCache to ModuleWithDirection for production mode
nodeContextPrototype.c = moduleCache;
nodeContextPrototype.R = resolvePathFromModule;
nodeContextPrototype.b = createWorker;
nodeContextPrototype.C = clearChunkCache;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        throw new Error(factoryNotAvailableMessage(id, sourceType, sourceData));
    }
    const module1 = createModuleWithDirection(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    ;
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, SourceType.Parent, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, SourceType.Runtime, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/[externals]_next_dist_compiled_@vercel_og_index_node_00__rw~.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_next_dist_compiled_@vercel_og_index_node_00__rw~.js");
      case "server/chunks/ssr/[root-of-the-server]__028i6lv._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__028i6lv._.js");
      case "server/chunks/ssr/[root-of-the-server]__02bfuqz._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__02bfuqz._.js");
      case "server/chunks/ssr/[root-of-the-server]__08gf6t7._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__08gf6t7._.js");
      case "server/chunks/ssr/[root-of-the-server]__0cxwk-1._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0cxwk-1._.js");
      case "server/chunks/ssr/[root-of-the-server]__0hzzzr0._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hzzzr0._.js");
      case "server/chunks/ssr/[root-of-the-server]__0nw6r36._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0nw6r36._.js");
      case "server/chunks/ssr/[root-of-the-server]__0sz3ttp._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0sz3ttp._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0eq97pa.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0eq97pa.js");
      case "server/chunks/ssr/node_modules_0i2xw~e._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0i2xw~e._.js");
      case "server/chunks/ssr/node_modules_next_dist_03nkrli._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_03nkrli._.js");
      case "server/chunks/ssr/node_modules_next_dist_0h9llsw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0h9llsw._.js");
      case "server/chunks/ssr/node_modules_next_dist_0i_._k3._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0i_._k3._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0inhx6q._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0inhx6q._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0ghu-f7.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0ghu-f7.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0cjv-23.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0cjv-23.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0.uj6v-.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0.uj6v-.js");
      case "server/chunks/ssr/[root-of-the-server]__0a-4fjm._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0a-4fjm._.js");
      case "server/chunks/ssr/[root-of-the-server]__10xgshr._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__10xgshr._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0k77kol.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0k77kol.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0lgvd_..js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0lgvd_..js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0rc3ul_.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0rc3ul_.js");
      case "server/chunks/[root-of-the-server]__0op9af~._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0op9af~._.js");
      case "server/chunks/[root-of-the-server]__0yj271b._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0yj271b._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_markets_route_actions_0lpijvc.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_markets_route_actions_0lpijvc.js");
      case "server/chunks/[root-of-the-server]__05z3sv_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__05z3sv_._.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_ohlcv_route_actions_0ru6ajc.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_ohlcv_route_actions_0ru6ajc.js");
      case "server/chunks/[root-of-the-server]__0mud~.4._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0mud~.4._.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_price-chart_route_actions_0b45j4w.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_price-chart_route_actions_0b45j4w.js");
      case "server/chunks/[root-of-the-server]__0p_.6s.._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0p_.6s.._.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_risk_route_actions_0ahnhdi.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_risk_route_actions_0ahnhdi.js");
      case "server/chunks/[root-of-the-server]__01tvjja._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__01tvjja._.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_route_actions_0fzkmsy.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_route_actions_0fzkmsy.js");
      case "server/chunks/[root-of-the-server]__0sd7dny._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0sd7dny._.js");
      case "server/chunks/_next-internal_server_app_api_asset_[assetId]_variants_route_actions_0rxvd5x.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_asset_[assetId]_variants_route_actions_0rxvd5x.js");
      case "server/chunks/[root-of-the-server]__08ic3ux._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__08ic3ux._.js");
      case "server/chunks/_next-internal_server_app_api_curated_route_actions_0nlv4~u.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_curated_route_actions_0nlv4~u.js");
      case "server/chunks/[root-of-the-server]__04zi-4q._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__04zi-4q._.js");
      case "server/chunks/_next-internal_server_app_api_heartbeat_route_actions_0hb-hwo.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_heartbeat_route_actions_0hb-hwo.js");
      case "server/chunks/node_modules_next_04~_e52._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/node_modules_next_04~_e52._.js");
      case "server/chunks/[root-of-the-server]__0tj5gpq._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0tj5gpq._.js");
      case "server/chunks/_next-internal_server_app_api_market-snapshots_route_actions_11jrg10.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_market-snapshots_route_actions_11jrg10.js");
      case "server/chunks/[root-of-the-server]__0of6sag._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0of6sag._.js");
      case "server/chunks/_next-internal_server_app_api_resolve_route_actions_0at_qcr.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_resolve_route_actions_0at_qcr.js");
      case "server/chunks/[root-of-the-server]__0fl.t6g._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0fl.t6g._.js");
      case "server/chunks/_next-internal_server_app_api_search_route_actions_0bffyy~.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_search_route_actions_0bffyy~.js");
      case "server/chunks/[root-of-the-server]__0l-j3l2._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0l-j3l2._.js");
      case "server/chunks/_next-internal_server_app_api_stats_route_actions_0dv_g.a.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_stats_route_actions_0dv_g.a.js");
      case "server/chunks/[root-of-the-server]__04~.mqi._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__04~.mqi._.js");
      case "server/chunks/_next-internal_server_app_api_vote_route_actions_0546a0a.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_vote_route_actions_0546a0a.js");
      case "server/chunks/[root-of-the-server]__05n7xp.._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__05n7xp.._.js");
      case "server/chunks/_next-internal_server_app_api_votes_leaderboard_route_actions_06pxf4h.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_votes_leaderboard_route_actions_06pxf4h.js");
      case "server/chunks/[root-of-the-server]__0o891nq._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0o891nq._.js");
      case "server/chunks/_next-internal_server_app_api_votes_route_actions_00ofh2s.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_votes_route_actions_00ofh2s.js");
      case "server/chunks/[root-of-the-server]__088.9q4._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__088.9q4._.js");
      case "server/chunks/_next-internal_server_app_icon_svg_route_actions_0-0ehc~.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_icon_svg_route_actions_0-0ehc~.js");
      case "server/chunks/[externals]_next_dist_compiled_@vercel_og_index_node_00__rw~.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_compiled_@vercel_og_index_node_00__rw~.js");
      case "server/chunks/[root-of-the-server]__0di~qv5._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0di~qv5._.js");
      case "server/chunks/_next-internal_server_app_opengraph-image_route_actions_0ytso0-.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_opengraph-image_route_actions_0ytso0-.js");
      case "server/chunks/ssr/[root-of-the-server]__0lu.87q._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0lu.87q._.js");
      case "server/chunks/ssr/[root-of-the-server]__0n85898._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0n85898._.js");
      case "server/chunks/ssr/_0.qags7._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_0.qags7._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_09-gtaw.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_09-gtaw.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k5et3c.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0k5et3c.js");
      case "server/chunks/ssr/[root-of-the-server]__01wennj._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__01wennj._.js");
      case "server/chunks/ssr/[root-of-the-server]__0hh0gpa._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hh0gpa._.js");
      case "server/chunks/ssr/_next-internal_server_app_search_page_actions_0koh-tf.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_search_page_actions_0koh-tf.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wmvo46.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wmvo46.js");
      case "server/chunks/ssr/[root-of-the-server]__00a4_ej._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__00a4_ej._.js");
      case "server/chunks/ssr/_next-internal_server_app_stats_page_actions_0znhfu-.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_stats_page_actions_0znhfu-.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0pyy-kr.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0pyy-kr.js");
      case "server/chunks/[root-of-the-server]__139x058._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__139x058._.js");
      case "server/chunks/_next-internal_server_app_token_[assetId]_opengraph-image_route_actions_0j4.4v4.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_token_[assetId]_opengraph-image_route_actions_0j4.4v4.js");
      case "server/chunks/ssr/0_lp_modules_@reown_appkit-scaffold-ui_dist_esm_exports_pay-with-exchange_0671d78.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/0_lp_modules_@reown_appkit-scaffold-ui_dist_esm_exports_pay-with-exchange_0671d78.js");
      case "server/chunks/ssr/0ol-_@noble_curves_esm_secp256k1_0qgs8-o.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/0ol-_@noble_curves_esm_secp256k1_0qgs8-o.js");
      case "server/chunks/ssr/0t6k_@reown_appkit-controllers_dist_esm_src_controllers_SwapController_0v1di3s.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/0t6k_@reown_appkit-controllers_dist_esm_src_controllers_SwapController_0v1di3s.js");
      case "server/chunks/ssr/0t6k_@reown_appkit-scaffold-ui_dist_esm_src_utils_w3m-email-otp-widget_index_0ir2h4y.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/0t6k_@reown_appkit-scaffold-ui_dist_esm_src_utils_w3m-email-otp-widget_index_0ir2h4y.js");
      case "server/chunks/ssr/[root-of-the-server]__00olvxr._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__00olvxr._.js");
      case "server/chunks/ssr/[root-of-the-server]__02j7q1l._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__02j7q1l._.js");
      case "server/chunks/ssr/[root-of-the-server]__0_nk_rf._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0_nk_rf._.js");
      case "server/chunks/ssr/[root-of-the-server]__0f1ate~._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0f1ate~._.js");
      case "server/chunks/ssr/[root-of-the-server]__0lrjw1_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0lrjw1_._.js");
      case "server/chunks/ssr/[root-of-the-server]__10j.cpm._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__10j.cpm._.js");
      case "server/chunks/ssr/_next-internal_server_app_token_[assetId]_page_actions_0ddc43d.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_token_[assetId]_page_actions_0ddc43d.js");
      case "server/chunks/ssr/node_modules_002hw4d._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_002hw4d._.js");
      case "server/chunks/ssr/node_modules_03wa3cz._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_03wa3cz._.js");
      case "server/chunks/ssr/node_modules_085gxm-._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_085gxm-._.js");
      case "server/chunks/ssr/node_modules_0a4y840._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0a4y840._.js");
      case "server/chunks/ssr/node_modules_0nmvgy9._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0nmvgy9._.js");
      case "server/chunks/ssr/node_modules_0uk26sm._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0uk26sm._.js");
      case "server/chunks/ssr/node_modules_0zeja7_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0zeja7_._.js");
      case "server/chunks/ssr/node_modules_0zrdo9l._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0zrdo9l._.js");
      case "server/chunks/ssr/node_modules_13j9i-v._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_13j9i-v._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-rgy6i._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-rgy6i._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-s56q9._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-s56q9._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-yagpx._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0-yagpx._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_00a31n7._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_00a31n7._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_01cxqfu._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_01cxqfu._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_02lzp-y._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_02lzp-y._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_032nwvz._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_032nwvz._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_03u_~0_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_03u_~0_._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_047rm1z._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_047rm1z._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_085v~.-._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_085v~.-._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_09os1lk._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_09os1lk._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0_gdob~._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0_gdob~._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0_uxgxn._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0_uxgxn._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0a-mm-c._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0a-mm-c._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0a8d.wo._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0a8d.wo._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0anz_~_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0anz_~_._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0c-0a3f._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0c-0a3f._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0d0puo_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0d0puo_._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0gaq-tq._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0gaq-tq._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0ieg13w._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0ieg13w._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0kqm1fs._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0kqm1fs._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0llm2cf._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0llm2cf._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0lr8bcw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0lr8bcw._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0mewswh._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0mewswh._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0n-45bo._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0n-45bo._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0n64iaw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0n64iaw._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0pe.j6~._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0pe.j6~._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0prhh.p._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0prhh.p._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0psa5ia._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0psa5ia._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0px0ul8._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0px0ul8._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0q2wj6o._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0q2wj6o._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0q66m~d._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0q66m~d._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0qe6.3z._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0qe6.3z._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0qnwikm._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0qnwikm._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0r8_t2c._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0r8_t2c._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0s-u~xj._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0s-u~xj._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0sms2qc._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0sms2qc._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0tiw__7._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0tiw__7._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0ugxv07._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0ugxv07._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0uh1xjb._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0uh1xjb._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0u~4l0z._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0u~4l0z._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0v33fbw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0v33fbw._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0yab2re._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0yab2re._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0zq.sdc._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0zq.sdc._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0zvagdv._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_0zvagdv._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_105425_._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_105425_._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_10q3hl7._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_10q3hl7._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_11dx7sw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_11dx7sw._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_12o5d_8._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_12o5d_8._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_1372m8u._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_1372m8u._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_1379w.z._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_1379w.z._.js");
      case "server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_13wfzqv._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@phosphor-icons_webcomponents_dist_13wfzqv._.js");
      case "server/chunks/ssr/node_modules_@reown_0kn-qso._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0kn-qso._.js");
      case "server/chunks/ssr/node_modules_@reown_0mtwbr9._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0mtwbr9._.js");
      case "server/chunks/ssr/node_modules_@reown_0olu71v._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0olu71v._.js");
      case "server/chunks/ssr/node_modules_@reown_0oul7dj._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0oul7dj._.js");
      case "server/chunks/ssr/node_modules_@reown_0xnwlze._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0xnwlze._.js");
      case "server/chunks/ssr/node_modules_@reown_0zvj~mt._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_0zvj~mt._.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-controllers_dist_esm_0~.l~ip._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-controllers_dist_esm_0~.l~ip._.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-pay_dist_esm_exports_index_0c.w.ds.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-pay_dist_esm_exports_index_0c.w.ds.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_email_12tkwnw.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_email_12tkwnw.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_embedded-wallet_00nmlou.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_embedded-wallet_00nmlou.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_index_0jbuwc1.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_index_0jbuwc1.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_onramp_05sc8ig.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_onramp_05sc8ig.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_receive_0x75751.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_receive_0x75751.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_send_0vhh74_.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_send_0vhh74_.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_socials_0w3zkks.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_socials_0w3zkks.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_swaps_0h0lw5l.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_swaps_0h0lw5l.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_transactions_13fn~f9.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_transactions_13fn~f9.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_w3m-modal_03sf4_k.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-scaffold-ui_dist_esm_exports_w3m-modal_03sf4_k.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_0.rnc0d._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_0.rnc0d._.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_0wprfb9._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_0wprfb9._.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-image_0ps3~aw.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-image_0ps3~aw.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-token-button_0mp.za1.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-token-button_0mp.za1.js");
      case "server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-visual_0laf2ma.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@reown_appkit-ui_dist_esm_exports_wui-visual_0laf2ma.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0zocfl5.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0zocfl5.js");
      case "server/chunks/ssr/node_modules_viem__esm_0r0i4f4._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_viem__esm_0r0i4f4._.js");
      case "server/chunks/ssr/node_modules_viem__esm_0u2ighw._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_viem__esm_0u2ighw._.js");
      case "server/chunks/ssr/node_modules_viem__esm_index_021ccjf.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_viem__esm_index_021ccjf.js");
      case "server/chunks/ssr/node_modules_viem__esm_utils_ccip_02~hy-l.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_viem__esm_utils_ccip_02~hy-l.js");
      case "server/chunks/ssr/src_app_token_[assetId]_opengraph-image--metadata_13kgbvx.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_token_[assetId]_opengraph-image--metadata_13kgbvx.js");
      case "server/chunks/ssr/src_components_VoteButtons_tsx_0zmn5dr._.js": return require("/private/tmp/tokenshit/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_VoteButtons_tsx_0zmn5dr._.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }
