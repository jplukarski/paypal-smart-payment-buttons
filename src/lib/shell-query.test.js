/* @flow */
import { $mockEndpoint } from '@krakenjs/sync-browser-mocks/src/xhr';

import { cacheShellData } from './shell-query';

$mockEndpoint.register({
    method: 'GET',
    uri:    new RegExp('/checkoutweb/release/dumbledore/release-meta.abcd.json'),
    data:   {
        ack:  'success',
        data: {

        }
    },
});

$mockEndpoint.register({
    method: 'GET',
    uri:    new RegExp('/checkoutweb/release/dumbledore/shellDataQuery.json'),
    data:   {
        ack:  'success',
        data: {

        }
    },
});

$mockEndpoint.register({
    method: 'POST',
    uri:    '/graphql',
    data:   {
        data: {}
    },
});

window.currentReleaseHash = 'abcd';

describe('Test caching shell data query', () => {
    it('Should cache shell data query', () => {
        const orderId = 'abcd';
        jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
        Object.setPrototypeOf(window.localStorage.setItem, jest.fn())

        cacheShellData(orderId)
        .then(() => {
            expect(window.localStorage.setItem).toHaveBeenCalled();
            expect(window.localStorage.setItem).toHaveBeenCalledWith('dumbledore:shellData', {});
        });


    })
});