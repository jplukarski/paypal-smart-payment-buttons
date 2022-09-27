/* @flow */

import { request } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

export function getReleaseFile<T>(method: string, path: string) : ZalgoPromise<T> {
    let url = `https://www.paypalobjects.com/checkoutweb/release/dumbledore/${path}`;
    if(path === 'shell-query') {
        url = 'https://www.te-shell-data-query.qa.paypal.com/checkoutweb/dumbledore/shellDataQuery.graphql';
    }
    // eslint-disable-next-line no-console
    console.log('path', path);
    return request({
        method,
        url,
    }).then(({ status, body }) : T => {
        const HTTP_STATUS_SUCCESS = 200;
        if (status !== HTTP_STATUS_SUCCESS) {
            throw new Error(`Error for ${url} - status: ${status}`);;
        }
        return body;
    });
}
