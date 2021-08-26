/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.CURRENCY_LOCALE_MAP = {
    sv_AX: 'EUR',
    sq_AL: 'ALL',
    ar_DZ: 'DZD',
    pt_AO: 'AON',
    en_AI: 'XCD',
    en_AG: 'XCD',
    es_AR: 'ARS',
    en_AW: 'AWG',
    pt_AW: 'AWG',
    en_AU: 'AUD',
    de_AT_EURO: 'EUR',
    az_AZ: 'AZN',
    en_BS: 'BSD',
    ar_BH: 'BHD',
    bn_BD: 'BDT',
    en_BB: 'BBD',
    be_BY: 'BYR',
    fr_BE_EURO: ' EUR',
    nl_BE_EURO: 'EUR',
    fr_BJ: 'XOF',
    en_BM: 'BMD',
    dz_BT: 'BTN',
    es_BO: 'BOB',
    en_BW: 'BWP',
    pt_BR: 'BRL',
    ms_BN: 'BND',
    bg_BG: 'BGN',
    fr_BF: 'XOF',
    km_KH: 'KHR',
    fr_CM: 'XAF',
    en_CA: 'CAD',
    fr_CA: 'CAD',
    es_IC: 'EUR',
    pt_CV: 'CVE',
    en_KY: 'KYD',
    fr_CF: 'XAF',
    es_EA: 'EUR',
    fr_TD: 'XAF',
    es_CL: 'CLP',
    zh_CN: 'CNY',
    es_CO: 'COP',
    fr_KM: 'KMF',
    en_CD: 'CDF',
    fr_CD: 'XAF',
    fr_CG: 'XAF',
    es_CR: 'CRC',
    fr_CI: 'XOF',
    hr_HR: 'HRk',
    en_CY: 'CYP',
    en_CY_EURO: 'EUR',
    cs_CZ: 'CZK',
    da_DK: 'DKK',
    en_DM: 'XCD',
    es_DO: 'DOP',
    es_EC: 'USD',
    ar_EG: 'EGP',
    es_SV: 'SVC',
    es_GQ: 'XAF',
    et_EE: 'EST',
    en_FK: 'FKP',
    fj_FJ: 'FJD',
    fi_FI: 'EUR',
    fi_FI_EURO: 'EUR',
    fr_FR: 'EUR',
    fr_FR_EURO: 'EUR',
    fr_GA: 'XAF',
    hy_AM: 'AMD',
    ka_GE: 'GEL',
    de_DE: 'EUR',
    de_DE_EURO: 'EUR',
    en_GH: 'GHS',
    el_GR: 'EUR',
    en_GD: 'XCD',
    es_GT: 'GTQ',
    pt_GW: 'XOF',
    en_GY: 'GYD',
    ht_HT: 'HTG',
    es_HN: 'HNL',
    zh_HK: 'HKD',
    hu_HU: 'HUF',
    is_IS: 'ISK',
    en_IN: 'INR',
    id_ID: 'IDR',
    ar_IQ: 'IQD',
    en_IE_EURO: 'EUR',
    he_IL: 'ILS',
    it_IT: 'EUR',
    it_IT_EURO: 'EUR',
    en_JM: 'JMD',
    ja_JP: 'JPY',
    ar_JO: 'JOD',
    ru_KZ: 'KZT',
    en_KE: 'KES',
    ko_KR: 'KRW',
    ar_KW: 'KWD',
    en_KW: 'KWD',
    ru_KG: 'KGS',
    lv_LV: 'LVL',
    ar_LB: 'LBP',
    en_LR: 'LRD',
    ar_LY: 'LYD',
    lt_LT: 'LTL',
    de_LU_EURO: 'EUR',
    fr_LU_EURO: 'EUR',
    zh_MO: 'MOP',
    mk_MK: 'MKD',
    en_MW: 'MWK',
    ms_MY: 'MYR',
    fr_ML: 'XOF',
    en_MU: 'MUR',
    es_MX: 'MXN',
    mn_MN: 'MNT',
    ar_MA: 'MAD',
    pt_MZ: 'MZN',
    ne_NP: 'NPR',
    nl_NL: 'EUR',
    nl_NL_EURO: 'EUR',
    nl_AN: 'ANG',
    en_NZ: 'NZD',
    es_NI: 'NIO',
    fr_NE: 'XOF',
    en_NG: 'NGN',
    no_NO: 'NOK',
    ar_OM: 'OMR',
    es_PA: 'PAB',
    en_PG: 'PGK',
    es_PY: 'PYG',
    es_PE: 'PEN',
    en_PH: 'PHP',
    tl_PH: 'PHP',
    pl_PL: 'PLN',
    pt_PT: 'EUR',
    pt_PT_EURO: 'EUR',
    es_PR: 'USD',
    ar_QA: 'QAR',
    en_QA: 'QAR',
    ro_RO: 'RON',
    ru_RU: 'RUB',
    fr_BL: 'EUR',
    en_SH: 'SHP',
    en_KN: 'XCD',
    en_LC: 'XCD',
    en_MF: 'EUR',
    en_VC: 'XCD',
    sm_WS: 'WST',
    ar_SA: 'SAR',
    fr_SN: 'XOF',
    sr_RS: 'RSD',
    sr_CS: 'RSD',
    en_SL: 'SLL',
    en_SG: 'SGD',
    sk_SK: 'EUR',
    sk_SK_EURO: 'EUR',
    sl_SI: 'EUR',
    sl_SI_EURO: 'EUR',
    en_ZA: 'ZAR',
    ca_ES_EURO: 'EUR',
    es_ES: 'EUR',
    es_ES_EURO: 'EUR',
    si_LK: 'LKR',
    ar_SD: 'SDG',
    nl_SR: 'SRD',
    sv_SE: 'SEK',
    de_CH: 'CHF',
    fr_CH: 'CHF',
    it_CH: 'CHF',
    ar_SY: 'SYP',
    zh_TW: 'TWD',
    tg_TJ: 'TJS',
    en_TZ: 'TZS',
    th_TH: 'THB',
    fr_TG: 'XOF',
    to_TO: 'TOP',
    en_TT: 'TTD',
    ar_TN: 'TND',
    tr_TR: 'TRY',
    tk_TM: 'TMM',
    en_TC: 'USD',
    en_UG: 'UGX',
    uk_UA: 'UAH',
    ar_AE: 'AED',
    en_AE: 'AED',
    en_GB: 'GBP',
    en_US: 'USD',
    es_UY: 'UYU',
    uz_UZ: 'UZS',
    es_VE: 'VEF',
    vi_VN: 'VND',
    ar_YE: 'YER'
};