/* @flow */
import { locales } from './locales';

export const selectLocalizedText = ({ inputLabel = 'login', locale }) => {
    const selectedLocale = locales[locale.toLowerCase()] || locales['en-us'];
    const selectedMessage = selectedLocale[inputLabel.toLowerCase()];
    return selectedMessage || selectedLocale.login;
};
