/* @flow */
import { htmlResponse, allowFrame, defaultLogger, sdkMiddleware, getCSPNonce, type ExpressMiddleware, isLocalOrTest } from '../../lib';
import type { LoggerType, CacheType, ExpressRequest, InstanceLocationInformation, SDKLocationInformation, SDKVersionManager } from '../../types';

import { getPayPalAuthButtonsRenderScript } from './script';
import { htmlTemplate } from './htmlTemplate';


type AuthButtonMiddlewareOptions = {|
    logger : LoggerType,
    cache : CacheType,
    getSDKLocationInformation : (req : ExpressRequest, env : string) => Promise<SDKLocationInformation>,
    getInstanceLocationInformation : () => InstanceLocationInformation,
    sdkVersionManager: SDKVersionManager
|};

export function getAuthButtonMiddleware({
    logger = defaultLogger,
    cache,
    getSDKLocationInformation,
    getInstanceLocationInformation,
    sdkVersionManager
} : AuthButtonMiddlewareOptions) : ExpressMiddleware {
    const locationInformation = getInstanceLocationInformation();
    const useLocal = isLocalOrTest();

    return sdkMiddleware({ logger, cache, locationInformation }, {
        app: async ({ req, res, params, meta, logBuffer }) => {
            const cspNonce = getCSPNonce(res);
            const {
                scopes,
                buttonType,
                responseType,
                clientID,
                returnurl,
                customLabel,
                locale,
                style = {}
            } = params;

            logger.info(req, `auth_button: ${clientID}`);
            const sdkLocationInformation = await getSDKLocationInformation(req, params.env);
            const script = await getPayPalAuthButtonsRenderScript({
                useLocal,
                logBuffer,
                cache,
                sdkCDNRegistry: sdkLocationInformation.sdkCDNRegistry,
                sdkVersionManager,
            });
            const sdkVersion = sdkVersionManager.getLiveVersion()
            logger.info(req, `auth_button_version_${sdkVersion}`);
            const pageHTML = htmlTemplate({
                AuthButton: script.AuthButton,
                locale,
                buttonType,
                cspNonce,
                style,
                customLabel,
                clientID,
                scopes,
                returnUrl: returnurl,
                sdkMeta:   meta,
                responseType
            });
            allowFrame(res);
            return htmlResponse(res, pageHTML);
        }
    });
}
