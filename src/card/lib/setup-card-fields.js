/* @flow */
/** @jsx h */

import { h, render } from 'preact';

import type { SetupCardOptions} from '../types';
import { setupCardLogger } from '../logger';
import { getCardProps, type CardProps } from '../props';
import { getBody } from '../../lib';
import 


export function setupCard({ cspNonce, facilitatorAccessToken, featureFlags, buyerCountry, metadata } : SetupCardOptions) {
    const props = getCardProps({
        facilitatorAccessToken,
        featureFlags
    });
    const {
        env,
        sessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        locale,
        merchantID,
        merchantDomain,
        cardSessionID,
        type,
    } = props;

    setupCardLogger({
        env,
        sessionID,
        cardSessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        cardCorrelationID: metadata.correlationID,
        locale,
        merchantID,
        merchantDomain,
        buyerCountry,
        type
    })

    render(<Page cspNonce={ cspNonce } props={ props } featureFlags={featureFlags} />, getBody());
}

export function setupCardInputField({ cspNonce, facilitatorAccessToken, featureFlags, buyerCountry, metadata } : SetupCardOptions) {
    const props = getCardProps({
        facilitatorAccessToken,
        featureFlags
    });
    const {
        env,
        sessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        locale,
        merchantID,
        merchantDomain,
        cardSessionID,
        type,
    } = props;

    setupCardLogger({
        env,
        sessionID,
        cardSessionID,
        clientID,
        partnerAttributionID,
        sdkCorrelationID,
        cardCorrelationID: metadata.correlationID,
        locale,
        merchantID,
        merchantDomain,
        buyerCountry,
        type
    })

    render(<Page cspNonce={ cspNonce } props={ props } featureFlags={featureFlags} />, getBody());
}