/* @flow */
/** @jsx node */

import { node, type ElementNode, type ComponentNode } from '@krakenjs/jsx-pragmatic';
import {  LOGO_COLOR, PPLogo } from '@paypal/sdk-logos';

import { validateButtonProps, type ButtonStyleType, type ButtonPropsInputs } from './props';
import { componentStyle } from './styles';
import { CLASS } from './constants';

type ButtonProps = ButtonPropsInputs & {|
    onClick? : Function
|};

type LogoProps = {|
    buttonBackgroundColor : ButtonStyleType
|};

const ATTRIBUTE = {
    BUTTON:            ('data-button' : 'data-button'),
    FUNDING_SOURCE:    ('data-funding-source' : 'data-funding-source')
};

// function to render the "PP" abreviated logo
function PPSymbol({ buttonBackgroundColor = 'blue' } : LogoProps) : ComponentNode<LogoProps> {

    if (buttonBackgroundColor === 'blue' || buttonBackgroundColor === 'darkblue' || buttonBackgroundColor === 'black') {
        return <PPLogo logoColor={ LOGO_COLOR.WHITE } />;
    }

    if (buttonBackgroundColor === 'gold' || buttonBackgroundColor === 'white' || buttonBackgroundColor === 'silver') {
        return <PPLogo logoColor={ LOGO_COLOR.BLUE } />;
    }

    throw new Error(`Unsupported color (PP logo): ${ buttonBackgroundColor }`);

}

export function AuthButton(props : ButtonProps) : ElementNode {
    const { fundingSource, style,  env, nonce, buttonText, onClick } = validateButtonProps(props);
    const { shape, color } = style;
    const clickHandler = (event, opts) => {
        event.preventDefault();
        event.stopPropagation();
        event.target.blur();

        onClick(event, { fundingSource, ...opts });
    };

    const keypressHandler = (event, opts) => {
        if (event.keyCode === 13 || event.keyCode === 32) {
            clickHandler(event, opts);
        }
    };
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
             onClick={ clickHandler }
             onKeyPress={ keypressHandler }
             tabindex='0'>
                <div class={ CLASS.BUTTON_LABEL }>
                    <PPSymbol buttonBackgroundColor={color} />
                    <span class={CLASS.TEXT}>{ buttonText }</span>
                </div>
            </div>
        </div>
    );
}
