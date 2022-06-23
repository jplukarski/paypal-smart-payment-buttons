/* @flow */
import { locales } from './locales';

export const selectLocalizedText = ({ inputLabel = 'login', locale }) => {
    let selectedLocale = locales[locale.toLowerCase()];
    console.log({ inputLabel, locale }, selectedLocale)
    if (!selectedLocale) {
        selectedLocale = locales['en-us'];
        console.log(`${ locale } locale for LIPP button not found or not supported defaulting to EN-us`);
    }
    const selectedMessage = selectedLocale[inputLabel.toLowerCase()];
    if (!selectedMessage) {
        console.log(`${ inputLabel } not supported defaulting to login`);
    }
    return selectedMessage || selectedLocale.login;
};
