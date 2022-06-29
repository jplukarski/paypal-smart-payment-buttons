/* @flow */
/** @jsx node */

import { node, type ElementNode } from '@krakenjs/jsx-pragmatic';
import {  LOGO_COLOR, PPLogo } from '@paypal/sdk-logos';
import { FUNDING } from '@paypal/sdk-constants/src';

import { validateButtonProps, type ButtonStyleInputs } from './props';
import { componentStyle } from './styles';
import { CLASS } from './constants';

type ButtonProps = {|
    fundingSource : ?$Values<typeof FUNDING>,
    inputLabel : string,
    style : ButtonStyleInputs,
    locale : {| country: string, lang: string |},
    nonce : string,
|};

type LogoProps = {|
    buttonBackgroundColor : string
|};

const ATTRIBUTE = {
    BUTTON:            ('data-button' : 'data-button'),
    FUNDING_SOURCE:    ('data-funding-source' : 'data-funding-source')
};

// function to render the "PP" abreviated logo
function getPPLogoColor({ buttonBackgroundColor = 'blue' } : LogoProps) : string {

    if (buttonBackgroundColor === 'blue' || buttonBackgroundColor === 'darkblue' || buttonBackgroundColor === 'black') {
        return LOGO_COLOR.WHITE;
    }

    if (buttonBackgroundColor === 'gold' || buttonBackgroundColor === 'white' || buttonBackgroundColor === 'silver') {
        return LOGO_COLOR.BLUE;
    }

    throw new Error(`Unsupported color (PP logo): ${ buttonBackgroundColor }`);

}

// $FlowFixMe
export function AuthButton(props : ButtonProps) : ElementNode {
    const { fundingSource, style,  env, nonce, buttonText } = validateButtonProps(props);
    const { shape, color } = style;
    return (
        <div class={ [
            CLASS.CONTAINER,
            `${ CLASS.SHAPE }-${ shape }`,
            `${ CLASS.ENV }-${ env }`
        ].join(' ') }>
            <style nonce={ nonce } innerHTML={ componentStyle() } />
            <div
             role='button'
             { ...{
                   [ATTRIBUTE.BUTTON]:         true,
                   [ATTRIBUTE.FUNDING_SOURCE]: fundingSource
             } }
             class={ [
                 CLASS.BUTTON,
                 `${ CLASS.SHAPE }-${ shape }`,
                 `${ CLASS.ENV }-${ env }`,
                 `${ CLASS.COLOR }-${ color }`,
                 `${ CLASS.TEXT_COLOR }-white`
             ].join(' ') }
             tabindex='0'>
                <div class={ CLASS.BUTTON_LABEL }>
                    <PPLogo logoColor={ getPPLogoColor({ buttonBackgroundColor: color }) } />
                    <span class={CLASS.TEXT}>{ buttonText }</span>
                </div>
            </div>
        </div>
    );
}
