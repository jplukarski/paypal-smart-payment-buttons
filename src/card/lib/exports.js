/* @flow */

import { FRAME_NAME } from '../../constants';

export type ExportsOptions = {|
    name : $Values<typeof FRAME_NAME>,
    isFieldValid : () => boolean,
    isFieldPotentiallyValid : () => boolean,
    isFieldFocused : () => boolean,
    // eslint-disable-next-line no-undef
    getFieldValue : <T>() => T,
    getContainer : () => any,
    setGqlErrors : ({| field : string, errors : [] |}) => void,
    resetGQLErrors : () => void
|};

export type CardExports<V> = {|
    name : $Values<typeof FRAME_NAME>,
    isFieldValid : () => boolean,
    isFieldPotentiallyValid : () => boolean,
    isFieldFocused: () => boolean,
    getFieldValue : () => V,
    getContainer : () => any,
    setGqlErrors : ({| field : string, errors : [] |}) => void,
    resetGQLErrors : () => void
|};

export function setupExports<T>({ name, isFieldValid, isFieldFocused, isFieldPotentiallyValid, getFieldValue, setGqlErrors, getContainer, resetGQLErrors } : ExportsOptions) {
    const xports : CardExports<T> = {
        name,
        isFieldValid,
        isFieldPotentiallyValid,
        isFieldFocused,
        getFieldValue,
        getContainer,
        setGqlErrors,
        resetGQLErrors
    };

    window.exports = xports;
}
