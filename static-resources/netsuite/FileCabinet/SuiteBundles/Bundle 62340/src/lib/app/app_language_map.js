/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */
var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.LanguageMap = function LanguageMap () {
  var languageMap = {
    'cs_CZ': '10', // Czech
    'da_DK': '11', // Danish
    'de_DE': '18', // German
    'en': '13', // English (International)
    'en_US': '1', // English (US)
    'es_AR': '44', // Latin American Spanish
    'es_ES': '36', // Spanish
    'fr_CA': '17', // French (Canada)
    'fr_FR': '16', // French (France)
    'it_IT': '25', // Italian
    'ja_JP': '26', // Japanese
    'ko_KR': '27', // Korean
    'nl_NL': '12', // Dutch
    'pt_BR': '41', // Portuguese (Brazil)
    'ru_RU': '33', // Russian
    'sv_SE': '37', // Swedish
    'th_TH': '38', // Thai
    'zh_TW': '4', // Chinese (traditional)
    'zh_CN': '3', // Chinese (simplified)
    'ar': '5', // Arabic
    'bg_BG': '7', // Bulgarian
    'bn_BD': '6', // Bengali
    'el_GR': '19', // Greek
    'et_EE': '14', // Estonian
    'fi_FI': '15', // Finnish
    'he_IL': '21', // Hebrew
    'hr_HR': '9', // Croatian
    'hu_HU': '22', // Hungarian
    'id_ID': '24', // Indonesian
    'is_IS': '23', // Icelandic
    'lt_LT': '29', // Lithuanian
    'lv_LV': '28', // Latvian
    'no_NO': '30', // Norwegian
    'pl_PL': '31', // Polish
    'pt_PT': '42', // Portuguese (Portugal)
    'ro_RO': '32', // Romanian
    'sk_SK': '34', // Slovak
    'sl_SI': '35', // Slovenian
    'tr_TR': '39', // Turkish
    'vi_VN': '43' // Vietnamese
  };

  function getCorrespondingId (language) {
    return languageMap[language];
  }

  return {
    getCorrespondingId: getCorrespondingId
  };
};
