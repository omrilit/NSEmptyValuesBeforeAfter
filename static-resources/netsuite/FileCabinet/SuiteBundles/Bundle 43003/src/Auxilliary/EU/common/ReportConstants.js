/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var CONSTANTS = CONSTANTS || {};

CONSTANTS.REPORT_MAP = {
    'eslOnlineDeployment': 'customdeploy_new_ec_sales_listdisp',
    'eslExportDeployment': 'customdeploy_new_ec_sales_export',
    'eslCustomerDeployment': 'customdeploy_new_ec_sales_customer',
    'eslTransactionDeployment': 'customdeploy_new_ec_sales_tran',
    'eslPrintDeployment': 'customdeploy_new_ec_sales_print',
    'eslSubmitHMRCDeployment': 'customdeploy_new_ec_sales_queuehmrc'
};

CONSTANTS.ACTIONTYPE = {
    'ESL_REFRESH_FORM': 'esl_refreshform',
    'ESL_GET_DATA': 'esl_getdata',
    'ESL_EXPORT': 'esl_export',
    'ESL_MAPPER_EXPORT': 'export',
    'ESL_REFRESH': 'refresh',
    'ESL_PRINT': 'print',
    'ESL_GB_SUBMIT_HMRC': 'esl_gb_submithmrc',
    'ESL_SETUP_TAX_FILING': 'setuptaxfiling'
};

CONSTANTS.SCRIPT = {
    'ESL': 'customscript_new_ec_sales_listdisp'
},

CONSTANTS.DEPLOYMENT = {
    'ESL': 'customdeploy_new_ec_sales_listdisp',
    'ESL_FILE' : 'customdeploy_new_ec_sales_export',
};

CONSTANTS.FIELD = {
    'SUB_ID': 'subsidiary',
    'IS_CONSOLIDATED': 'group',
    'COUNTRY_FORM': 'countryform',
    'FROM_DATE': 'periodfrom',
    'TO_DATE': 'periodto',
    'CLEAR_CACHE': 'clearcache',
    'ACTION_TYPE':'actiontype',
    'FILE_TYPE': 'filetype',
    'BOOK_ID': 'bookid',
    'REFRESH_FLAG': 'refreshflag',
};

CONSTANTS.SETUP = {
    'ESL_BRANCH_NO' : 'ESLBranchNo',
    'ESL_STERLING' : 'ESLSterling'
};

CONSTANTS.FOLDER = {
    'ESL_CONFIG_NAME': 'ESLRootFolder',
    'ESL_DEFAULT': 'UK ESL'
};

CONSTANTS.EU_NEXUSES = CONSTANTS.EU_NEXUSES || getEUNexuses();

CONSTANTS.MESSAGES = {
    'ERR_COUNTRYFORM_NOT_SUPPORTED' : 'This country form is currently not supported in NetSuite.',
    'ERR_INVALID_TAXPERIOD': 'The tax periods are incorrectly setup.',
    'ERR_NEEDREFRESH': 'To generate the report, click Refresh each time you change the reporting criteria.'
};

CONSTANTS.COLOR = {
    'RED' : '#FF0000',
    'BROWN' : '#A52A2A',
    'BLACK' : '#000000',
    'MEDIUMSLATEBLUE' : '#7B68EE'
};

CONSTANTS.MAP_DETAILS = {
    'BASE_REPORT': 'VAT.EU.ESL.Base.Report',
    'GENERIC_REPORT': 'VAT.EU.ESL.Generic.Report'
};

CONSTANTS.VAT_FORMAT_REGEX = {
    //put this in record type in the future
    AT: "^(AT){0,1}[U]{1}[0-9]{8}$",
    BE: "^(BE){0,1}[0]{1}[0-9]{9}$",
    GB: "^(GB){0,1}(GD|HA){0,1}[0-9]{3,9}$",
    DE: "^(DE){0,1}[0-9]{9}$",
    ES: "^(ES){0,1}[A-Z0-9]{1}[0-9]{7}[A-Z0-9]{1}$",
    IT: "^(IT){0,1}[0-9]{11}$",
    SE: "^(SE){0,1}[0-9]{12}$",
    NL: "^(NL){0,1}[0-9]{9}[B]{1}[0-9]{2}$",

    BG: "^(BG){0,1}[0-9]{9,10}$",
    CY: "^(CY){0,1}[0-9]{8}[A-Z]{1}$",
    CZ: "^(CZ){0,1}[0-9]{8,10}$",
    DK: "^(DK){0,1}[0-9]{8}$",
    EE: "^(EE){0,1}[0-9]{9}$",
    EL: "^(EL){0,1}[0-9]{9}$", //Greece
    GR: "^(EL){0,1}[0-9]{9}$", //Greece
    FI: "^(FI){0,1}[0-9]{8}$",
    FR: "^(FR){0,1}[A-HJ-NP-Z]{0,2}[0-9]{9,11}$",
    HU: "^(HU){0,1}[0-9]{8}$",
    IE: "^(IE){0,1}\\d{7}[A-Z]{1,2}$|^(IE){0,1}\\d[A-Z]\\d{5}[A-Z]$|^(IE){0,1}\\d{6}[A-Z]$",
    LT: "^(LT){0,1}[0-9]{9,12}$",
    LU: "^(LU){0,1}[0-9]{8}$",
    LV: "^(LV){0,1}[0-9]{11}$",
    MT: "^(MT){0,1}[0-9]{8}$",
    PL: "^(PL){0,1}[0-9]{10}$",
    PT: "^(PT){0,1}[0-9]{9}$",
    RO: "^(RO){0,1}[0-9]{2,10}$",
    SI: "^(SI){0,1}[0-9]{8}$",
    SK: "^(SK){0,1}[0-9]{10}$",
    MC: "^(FR|MC){0,1}[A-HJ-NP-Z]{0,2}[0-9]{9,11}$"
};

CONSTANTS.CHAR_MAP = {
    '&lt;' : '<',
    '&gt;' : '>',
    '&apos;' : "'",
    '&amp;' : '&',
};
