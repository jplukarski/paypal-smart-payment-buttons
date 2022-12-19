/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { FUNDING, CARD, type FundingEligibilityType } from '@paypal/sdk-constants/src';
import { EXPERIENCE } from '@paypal/checkout-components/src/constants/button';

import type { ProxyWindow, FeatureFlags } from '../types';
import { getProps, type XProps, type Props } from '../props/props';

import type { CardStyle, CardPlaceholder, CardFieldsState, ParsedCardType, FieldsState } from './types';
import { CARD_FIELD_TYPE, CARD_ERRORS } from './constants';

// export something to force webpack to see this as an ES module
export const TYPES = true;

export type PrerenderDetailsType = {|
    win? : ?ProxyWindow,
    fundingSource : $Values<typeof FUNDING>,
    card? : ?$Values<typeof CARD>
|};

export type CardExport = ({|
    submit : () => ZalgoPromise<void>,
    getState : () => CardFieldsState
|}) => ZalgoPromise<void>;

export type OnChange = ({|
    potentialCardTypes : $ReadOnlyArray<ParsedCardType>,
    isValid : boolean,
    emittedBy: string,
    fields: FieldsState,
    errors : [$Values<typeof CARD_ERRORS>] | []
|}) => ZalgoPromise<void>;

export type OnFocus = ({|
message : string,
|}) => ZalgoPromise<void>;

export type CardXProps = {|
    ...XProps,

    type : $Values<typeof CARD_FIELD_TYPE>,
    style : CardStyle,
    placeholder : CardPlaceholder,
    minLength? : number,
    maxLength? : number,
    cardSessionID : string,
    fundingEligibility : FundingEligibilityType,
    onChange : OnChange,
    onFocusCallback : OnFocus,
    onBlur : OnFocus,
    export : CardExport,
    parent? : {|
        props : XProps,
        export : CardExport
    |}
|};

export type CardProps = {|
    ...Props,

    type : $Values<typeof CARD_FIELD_TYPE>,
    branded : boolean,
    style : CardStyle,
    placeholder : CardPlaceholder,
    minLength? : number,
    maxLength? : number,
    cardSessionID : string,
    inlinexo : boolean,
    fundingEligibility : FundingEligibilityType,
    export : CardExport,
    onChange : OnChange,
    onFocusCallback: OnFocus,
    onBlur: OnFocus,
    facilitatorAccessToken : string,
    disableAutocomplete? : boolean
|};

type GetCardPropsOptions = {|
    facilitatorAccessToken : string,
    featureFlags: FeatureFlags
|};

export function getCardProps({ facilitatorAccessToken, featureFlags } : GetCardPropsOptions) : CardProps {
    const xprops : CardXProps = window.xprops;

    const {
        type,
        cardSessionID,
        style,
        placeholder,
        minLength,
        maxLength,
        fundingEligibility,
        onChange,
        onFocusCallback,
        onBlur,
        branded = fundingEligibility?.card?.branded ?? true,
        parent,
        experience,
        export: xport
    } = xprops;

    const props = getProps({ facilitatorAccessToken, branded, paymentSource: null, featureFlags });

    return {
        ...props,
        type,
        branded,
        style,
        placeholder,
        minLength,
        maxLength,
        cardSessionID,
        fundingEligibility,
        onChange,
        onFocusCallback,
        onBlur,
        inlinexo: experience === EXPERIENCE.INLINE,
        export:   parent ? parent.export : xport,
        facilitatorAccessToken
    };
}
