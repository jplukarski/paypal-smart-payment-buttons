/* @flow */
import { cancelWatchers, getAuthButtonMiddleware  } from '../../server';

import {
    mockReq,
    mockRes,
} from './mock';

jest.setTimeout(300000);

afterAll((done) => {
    cancelWatchers();
    done();
});

const cache = {
    // eslint-disable-next-line no-unused-vars
    get: (key) => Promise.resolve(),
    set: (key, value) => Promise.resolve(value)
};

const logger = {
    debug: Function.prototype,
    info: Function.prototype,
    warn: Function.prototype,
    error: Function.prototype,
    track: Function.prototype
};

test('should do a basic button render and succeed', async () => {
    const authButtonMiddleware = getAuthButtonMiddleware({
        cache,
        // $FlowFixMe
        logger,
    });

    const req = mockReq({
        query: {
            clientID: 'xyz'
        }
    });
    const res = mockRes();

    // $FlowFixMe
    await authButtonMiddleware(req, res);

    const status = res.getStatus();
    const contentType = res.getHeader('content-type');
    const html = res.getBody();
    if (status !== 200) {
        throw new Error(`Expected response status to be 200, got ${ status }`);
    }

    if (contentType !== 'text/html') {
        throw new Error(`Expected content type to be text/html, got ${ contentType || 'undefined' }`);
    }

    if (!html) {
        throw new Error(`Expected res to have a body`);
    }

    if (html.indexOf(`class="paypal-auth-button`) === -1) {
        throw new Error(`Expected button template to be rendered`);
    }
});

test('should give a 400 error with no clientID passed', async () => {
    const authButtonMiddleware = getAuthButtonMiddleware({
        cache,
        // $FlowFixMe
        logger,
    });

    const req = mockReq();
    const res = mockRes();

    // $FlowFixMe
    await authButtonMiddleware(req, res);

    const status = res.getStatus();

    if (status !== 400) {
        throw new Error(`Expected status code to be 400, got ${ status }`);
    }
});

test('Should pass the props correctly to the window handler.', async () => {

    const authButtonMiddleware = getAuthButtonMiddleware({
        cache,
        // $FlowFixMe
        logger,
    });

    // These are considered valid (validateButtonProps pass)
    const query = {
        scopes: 'testscope',
        returnurl: 'testredirecturi',
        responseType: 'testresponsetype',
        clientID:           'xyz',
    };

    const req = mockReq({
        query
    });

    const res = mockRes();

    // $FlowFixMe
    await authButtonMiddleware(req, res);

    const status = res.getStatus();
    const html = res.getBody();

    if(!html) {
        throw new Error(`Error generating button html null or undefined status: ${ status }`);
    }

    if(status !== 200) {
        throw new Error(`Expected status code to be 200, got ${ status }`);
    }

    const tests = Object.entries(query) // $FlowFixMe
                        .map(([k, v]) => ({ k, v: html.includes(v) }))

    if (tests.some(({ v }) => !v)) {
        throw new Error(`Expected ${tests.filter(({ v }) => !v).map(({ k }) => k).join(',')} query parameters to be passed to the Auth clcik handler`);
    }
});

test('Should render the correct message based on inputlabel.', async () => {

    const authButtonMiddleware = getAuthButtonMiddleware({
        cache,
        // $FlowFixMe
        logger,
    });

    // These are considered valid (validateButtonProps pass)
    const query = (inputLabel) => ({
        inputLabel,
        scopes: 'testscope',
        returnurl: 'testredirecturi',
        responseType: 'testresponsetype',
        clientID:           'xyz',
    });

    const labels = {
        connect: "Connect with PayPal",
        login: "Log in with PayPal",
        signup: "Sign up with PayPal",
        continue: "Continue with PayPal"
    };

    const req = (inputLabel) => mockReq({
        query: query(inputLabel)
    });

    await Promise.all(Object.keys(labels).map(async label => {
        const res = mockRes();
        // $FlowFixMe
        await authButtonMiddleware(req(label), res);
        const status = res.getStatus();
        const html = res.getBody();

        if(!html) {
            throw new Error(`Error generating button html null or undefined status: ${ status }`);
        }

        if(status !== 200) {
            throw new Error(`Expected status code to be 200, got ${ status }`);
        }

        if(!html.includes(labels[label])) {
            throw new Error(`Expected button text to be ${ labels[label] }`);
        }
    }));
});
