/* @flow */

import { getReleaseFile } from '../api/dumbledore-release';
import { callGraphQL } from '../api/api';

const HTTP_METHOD_GET = 'GET';

const getShellData = (shellDataQuery, orderId) => {
    const {
        xprops: {
          buyerCountry = '',
          locale = {}
        } = {}
    } = window;
    const variables = {
        token: orderId,
        areCookiesDisabled: false,
        isIframe: false,
        country: buyerCountry || 'US',
        countryCodeAsString: buyerCountry || 'US',
        languageCode: `${locale.lang}`
      }
    const headers = {
        'Content-Type': 'application/json',
    }
    return callGraphQL({ query: shellDataQuery, variables, headers, name: ''});
}

export const cacheShellData = (orderId: string) => {
    const { currentReleaseHash = false} = window;
    if(!currentReleaseHash) {
        // eslint-disable-next-line no-console
        console.log('error release hash not set');
        return;
    }
    getReleaseFile(HTTP_METHOD_GET, `release-meta.${currentReleaseHash}.json`)
        .then(({ shellDataQuery: shellDataQueryUrl }) => getReleaseFile(HTTP_METHOD_GET, shellDataQueryUrl))
        .then((shellDataQuery) => getShellData(shellDataQuery, orderId))
        .then((ShellData) => localStorage.setItem('dumbledore:shellData', ShellData))
        // eslint-disable-next-line no-console
        .catch((err) => console.log('error caching data shell', err));

}
