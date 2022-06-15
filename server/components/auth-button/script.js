/* @flow */
import { join, dirname } from 'path';

import { importDependency } from '@krakenjs/grabthar'

import type { CacheType, SDKVersionManager } from '../../types';
import {
    BUTTON_RENDER_JS,
    WEBPACK_CONFIG,
    IDENTITY_COMPONENTS_MODULE
} from '../../config';
import {
    isLocalOrTest,
    compileWebpack,
    babelRequire,
    evalRequireScript,
    resolveScript,
    dynamicRequire,
    type LoggerBufferType
} from '../../lib';

type GetPayPalAuthButtonsRenderScriptOptions = {|
    logBuffer : ?LoggerBufferType,
    cache : ?CacheType,
    useLocal? : boolean,
    sdkCDNRegistry : ?string,
    sdkVersionManager : SDKVersionManager
|};

export type AuthButtonRenderScript = {|
    AuthButton : ({||}) => {|
        // eslint-disable-next-line no-undef
        render : <T>(() => T) => T
    |},
    validateButtonProps : ({||}) => void
|}

export async function getLocalPayPalAuthButtonsRenderScript() : Promise<?AuthButtonRenderScript> {
    const webpackScriptPath = resolveScript(join(IDENTITY_COMPONENTS_MODULE, WEBPACK_CONFIG));

    if (webpackScriptPath && isLocalOrTest()) {
        const dir = dirname(webpackScriptPath);
        const { WEBPACK_CONFIG_BUTTON_RENDER } = babelRequire(webpackScriptPath);
        return evalRequireScript(await compileWebpack(WEBPACK_CONFIG_BUTTON_RENDER, dir));
    }

    const distScriptPath = resolveScript(join(IDENTITY_COMPONENTS_MODULE, BUTTON_RENDER_JS));

    if (distScriptPath) {
        return Promise.resolve(dynamicRequire(distScriptPath));
    }

    return Promise.resolve()
}

export async function getPayPalAuthButtonsRenderScript({ useLocal, logBuffer, cache, sdkCDNRegistry, sdkVersionManager }  : GetPayPalAuthButtonsRenderScriptOptions) : Promise<AuthButtonRenderScript> {
    if (useLocal) {
        const script = await getLocalPayPalAuthButtonsRenderScript();
        if (script) {
            return script;
        }
    }

    const moduleDetails = await sdkVersionManager.getOrInstallSDK({
        cdnRegistry:  sdkCDNRegistry || '',
        childModules: [ IDENTITY_COMPONENTS_MODULE ],
        flat:         true,
        dependencies: true,
        logger:       logBuffer,
        cache
    })

    return importDependency({
        moduleDetails,
        dependencyName: IDENTITY_COMPONENTS_MODULE,
        path:  'dist/button.js'
    });
}
