/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { wrapPromise } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { FUNDING } from '@paypal/sdk-constants/src';

import { mockSetupButton, generateOrderID, mockAsyncProp, createButtonHTML, mockFunction, clickButton } from './mocks';

describe('payment field cases', () => {
    it('should render a button, click the button, and render payment-fields', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {
            const orderID = generateOrderID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onCancel = avoid('onCancel');

            window.xprops.onApprove = avoid('onApprove');

            mockFunction(window.paypal, 'PaymentFields', expect('PaymentFields', ({ original: PaymentFieldsOriginal, args: [ props ] }) => {
                const onContinueData = {
                    payment_source: {
                        'eps': {
                            country_code: 'AT',
                            name: 'Jane Doe',
                        },
                    }
                }

                mockFunction(props, 'onContinue', expect('onContinue', ({ original: onContinueOriginal }) => {
                    return onContinueOriginal({ ...onContinueData });
                }));

                const paymentFieldsInstance = PaymentFieldsOriginal(props);

                mockFunction(paymentFieldsInstance, 'render', expect('render', async ({ original: renderToOriginal, args }) => {
                    return renderToOriginal(...args);
                }));

                return paymentFieldsInstance;
            }));

            const fundingEligibility = {
                [ FUNDING.PAYPAL ]: {
                    eligible: true
                },
                [ FUNDING.EPS]: {
                    eligible: true
                }
            };

            createButtonHTML({ fundingEligibility });

            await mockSetupButton({ merchantID: [ 'XYZ12345' ], fundingEligibility, buyerCountry: 'AT' });

            await clickButton(FUNDING.EPS);
        });
    });
});
