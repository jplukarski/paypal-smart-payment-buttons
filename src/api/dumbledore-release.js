/* @flow */

import { request } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

export function getReleaseFile<T>(method: string, path: string) : ZalgoPromise<T> {
    const url = `https://www.paypalobjects.com/checkoutweb/release/dumbledore/${path}`;
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
