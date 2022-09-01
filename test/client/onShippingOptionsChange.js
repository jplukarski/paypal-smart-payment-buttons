/* @flow */
/* eslint require-await: off, max-lines: off, max-nested-callbacks: off */

import { wrapPromise, uniqueID } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { FUNDING, COUNTRY } from '@paypal/sdk-constants/src';

import {
    mockAsyncProp,
    createButtonHTML,
    getGraphQLApiMock,
    DEFAULT_FUNDING_ELIGIBILITY,
    mockFunction,
    clickButton,
    mockSetupButton
} from './mocks';

describe('onShippingOptionsChange', () => {
    const amount = {
        currency_code: 'USD',
        value: '200.00',
        breakdown: {
          item_total: {
            currency_code: 'USD',
            value: '180.00'
          },
          shipping: {
            currency_code: 'USD',
            value: '5.00'
          },
          handling: {
            currency_code: 'USD',
            value: '1.00'
          },
          tax_total: {
            currency_code: 'USD',
            value: '20.00'
          },
          discount: {
            currency_code: 'USD',
            value: '10.00'
          }
        }
    };

    const selected_shipping_option = {
        id: 'SHIP_123',
        label: 'Shipping',
        type: 'SHIPPING',
        amount: {
            value: '20.00',
            currency_code: 'USD'
        }
    };

    const discount = '-10.00';

    const options = [
        {
            id: 'SHIP_1234',
            label: 'Free Shipping',
            type: 'SHIPPING',
            selected: true,
            amount: {
                value: '0.00',
                currency_code: 'USD'
            }
        },
        {
            id: 'SHIP_123',
            label: 'Shipping',
            type: 'SHIPPING',
            selected: false,
            amount: {
                value: '20.00',
                currency_code: 'USD'
            }
        },
        {
            id: 'SHIP_124',
            label: 'Overnight',
            type: 'SHIPPING',
            selected: false,
            amount: {
                value: '40.00',
                currency_code: 'USD'
            }
        }
    ];

    it('should render a button, click the button, and render checkout, then pass onShippingOptionsChange callback to the parent with shipping methods in the checkout session and have SDK patch for client-side integrations', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            const getCheckoutDetails = getGraphQLApiMock({
                extraHandler: expect('upgradeLSATGQLCall', ({ data }) => {

                    if (data.query.includes('query GetCheckoutDetails')) {
                        return {
                            data: {
                                checkoutSession: {
                                    cart: {
                                        intent:  'capture',
                                        amounts: {
                                            total: {
                                                currencyCode: 'USD'
                                            }
                                        },
                                        shippingMethods: [
                                            {
                                                id: 'SHIP_1234',
                                                label: 'Free Shipping',
                                                type: 'SHIPPING',
                                                selected: true,
                                                amount: {
                                                    value: '0.00',
                                                    currency_code: 'USD'
                                                }
                                            },
                                            {
                                                id: 'SHIP_123',
                                                label: 'Shipping',
                                                type: 'SHIPPING',
                                                selected: false,
                                                amount: {
                                                    value: '20.00',
                                                    currency_code: 'USD'
                                                }
                                            },
                                            {
                                                id: 'SHIP_124',
                                                label: 'Overnight',
                                                type: 'SHIPPING',
                                                selected: false,
                                                amount: {
                                                    value: '40.00',
                                                    currency_code: 'USD'
                                                }
                                            }
                                        ]
                                    },
                                    payees: [
                                        {
                                            merchantId: 'XYZ12345',
                                            email:       {
                                                stringValue: 'xyz-us-b1@paypal.com'
                                            }
                                        }
                                    ]
                                }
                            }
                        };
                    }
                })
            }).expectCalls();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingOptionsChange', async (callbackData, actions) => {
                const patchShippingMock = getGraphQLApiMock({
                    extraHandler: expect('UpdateShippingCall', ({ data }) => {
                        if (data.query.includes('UpdateShipping')) {
                            return {
                                id: orderID
                            };
                        }
                    })
                });
                patchShippingMock.expectCalls();
                await actions.patch();
                patchShippingMock.done();
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option,
                            }, { reject: avoid('reject') });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
            getCheckoutDetails.done();
        });
    });

    it('should render a button, click the button, and render checkout, then pass onShippingOptionsChange callback to the parent without shipping methods in checkout session and have SDK patch for client-side integrations', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingOptionsChange', async (callbackData, actions) => {
                const patchShippingMock = getGraphQLApiMock({
                    extraHandler: expect('UpdateShippingCall', ({ data }) => {
                        if (data.query.includes('UpdateShipping')) {
                            return {
                                id: orderID
                            };
                        }
                    })
                });
                patchShippingMock.expectCalls();
                await actions.patch();
                patchShippingMock.done();
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option,
                            }, { reject: avoid('reject') });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
        });
    });

    it('should update shipping options, and provide query when address changes for server-side integrations', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            const getCheckoutDetails = getGraphQLApiMock({
                extraHandler: expect('upgradeLSATGQLCall', ({ data }) => {

                    if (data.query.includes('query GetCheckoutDetails')) {
                        return {
                            data: {
                                checkoutSession: {
                                    cart: {
                                        intent:  'capture',
                                        amounts: {
                                            total: {
                                                currencyCode: 'USD'
                                            }
                                        },
                                        shippingMethods: [
                                            {
                                                id: 'SHIP_1234',
                                                label: 'Free Shipping',
                                                type: 'SHIPPING',
                                                selected: true,
                                                amount: {
                                                    value: '0.00',
                                                    currency_code: 'USD'
                                                }
                                            },
                                            {
                                                id: 'SHIP_123',
                                                label: 'Shipping',
                                                type: 'SHIPPING',
                                                selected: false,
                                                amount: {
                                                    value: '20.00',
                                                    currency_code: 'USD'
                                                }
                                            },
                                            {
                                                id: 'SHIP_124',
                                                label: 'Overnight',
                                                type: 'SHIPPING',
                                                selected: false,
                                                amount: {
                                                    value: '40.00',
                                                    currency_code: 'USD'
                                                }
                                            }
                                        ]
                                    },
                                    payees: [
                                        {
                                            merchantId: 'XYZ12345',
                                            email:       {
                                                stringValue: 'xyz-us-b1@paypal.com'
                                            }
                                        }
                                    ]
                                }
                            }
                        };
                    }
                })
            }).expectCalls();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingOptionsChange', async (data, actions) => {
                const query = await actions   
                    .updateShippingOption({ option: selected_shipping_option })
                    .query();
                const expectedQuery = `[{"op":"replace","path":"/purchase_units/@reference_id=='default'/shipping/options","value":[{"id":"SHIP_1234","label":"Free Shipping","type":"SHIPPING","selected":false,"amount":{"value":"0.00","currency_code":"USD"}},{"id":"SHIP_123","label":"Shipping","type":"SHIPPING","selected":true,"amount":{"value":"20.00","currency_code":"USD"}},{"id":"SHIP_124","label":"Overnight","type":"SHIPPING","selected":false,"amount":{"value":"40.00","currency_code":"USD"}}]},{"op":"replace","path":"/purchase_units/@reference_id=='default'/amount","value":{"value":"211.00","currency_code":"USD","breakdown":{"item_total":{"currency_code":"USD","value":"180.00"},"shipping":{"currency_code":"USD","value":"20.00"},"handling":{"currency_code":"USD","value":"1.00"},"tax_total":{"currency_code":"USD","value":"20.00"},"discount":{"currency_code":"USD","value":"10.00"}}}}]`;

                if (JSON.stringify(query) !== expectedQuery) {
                    throw new Error(`Expected query, ${ query }, to be, ${ expectedQuery }`);
                }
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option,
                                options
                            }, { reject: avoid('reject') });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
            getCheckoutDetails.done();
        });
    });

    it('should update shipping discount and shipping options, and provide query when address changes and actions are called in any order for server-side integrations', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingOptionsChange', async (data, actions) => {
                const query = await actions
                    .updateShippingDiscount({ discount })
                    .updateShippingOption({ option: selected_shipping_option })   
                    .query();
                const expectedQuery = `[{"op":"replace","path":"/purchase_units/@reference_id=='default'/amount","value":{"value":"201.00","currency_code":"USD","breakdown":{"item_total":{"currency_code":"USD","value":"180.00"},"shipping":{"currency_code":"USD","value":"20.00"},"handling":{"currency_code":"USD","value":"1.00"},"tax_total":{"currency_code":"USD","value":"20.00"},"discount":{"currency_code":"USD","value":"10.00"},"shipping_discount":{"currency_code":"USD","value":"10.00"}}}},{"op":"replace","path":"/purchase_units/@reference_id=='default'/shipping/options","value":[{"id":"SHIP_1234","label":"Free Shipping","type":"SHIPPING","selected":false,"amount":{"value":"0.00","currency_code":"USD"}},{"id":"SHIP_123","label":"Shipping","type":"SHIPPING","selected":true,"amount":{"value":"20.00","currency_code":"USD"}},{"id":"SHIP_124","label":"Overnight","type":"SHIPPING","selected":false,"amount":{"value":"40.00","currency_code":"USD"}}]}]`;

                if (JSON.stringify(query) !== expectedQuery) {
                    throw new Error(`Expected query, ${ query }, to be, ${ expectedQuery }`);
                }
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option,
                                options
                            }, { reject: avoid('reject') });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
        });
    });

    it('should not update shipping discount and shipping options, or patch when address changes and there is an error', async () => {
        return await wrapPromise(async ({ expect, avoid }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingOptionsChange', async (callbackData, actions) => {
                const patchShippingMock = getGraphQLApiMock({
                    extraHandler: avoid('UpdateShippingCall', ({ data }) => {
                        if (data.query.includes('UpdateShipping')) {
                            throw new Error(`Expected error...`);
                        }
                    })
                });

                const query = await actions.query();
                if (query && query.length > 0) {
                    throw new Error(`Expected query to be an empty array but was, ${ JSON.stringify(query) }`);
                }
                patchShippingMock.done();
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option,
                            }, { reject: avoid('reject') });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
        });
    });

    it('should allow merchant to pass back specified error to application through sdk for display', async () => {
        return await wrapPromise(async ({ expect }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingAddressChange', async (data, actions) => {
                actions.reject(data.errors.STORE_UNAVAILABLE);
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option
                            }, { reject: expect('reject', (error) => {
                                const expectedError = `Part of your order isn't available at this store.`;

                                if (error !== expectedError) {
                                    throw new Error(`Expected error message to be, ${ expectedError }, but was ${ error }`);
                                }
                            }) });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
        });
    });

    it('should return generic message if merchant send unapproved one', async () => {
        return await wrapPromise(async ({ expect }) => {

            const orderID = uniqueID();
            const accessToken = uniqueID();
            const payerID = 'YYYYYYYYYY';
            const facilitatorAccessToken = uniqueID();

            window.xprops.createOrder = mockAsyncProp(expect('createOrder', async () => {
                return ZalgoPromise.try(() => {
                    return orderID;
                });
            }));

            window.xprops.onShippingOptionsChange = mockAsyncProp(expect('onShippingAddressChange', async (data, actions) => {
                actions.reject('This is messed up!');
            }));

            mockFunction(window.paypal, 'Checkout', expect('Checkout', ({ original: CheckoutOriginal, args: [ props ] }) => {
                props.onAuth({ accessToken });
                mockFunction(props, 'onApprove', expect('onApprove', ({ original: onApproveOriginal, args: [ data, actions ] }) => {
                    return onApproveOriginal({ ...data, payerID }, actions);
                }));

                const checkoutInstance = CheckoutOriginal(props);

                mockFunction(checkoutInstance, 'renderTo', expect('renderTo', async ({ original: renderToOriginal, args }) => {
                    return props.createOrder().then(id => {
                        if (id !== orderID) {
                            throw new Error(`Expected orderID to be ${ orderID }, got ${ id }`);
                        }

                        return renderToOriginal(...args).then(() => {
                            return props.onShippingOptionsChange({
                                orderID,
                                amount,
                                selected_shipping_option
                            }, { reject: expect('reject', (error) => {
                                const expectedError = 'Unable to update address. Please try again.';

                                if (error !== expectedError) {
                                    throw new Error(`Expected error message to be, ${ expectedError }, but was ${ error }`);
                                }
                            }) });
                        });
                    });
                }));

                return checkoutInstance;
            }));

            createButtonHTML();

            await mockSetupButton({
                facilitatorAccessToken,
                merchantID:                    [ 'XYZ12345' ],
                fundingEligibility:            DEFAULT_FUNDING_ELIGIBILITY,
                personalization:               {},
                buyerCountry:                  COUNTRY.US,
                isCardFieldsExperimentEnabled: false
            });

            await clickButton(FUNDING.PAYPAL);
        });
    });
});
