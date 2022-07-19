/* @flow */

import { clientErrorResponse, htmlResponse, allowFrame, defaultLogger, sdkMiddleware, getCSPNonce, type ExpressMiddleware } from '../../lib';
import type { LoggerType, CacheType } from '../../types';

import { htmlTemplate } from './htmlTemplate';

type AuthButtonMiddlewareOptions = {|
    logger : LoggerType,
    cache : CacheType,
|};

export function getAuthButtonMiddleware({
    logger = defaultLogger,
    cache,
} : AuthButtonMiddlewareOptions) : ExpressMiddleware {
    const locationInformation = {
        cdnHostName:  'string',
        paypalDomain: 'string'
    };
    return sdkMiddleware({ logger, cache, locationInformation }, {
        app: ({ req, res, params, meta }) => {
            try {
                const cspNonce = getCSPNonce(res);
                const {
                    fundingSource,
                    inputLabel,
                    scopes,
                    responseType,
                    clientID,
                    returnurl,
                    style = {}
                } = params;

                const locale = {
                    country: req.headers['accept-language'] && req.headers['accept-language'].split(',')[0].split('-')[1],
                    lang: req.headers['accept-language'] && req.headers['accept-language'].split(',')[0].split('-')[0]
                }

                if (!clientID) {
                    logger.info(req, 'smart_buttons_render');
                    return clientErrorResponse(res, 'Please provide a clientID query parameter');
                }
                logger.info(req, `auth_button clientID: ${clientID}`);
                const pageHTML = htmlTemplate({
                    fundingSource,
                    inputLabel,
                    locale,
                    cspNonce,
                    style,
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
