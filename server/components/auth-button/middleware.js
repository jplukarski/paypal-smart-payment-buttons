/* @flow */

import { clientErrorResponse, htmlResponse, allowFrame, defaultLogger, sdkMiddleware, getCSPNonce, type ExpressMiddleware, isLocalOrTest } from '../../lib';
import type { LoggerType, CacheType, ExpressRequest, InstanceLocationInformation, SDKLocationInformation, SDKVersionManager } from '../../types';

import { htmlTemplate } from './htmlTemplate';


type AuthButtonMiddlewareOptions = {|
    logger : LoggerType,
    cache : CacheType,
|};

export function getAuthButtonMiddleware({
    logger = defaultLogger,
    cache,
} : AuthButtonMiddlewareOptions) : ExpressMiddleware {
    return sdkMiddleware({ logger, cache }, {
        app: ({ req, res, params, meta }) => {
            try {
                const cspNonce = getCSPNonce(res);
                const {
                    inputLabel,
                    scopes,
                    buttonType,
                    responseType,
                    clientID,
                    returnurl,
                    customLabel,
                    style = {}
                } = params;

                const locale = {
                    country: req.headers['accept-language'].split(',')[0].split('-')[1],
                    lang: req.headers['accept-language'].split(',')[0].split('-')[0]
                }

                if (!clientID) {
                    logger.info(req, 'smart_buttons_render');
                    return clientErrorResponse(res, 'Please provide a clientID query parameter');
                }
                logger.info(req, `auth_button clientID: ${clientID}`);
                const pageHTML = htmlTemplate({
                    inputLabel,
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
            } catch(e){
                logger.error(req, e.message)
                return clientErrorResponse(res, `Server error: ${e.message}`);
            }

        }
    });
}
