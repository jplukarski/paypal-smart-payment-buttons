/* @flow */
/** @jsx h */

import { h, render, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import EventEmitter from '@braintree/event-emitter';

import { getBody } from '../../lib';
import { setupExports, autoFocusOnFirstInput, filterExtraFields } from '../lib';
import { CARD_FIELD_TYPE_TO_FRAME_NAME, CARD_FIELD_TYPE } from '../constants';
import { submitCardFields, getCardFieldState } from '../interface';
import { getCardProps, type CardProps } from '../props';
import type { SetupCardOptions} from '../types';
import type {FeatureFlags } from '../../types'

import { CardField, CardNumberField, CardCVVField, CardExpiryField, CardNameField, CardPostalCodeField } from './fields';
import { eventEmitter } from '@krakenjs/belter/src';

type PageProps = {|
    cspNonce : string,
    props : CardProps,
    featureFlags: FeatureFlags
|};

function Page({ cspNonce, props, featureFlags } : PageProps) : mixed {
    const { facilitatorAccessToken, style, disableAutocomplete, placeholder, type, onChange, export: xport, minLength, maxLength } = props;

    const [ fieldValue, setFieldValue ] = useState();
    const [ fieldValid, setFieldValid ] = useState(false);
    const [ fieldPotentiallyValid, setFieldPotentiallyValid] = useState(true);
    const [cardTypes, setCardTypes] = useState([]);
    const [fieldFocus, setFieldFocus ] = useState(false);
    const [ fieldErrors, setFieldErrors ] = useState([]);
    const [ mainRef, setRef ] = useState();
    const [ eventEmitter, setEventEmitter ] = useState(new EventEmitter())
    const [ fieldGQLErrors, setFieldGQLErrors ] = useState({ singleField: {}, numberField: [], expiryField: [], cvvField: [], nameField: [], postalCodeField: [] });
    const initialRender = useRef(true)

    let autocomplete;
    if (disableAutocomplete) {
        autocomplete = 'off';
    }

    const getFieldValue = () => {
        return fieldValue;
    };

    const isFieldValid = () => {
        return fieldValid;
    };

    const isFieldPotentiallyValid = () => {
        return fieldPotentiallyValid
    }

    const isFieldFocused = () => {
        return fieldFocus;
    }

    const getPotentialCardTypes = () => {
        return cardTypes
    }

    const setGqlErrors = (errorData : {| field : string, errors : [] |}) => {
        const { errors } = errorData;

        const errorObject = { ...fieldGQLErrors };

        if (type === CARD_FIELD_TYPE.SINGLE) {
            errorObject.singleField = { ...errorData };
        } else if (errors && errors.length) {
            switch (type) {
            case CARD_FIELD_TYPE.NUMBER:
                errorObject.numberField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.EXPIRY:
                errorObject.expiryField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.CVV:
                errorObject.cvvField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.NAME:
                errorObject.nameField = [ ...errors ];
                break;
            case CARD_FIELD_TYPE.POSTAL:
                errorObject.postalCodeField = [ ...errors ];
                break;
            default:
                break;
            }
        }

        setFieldGQLErrors(errorObject);
    };

    const resetGQLErrors = () => {
        setFieldGQLErrors({ singleField: {}, numberField: [], expiryField: [], cvvField: [], nameField: [], postalCodeField: [] });
    };

    useEffect(() => {
        // useEffect is fired on first render as well as when
        // any value in the depenency array has changed. We
        // only want to fire off the onChange event if the
        // validity changes after the first render. So in
        // order to do that we add this guard to not noop
        // when the component first renders. We leverage
        // useRef to store the value of initialRender as
        // we want that to persist across re-renders.
        // See: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
        if ( initialRender.current ) {
            initialRender.current = false
        } else if(typeof onChange === 'function') {
            onChange({
                isValid: fieldValid,
                errors: fieldErrors
            });
        }
    }, [ fieldValid ]);

    useEffect(() => {
        autoFocusOnFirstInput(mainRef);
    }, [ mainRef ]);

    useEffect(() => {
        setupExports({
            name: CARD_FIELD_TYPE_TO_FRAME_NAME[type],
            isFieldPotentiallyValid,
            getPotentialCardTypes,
            isFieldValid,
            isFieldFocused,
            getFieldValue,
            setGqlErrors,
            resetGQLErrors
        });

        xport({
            submit: (extraData) => {
                const extraFields = filterExtraFields(extraData);
                return submitCardFields({ facilitatorAccessToken, extraFields, featureFlags });
            },
            getState: () => {
                return getCardFieldState()
            },
            on: (event, handler) => {
                console.log('Subscribed to event: ', eventEmitter)
                eventEmitter.on("focus", (data) => {
                    console.log('data', data)
                    handler(data)
                })
            }
        });
    }, [ fieldValid, fieldValue, fieldFocus, fieldPotentiallyValid, cardTypes, eventEmitter ]);

    const onFieldChange = ({ value, valid, isFocused, potentiallyValid, errors, potentialCardTypes }) => {
        setFieldValue(value);
        setFieldErrors([ ...errors ]);
        setFieldFocus(isFocused)
        setFieldValid(valid);
        setFieldPotentiallyValid(potentiallyValid);
        resetGQLErrors();
        setCardTypes(potentialCardTypes);
    };

    return (
        <Fragment>
            {
                (type === CARD_FIELD_TYPE.SINGLE)
                    ? <CardField
                            gqlErrorsObject={ fieldGQLErrors.singleField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.NUMBER)
                    ? <CardNumberField
                            emitter={eventEmitter}
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.numberField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.CVV)
                    ? <CardCVVField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.cvvField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.EXPIRY)
                    ? <CardExpiryField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.expiryField }
                            cspNonce={ cspNonce }
                            autocomplete={ autocomplete }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.NAME)
                    ? <CardNameField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.nameField }
                            cspNonce={ cspNonce }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.POSTAL)
                    ? <CardPostalCodeField
                            ref={ mainRef }
                            gqlErrors={ fieldGQLErrors.postalCodeField }
                            cspNonce={ cspNonce }
                            onChange={ onFieldChange }
                            styleObject={ style }
                            placeholder={ placeholder }
                            minLength={ minLength }
                            maxLength={ maxLength || 10}
                            autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }
        </Fragment>
    );
}

export function setupCard({ cspNonce, facilitatorAccessToken, featureFlags } : SetupCardOptions) {
    const props = getCardProps({
        facilitatorAccessToken,
        featureFlags
    });

    render(<Page cspNonce={ cspNonce } props={ props } featureFlags={featureFlags} />, getBody());
}
