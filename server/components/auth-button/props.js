/* @flow */
/** @jsx node */

import { values } from '@krakenjs/belter';
import { FUNDING, PLATFORM, ENV, INTENT, LANG, COUNTRY, COUNTRY_LANGS } from '@paypal/sdk-constants';

import { selectLocalizedText } from './locales';

const SUPPORTED_FUNDING_SOURCES = Object.keys(FUNDING).map(fk => FUNDING[fk]);

export const BUTTON_LABEL = {
    CONNECT:     ('connect' : 'connect')
};

export const BUTTON_COLOR = {
    GOLD:        ('gold' : 'gold'),
    BLUE:        ('blue' : 'blue'),
    DARKBLUE:    ('darkblue' : 'darkblue'),
    SILVER:      ('silver' : 'silver'),
    WHITE:      ('white' : 'white'),
    BLACK:      ('black' : 'black')
};

export const TEXT_COLOR = {
    BLACK:   ('black' : 'black'),
    WHITE:   ('white' : 'white'),
    DEFAULT: ('default' : 'default')
};

export const BUTTON_SHAPE = {
    PILL: ('pill' : 'pill'),
    RECT: ('rect' : 'rect')
};

export type ButtonStyleType = {|
    color : $Values<typeof BUTTON_COLOR>,
    shape : $Values<typeof BUTTON_SHAPE>,
    height? : number
|};

export type ButtonStyleInputs = {|
    label? : $PropertyType<ButtonStyleType, 'label'> | void,
    color? : $PropertyType<ButtonStyleType, 'color'> | void,
    shape? : $PropertyType<ButtonStyleType, 'shape'> | void,
    height? : $PropertyType<ButtonStyleType, 'height'> | void
|};


type ValidateButtonPropsReturnValue = {|
    buttonText : string,
    style : ButtonStyleType,
    fundingSource : ?$Values<typeof FUNDING>,
    env : $Values<typeof ENV>,
    stage? : string,
    stageUrl? : string,
    platform : $Values<typeof PLATFORM>,
    nonce : string,
    content : string,
|};

type ValidateButtonPropsInput = {|
    fundingSource : $Values<typeof FUNDING>,
    inputLabel : string,
    style : ButtonStyleInputs,
    locale : {| country: string, lang: string |},
    nonce : string,
    |};


export const DEFAULT_PROPS = {
    LOCALE:   {
        country: COUNTRY.US,
        lang:    LANG.EN
    },
    INTENT:   INTENT.CAPTURE,
    ENV:      ENV.PRODUCTION,
    PLATFORM: PLATFORM.DESKTOP
};

export const DEFAULT_STYLE = {
    COLOR:  BUTTON_COLOR.BLUE,
    SHAPE:  BUTTON_SHAPE.PILL
};

const ALLOWED_SHAPES = values(BUTTON_SHAPE);
const ALLOWED_COLORS = [ BUTTON_COLOR.BLACK, BUTTON_COLOR.BLUE, BUTTON_COLOR.DARKBLUE, BUTTON_COLOR.GOLD, BUTTON_COLOR.SILVER, BUTTON_COLOR.WHITE ];
const COUNTRIES = values(COUNTRY);
const PLATFORMS = values(PLATFORM);

const allowedBackgroundColors = (buttonBackgroundColor, fundingSource : string  = FUNDING.PAYPAL) => {
    const defaultButtonBackgroundColor = fundingSource === FUNDING.CREDIT ? BUTTON_COLOR.DARKBLUE : BUTTON_COLOR.BLUE;
    const colors = {
        base: ALLOWED_COLORS,
        [FUNDING.PAYPAL]: ALLOWED_COLORS,
        [FUNDING.CREDIT]: [ BUTTON_COLOR.DARKBLUE ],
    }
    const ac = colors[fundingSource] || colors.base;
    return ac.includes(buttonBackgroundColor || defaultButtonBackgroundColor);
}

export function validateButtonStyle(style : ButtonStyleInputs, fundingSource : string = FUNDING.PAYPAL) : ButtonStyleType {

    if (!style) {
        throw new Error(`Expected props.style to be set`);
    }

    const {
        color = BUTTON_COLOR.BLUE,
        shape = BUTTON_SHAPE.PILL,
        height = 35,
    } = style;

    if (!allowedBackgroundColors(color, fundingSource)) {
        throw new Error(`Unexpected style.color for ${ fundingSource } button: ${ color }, expected ${ ALLOWED_COLORS.join(', ') }`);
    }

    if (!ALLOWED_SHAPES.includes(shape)) {
        throw new Error(`Unexpected style.shape for ${ fundingSource } button: ${ shape }, expected ${ ALLOWED_SHAPES.join(', ') }`);
    }

    if (height !== undefined) {
        if (typeof height !== 'number') {
            throw new TypeError(`Expected style.height to be a number, got: ${ height }`);
        }

        const [ minHeight, maxHeight ] = [ 35, 50 ];

        if (height < minHeight || height > maxHeight) {
            throw new Error(`Expected style.height to be between ${ minHeight }px and ${ maxHeight }px - got ${ height }px`);
        }
    }
    return { color, shape, height };
}

export function validateButtonProps(props : ?ValidateButtonPropsInput) : ValidateButtonPropsReturnValue {
    if (!props) {
        throw new Error(`Expected props`);
    }
    const {
        fundingSource = FUNDING.PAYPAL,
        style,
        nonce,
        content = '',
        platform = DEFAULT_PROPS.PLATFORM,
        locale = DEFAULT_PROPS.LOCALE
    } = props;

    const warnings = [];
    if (!locale.country || !COUNTRIES.includes(locale.country)) {
        warnings.push(`Expected valid country, got ${ locale.country }`);
    }

    if (!locale.lang || !COUNTRY_LANGS[locale.country]?.includes(locale.lang)) {
        warnings.push(`Expected valid lang, got ${ locale.lang }`);
    }

    if (!PLATFORMS.includes(platform)) {
        throw new Error(`Expected valid platform, got ${ platform }`);
    }

    if (fundingSource) {
        if (!SUPPORTED_FUNDING_SOURCES.includes(fundingSource)) {
            throw new Error(`Invalid funding source: ${ fundingSource }`);
        }
    }

    return {
        fundingSource: props.fundingSource,
        buttonText: selectLocalizedText({ inputLabel: props.inputLabel, locale: `${locale.lang}-${locale.country}`}),
        style: validateButtonStyle(style, props.fundingSource),
        platform,
        nonce,
        content,
        env: 'production',
    };
}
