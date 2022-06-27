/* @flow */
import { locales } from './locales';

// Handle old and new locale formats
const newTodeprecatedLocales = {
    'zh-hans': 'zh-cn',
    'zh-hant': 'zh-tw'
}

export const selectLocalizedText = ({ inputLabel = 'login', locale }) => {
    const depLocaleFormat = newTodeprecatedLocales[locale.toLowerCase()];
    const selectedLocale = locales[depLocaleFormat || locale.toLowerCase()] || locales['en-us'];
    const selectedMessage = selectedLocale[inputLabel.toLowerCase()];
    return selectedMessage || selectedLocale.login;
};
