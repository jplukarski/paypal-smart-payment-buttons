/* @flow */
/** @jsx node */

import { html } from '@krakenjs/jsx-pragmatic';
import { FUNDING } from '@paypal/sdk-constants/src';

import { AuthButton } from './button';

export type htmlTemplateProps = {|
    fundingSource : ?$Values<typeof FUNDING>,
    inputLabel : string,
    locale : Object,
    cspNonce : string,
    style : Object,
    clientID : string,
    scopes : string,
    returnUrl : string,
    sdkMeta : Object,
    responseType : string
|};

export const htmlTemplate = ({
    fundingSource,
    locale,
    inputLabel = 'logIn',
    cspNonce,
    style,
    clientID,
    scopes,
    returnUrl,
    sdkMeta,
    responseType
} : htmlTemplateProps) : string => (
    `<!DOCTYPE html style="height:100%;">
    <head>
    ${ sdkMeta.getSDKLoader({ nonce: cspNonce }) }
    </head>
    <body data-nonce="${ cspNonce }" data-client-version="1.1.1" data-render-version="1.1.1">
    ${ AuthButton({ style , nonce: cspNonce, locale, inputLabel, fundingSource }).render(html()) }
    <script nonce="${ cspNonce }">
     function mClickHandler () {
             function onApproveHandler(data) {
                 // call windows.xprops.onApprove and close the window
                 window.xprops.onApprove(data).then(function() {
                     popUpClose(); // close the pop-up
                 });
             }

             function onCancelHandler(data) {
                 // call windows.xprops.onCancel and close the window
                 window.xprops.onCancel(data).then(function() {
                     popUpClose(); // close the pop-up
                 });
             }

             var authWindow = window.paypal.Auth({
                 client_id: '${ clientID }',
                 scope: '${ scopes }',
                 redirect_uri: '${ returnUrl }',
                 nonce: '${ cspNonce }',
                 sdkMeta: '${ sdkMeta }',
                 responseType: '${ responseType }',
                 onApprove: onApproveHandler,
                 onCancel: onCancelHandler,
             });
        // save the pop-up "method" into local var
        var popUpClose = authWindow.close;
        authWindow.renderTo(window.parent);
    }
    document.querySelector('.paypal-auth-button').addEventListener('click', mClickHandler);
    document.querySelector('.paypal-auth-button').addEventListener('keydown', function (event) {
             if (event.isComposing || event.keyCode === 229) {
                   return;
             }
           if (event.keyCode === 13 || event.keyCode === 32) {
              mClickHandler(event);
           }
    }
        </script>
    </body>
    `
);
