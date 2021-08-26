/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/07/10  250004         2.00.19      			  Initital version
 * 2013/09/23  255091		  2.00.18				  Added Billing Sequence Types
 * 2013/09/24  263190		  3.00.00				  Add Approval Routing constants
 * 2013/09/26  263190 		  3.00.00				  Add Schedule Event type constants and MAXTIMELIMIT
 * 2013/11/07  267045 		  3.00.00				  Add Reference Amendment constants
 * 2013/11/26                 3.00.00				  Add UUID for file under email templates folder
 * 2014/03/21   		       			              Add country source object
 * 2014/05/19  273487         3.00.3       			  Add constants for batch processing scripts, process and status
 * 2014/05/06  282567    	  3.01.02				  Add constant for time options
 * 2014/10/13  312556 		  4.00.4				  Add EP_FLH object
 */

//Mutli-select separator char
var MULTISELECT_SEPARATOR = String.fromCharCode(5);

//Maximum time limit
var MAXTIMELIMIT = 240000;	//4 mins 

//Payment Type
var EP_EFT = '1';
var EP_DD = '2';
var EP_PP = '3';


// Payment Status's
var PAYQUEUED = 1;
var PAYMARKPAYMENTS = 5;
var PAYPROCESSING = 2;
var PAYCREATINGFILE = 3;
var PAYPROCESSED = 4;
var PAYREVERSAL = 6;
var PAYNOTIFICATION = 7;
var PAYERROR = 8;
var PAYFAILED = 9;
var PAYCANCELLED = 10;
var PAYDELETINGFILE = 11;
var REQUEUED = 12;
var UPDATINGBATCH = 13;

//Payment Batch status
var BATCH_OPEN = '1';
var BATCH_UPDATING = '2';
var BATCH_PENDINGAPPROVAL = '3';
var BATCH_SUBMITTED = '4';
var BATCH_REJECTED = '5';

//Approval Routing Level
var APPROVAL_LEVEL1 = 1;
var APPROVAL_LEVEL2 = 2;
var APPROVAL_LEVEL3 = 3;
var HIGHEST_APPROVAL_LEVEL = 3;

//Approval Type
var APPROVALTYPE_BILLPAYMENT = '1';
var APPROVALTYPE_VENDORPAYMENT = '2';
var APPROVALTYPE_BATCHPAYMENT = '3';

//Schedule Event Type
var EVENTTYPE_CLOSING = '1';
var EVENTTYPE_CREATION = '2';

var VALID_COUNTRY_CODES = [
	'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE',
	'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'IC', 'CV', 'KY', 'CF',
	'EA', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CD', 'CG', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO',
	'TP', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI',
	'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE',
	'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT',
	'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA',
	'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'AN', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG',
	'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'VC', 'WS', 'SM', 'ST', 'SA',
	'SN', 'RS', 'CS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'PM', 'SD', 'SR', 'SJ', 'SZ', 'SE',
	'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UM',
	'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'
];

var TIME_LIST_PER_TIME_FORMAT = {
	'hh-mm AM/PM' : {
		"12:00 am": "12:00 am", "12:30 am": "12:30 am", "01:00 am": "1:00 am", "01:30 am": "1:30 am", "02:00 am": "2:00 am", "02:30 am": "2:30 am", 
		"03:00 am": "3:00 am", "03:30 am": "3:30 am", "04:00 am": "4:00 am", "04:30 am": "4:30 am", "05:00 am": "5:00 am", "05:30 am": "5:30 am", 
		"06:00 am": "6:00 am", "06:30 am": "6:30 am", "07:00 am": "7:00 am", "07:30 am": "7:30 am", "08:00 am": "8:00 am", "08:30 am": "8:30 am", 
		"09:00 am": "9:00 am", "09:30 am": "9:30 am", "10:00 am": "10:00 am", "10:30 am": "10:30 am", "11:00 am": "11:00 am", "11:30 am": "11:30 am", 
		"12:00 pm": "noon", "12:30 pm": "12:30 pm", "01:00 pm": "1:00 pm", "01:30 pm": "1:30 pm", "02:00 pm": "2:00 pm", "02:30 pm": "2:30 pm", 
		"03:00 pm": "3:00 pm", "03:30 pm": "3:30 pm", "04:00 pm": "4:00 pm", "04:30 pm": "4:30 pm", "05:00 pm": "5:00 pm", "05:30 pm": "5:30 pm", 
		"06:00 pm": "6:00 pm", "06:30 pm": "6:30 pm", "07:00 pm": "7:00 pm", "07:30 pm": "7:30 pm", "08:00 pm": "8:00 pm", "08:30 pm": "8:30 pm", 
		"09:00 pm": "9:00 pm", "09:30 pm": "9:30 pm", "10:00 pm": "10:00 pm", "10:30 pm": "10:30 pm", "11:00 pm": "11:00 pm", "11:30 pm": "11:30 pm"
	}
};

var COUNTRY_SOURCE = {
    "Andorra"                               : { code: "AD" },
    "United Arab Emirates"                  : { code: "AE" },
    "Afghanistan"                           : { code: "AF" },
    "Antigua and Barbuda"                   : { code: "AG" },
    "Anguilla"                              : { code: "AI" },
    "Albania"                               : { code: "AL" },
    "Armenia"                               : { code: "AM" },
    "Netherlands Antilles"                  : { code: "AN" },
    "Angola"                                : { code: "AO" },
    "Antarctica"                            : { code: "AQ" },
    "Argentina"                             : { code: "AR" },
    "American Samoa"                        : { code: "AS" },
    "Austria"                               : { code: "AT" },
    "Australia"                             : { code: "AU" },
    "Aruba"                                 : { code: "AW" },
    "Aland Islands"                         : { code: "AX" },
    "Azerbaijan"                            : { code: "AZ" },
    "Bosnia and Herzegovina"                : { code: "BA" },
    "Barbados"                              : { code: "BB" },
    "Bangladesh"                            : { code: "BD" },
    "Belgium"                               : { code: "BE" },
    "Burkina Faso"                          : { code: "BF" },
    "Bulgaria"                              : { code: "BG" },
    "Bahrain"                               : { code: "BH" },
    "Burundi"                               : { code: "BI" },
    "Benin"                                 : { code: "BJ" },
    "Saint Barthélemy"                      : { code: "BL" },
    "Bermuda"                               : { code: "BM" },
    "Brunei Darrussalam"                    : { code: "BN" },
    "Bolivia"                               : { code: "BO" },
    "Brazil"                                : { code: "BR" },
    "Bahamas"                               : { code: "BS" },
    "Bhutan"                                : { code: "BT" },
    "Bouvet Island"                         : { code: "BV" },
    "Botswana"                              : { code: "BW" },
    "Belarus"                               : { code: "BY" },
    "Belize"                                : { code: "BZ" },
    "Canada"                                : { code: "CA" },
    "Cocos (Keeling) Islands"               : { code: "CC" },
    "Congo, Democratic People's Republic"   : { code: "CD" },
    "Central African Republic"              : { code: "CF" },
    "Congo, Republic of"                    : { code: "CG" },
    "Switzerland"                           : { code: "CH" },
    "Cote d'Ivoire"                         : { code: "CI" },
    "Cook Islands"                          : { code: "CK" },
    "Chile"                                 : { code: "CL" },
    "Cameroon"                              : { code: "CM" },
    "China"                                 : { code: "CN" },
    "Colombia"                              : { code: "CO" },
    "Costa Rica"                            : { code: "CR" },
    "Serbia and Montenegro (Deprecated)"    : { code: "CS" },
    "Cuba"                                  : { code: "CU" },
    "Cape Verde"                            : { code: "CV" },
    "Christmas Island"                      : { code: "CX" },
    "Cyprus"                                : { code: "CY" },
    "Czech Republic"                        : { code: "CZ" },
    "Germany"                               : { code: "DE" },
    "Djibouti"                              : { code: "DJ" },
    "Denmark"                               : { code: "DK" },
    "Dominica"                              : { code: "DM" },
    "Dominican Republic"                    : { code: "DO" },
    "Algeria"                               : { code: "DZ" },
    "Ceuta and Melilla"                     : { code: "EA" },
    "Ecuador"                               : { code: "EC" },
    "Estonia"                               : { code: "EE" },
    "Egypt"                                 : { code: "EG" },
    "Western Sahara"                        : { code: "EH" },
    "Eritrea"                               : { code: "ER" },
    "Spain"                                 : { code: "ES" },
    "Ethiopia"                              : { code: "ET" },
    "Finland"                               : { code: "FI" },
    "Fiji"                                  : { code: "FJ" },
    "Falkland Islands"                      : { code: "FK" },
    "Micronesia, Federal State of"          : { code: "FM" },
    "Faroe Islands"                         : { code: "FO" },
    "France"                                : { code: "FR" },
    "Gabon"                                 : { code: "GA" },
    "United Kingdom (GB)"                   : { code: "GB" },
    "Grenada"                               : { code: "GD" },
    "Georgia"                               : { code: "GE" },
    "French Guiana"                         : { code: "GF" },
    "Guernsey"                              : { code: "GG" },
    "Ghana"                                 : { code: "GH" },
    "Gibraltar"                             : { code: "GI" },
    "Greenland"                             : { code: "GL" },
    "Gambia"                                : { code: "GM" },
    "Guinea"                                : { code: "GN" },
    "Guadeloupe"                            : { code: "GP" },
    "Equatorial Guinea"                     : { code: "GQ" },
    "Greece"                                : { code: "GR" },
    "South Georgia"                         : { code: "GS" },
    "Guatemala"                             : { code: "GT" },
    "Guam"                                  : { code: "GU" },
    "Guinea-Bissau"                         : { code: "GW" },
    "Guyana"                                : { code: "GY" },
    "Hong Kong"                             : { code: "HK" },
    "Heard and McDonald Islands"            : { code: "HM" },
    "Honduras"                              : { code: "HN" },
    "Croatia/Hrvatska"                      : { code: "HR" },
    "Haiti"                                 : { code: "HT" },
    "Hungary"                               : { code: "HU" },
    "Canary Islands"                        : { code: "IC" },
    "Indonesia"                             : { code: "ID" },
    "Ireland"                               : { code: "IE" },
    "Israel"                                : { code: "IL" },
    "Isle of Man"                           : { code: "IM" },
    "India"                                 : { code: "IN" },
    "British Indian Ocean Territory"        : { code: "IO" },
    "Iraq"                                  : { code: "IQ" },
    "Iran (Islamic Republic of)"            : { code: "IR" },
    "Iceland"                               : { code: "IS" },
    "Italy"                                 : { code: "IT" },
    "Jersey"                                : { code: "JE" },
    "Jamaica"                               : { code: "JM" },
    "Jordan"                                : { code: "JO" },
    "Japan"                                 : { code: "JP" },
    "Kenya"                                 : { code: "KE" },
    "Kyrgyzstan"                            : { code: "KG" },
    "Cambodia"                              : { code: "KH" },
    "Kiribati"                              : { code: "KI" },
    "Comoros"                               : { code: "KM" },
    "Saint Kitts and Nevis"                 : { code: "KN" },
    "Korea, Democratic People's Republic"   : { code: "KP" },
    "Korea, Republic of"                    : { code: "KR" },
    "Kuwait"                                : { code: "KW" },
    "Cayman Islands"                        : { code: "KY" },
    "Kazakhstan"                            : { code: "KZ" },
    "Lao People's Democratic Republic"      : { code: "LA" },
    "Lebanon"                               : { code: "LB" },
    "Saint Lucia"                           : { code: "LC" },
    "Liechtenstein"                         : { code: "LI" },
    "Sri Lanka"                             : { code: "LK" },
    "Liberia"                               : { code: "LR" },
    "Lesotho"                               : { code: "LS" },
    "Lithuania"                             : { code: "LT" },
    "Luxembourg"                            : { code: "LU" },
    "Latvia"                                : { code: "LV" },
    "Libyan Arab Jamahiriya"                : { code: "LY" },
    "Morocco"                               : { code: "MA" },
    "Monaco"                                : { code: "MC" },
    "Moldova, Republic of"                  : { code: "MD" },
    "Montenegro"                            : { code: "ME" },
    "Saint Martin"                          : { code: "MF" },
    "Madagascar"                            : { code: "MG" },
    "Marshall Islands"                      : { code: "MH" },
    "Macedonia"                             : { code: "MK" },
    "Mali"                                  : { code: "ML" },
    "Myanmar"                               : { code: "MM" },
    "Mongolia"                              : { code: "MN" },
    "Macau"                                 : { code: "MO" },
    "Northern Mariana Islands"              : { code: "MP" },
    "Martinique"                            : { code: "MQ" },
    "Mauritania"                            : { code: "MR" },
    "Montserrat"                            : { code: "MS" },
    "Malta"                                 : { code: "MT" },
    "Mauritius"                             : { code: "MU" },
    "Maldives"                              : { code: "MV" },
    "Malawi"                                : { code: "MW" },
    "Mexico"                                : { code: "MX" },
    "Malaysia"                              : { code: "MY" },
    "Mozambique"                            : { code: "MZ" },
    "Namibia"                               : { code: "NA" },
    "New Caledonia"                         : { code: "NC" },
    "Niger"                                 : { code: "NE" },
    "Norfolk Island"                        : { code: "NF" },
    "Nigeria"                               : { code: "NG" },
    "Nicaragua"                             : { code: "NI" },
    "Netherlands"                           : { code: "NL" },
    "Norway"                                : { code: "NO" },
    "Nepal"                                 : { code: "NP" },
    "Nauru"                                 : { code: "NR" },
    "Niue"                                  : { code: "NU" },
    "New Zealand"                           : { code: "NZ" },
    "Oman"                                  : { code: "OM" },
    "Panama"                                : { code: "PA" },
    "Peru"                                  : { code: "PE" },
    "French Polynesia"                      : { code: "PF" },
    "Papua New Guinea"                      : { code: "PG" },
    "Philippines"                           : { code: "PH" },
    "Pakistan"                              : { code: "PK" },
    "Poland"                                : { code: "PL" },
    "St. Pierre and Miquelon"               : { code: "PM" },
    "Pitcairn Island"                       : { code: "PN" },
    "Puerto Rico"                           : { code: "PR" },
    "Palestinian Territories"               : { code: "PS" },
    "Portugal"                              : { code: "PT" },
    "Palau"                                 : { code: "PW" },
    "Paraguay"                              : { code: "PY" },
    "Qatar"                                 : { code: "QA" },
    "Reunion Island"                        : { code: "RE" },
    "Romania"                               : { code: "RO" },
    "Serbia"                                : { code: "RS" },
    "Russian Federation"                    : { code: "RU" },
    "Rwanda"                                : { code: "RW" },
    "Saudi Arabia"                          : { code: "SA" },
    "Solomon Islands"                       : { code: "SB" },
    "Seychelles"                            : { code: "SC" },
    "Sudan"                                 : { code: "SD" },
    "Sweden"                                : { code: "SE" },
    "Singapore"                             : { code: "SG" },
    "Saint Helena"                          : { code: "SH" },
    "Slovenia"                              : { code: "SI" },
    "Svalbard and Jan Mayen Islands"        : { code: "SJ" },
    "Slovak Republic"                       : { code: "SK" },
    "Sierra Leone"                          : { code: "SL" },
    "San Marino"                            : { code: "SM" },
    "Senegal"                               : { code: "SN" },
    "Somalia"                               : { code: "SO" },
    "Suriname"                              : { code: "SR" },
    "Sao Tome and Principe"                 : { code: "ST" },
    "El Salvador"                           : { code: "SV" },
    "Syrian Arab Republic"                  : { code: "SY" },
    "Swaziland"                             : { code: "SZ" },
    "Turks and Caicos Islands"              : { code: "TC" },
    "Chad"                                  : { code: "TD" },
    "French Southern Territories"           : { code: "TF" },
    "Togo"                                  : { code: "TG" },
    "Thailand"                              : { code: "TH" },
    "Tajikistan"                            : { code: "TJ" },
    "Tokelau"                               : { code: "TK" },
    "Turkmenistan"                          : { code: "TM" },
    "Tunisia"                               : { code: "TN" },
    "Tonga"                                 : { code: "TO" },
    "East Timor"                            : { code: "TP" },
    "Turkey"                                : { code: "TR" },
    "Trinidad and Tobago"                   : { code: "TT" },
    "Tuvalu"                                : { code: "TV" },
    "Taiwan"                                : { code: "TW" },
    "Tanzania"                              : { code: "TZ" },
    "Ukraine"                               : { code: "UA" },
    "Uganda"                                : { code: "UG" },
    "US Minor Outlying Islands"             : { code: "UM" },
    "United States"                         : { code: "US" },
    "Uruguay"                               : { code: "UY" },
    "Uzbekistan"                            : { code: "UZ" },
    "Holy See (City Vatican State)"         : { code: "VA" },
    "Saint Vincent and the Grenadines"      : { code: "VC" },
    "Venezuela"                             : { code: "VE" },
    "Virgin Islands (British)"              : { code: "VG" },
    "Virgin Islands (USA)"                  : { code: "VI" },
    "Vietnam"                               : { code: "VN" },
    "Vanuatu"                               : { code: "VU" },
    "Wallis and Futuna Islands"             : { code: "WF" },
    "Samoa"                                 : { code: "WS" },
    "Yemen"                                 : { code: "YE" },
    "Mayotte"                               : { code: "YT" },
    "South Africa"                          : { code: "ZA" },
    "Zambia"                                : { code: "ZM" },
    "Zimbabwe"                              : { code: "ZW" }
};

var VALID_SCHEDULE_STATUSES = ['QUEUED', 'INQUEUE', 'INPROGRESS'];
var TERMINAL_DEPLOYMENT_STATUSES = ['COMPLETED', 'NOTSCHEDULED'];

// EP Processes
var EP_PROCESSPAYMENTS = '1';
var EP_REPROCESS = '2';
var EP_ROLLBACK = '3';
var EP_REVERSEPAYMENTS = '4';
var EP_EMAILNOTIFICATION = '5';
var EP_CREATEFILE = '6';
var EP_CREATEBATCH = '7';
var EP_CLOSEBATCH = '8';

//bank account types
var BANK_ACCT_TYPE_CHECKING = 1;
var BANK_ACCT_TYPE_SAVINGS = 2;

//billing sequence types
var BILL_SEQ_FRST = '1';
var BILL_SEQ_RCUR = '2';
var BILL_SEQ_FNAL = '3';
var BILL_SEQ_OOFF = '4';

//reference amendments
var AMEND_NONE = '1';
var AMEND_MANDATE_ID = '2';
var AMEND_DEBTOR_ACCT = '3';
var AMEND_DEBTOR_AGENT = '4';
var AMEND_CREDITOR_ID = '5';

//Scheduled Script Ids
var EP_PAYMENTPROCESSING_SCRIPT = 'customscript_2663_payment_processing_ss';
var EP_PAYMENTCREATOR_SCRIPT = 'customscript_ep_payment_creator_ss';
var EP_ROLLBACK_SCRIPT = 'customscript_2663_rollback_ss';
var EP_REVERSEPAYMENTS_SCRIPT = 'customscript_2663_reverse_payments_ss';
var EP_EMAILNOTIFICATION_SCRIPT = 'customscript_2663_notify_payments_ss';
var EP_BATCHPROCESSING_SCRIPT = 'customscript_2663_batch_processing_ss';
var EP_ONDEMANDBATCH_SCRIPT = 'customscript_2663_on_demand_batch_ss';
var EP_SS_SCRIPT_IDS = [
	EP_PAYMENTPROCESSING_SCRIPT,
	EP_PAYMENTCREATOR_SCRIPT,
	EP_ROLLBACK_SCRIPT,
	EP_REVERSEPAYMENTS_SCRIPT,
	EP_EMAILNOTIFICATION_SCRIPT,
	EP_BATCHPROCESSING_SCRIPT,
	EP_ONDEMANDBATCH_SCRIPT
];

//Scheduled Script Deployment Ids
var EP_PAYMENTPROCESSING_DEPLOY = 'customdeploy_2663_payment_processing_ss';
var EP_PAYMENTCREATOR_DEPLOY = 'customdeploy_ep_payment_creator_ss';
var EP_ROLLBACK_DEPLOY = 'customdeploy_2663_rollback_ss';
var EP_REVERSEPAYMENTS_DEPLOY = 'customdeploy_2663_reverse_payments_ss';
var EP_EMAILNOTIFICATION_DEPLOY = 'customdeploy_2663_notify_payments_ss';
var EP_BATCHPROCESSING_DEPLOY = 'customdeploy_2663_batch_processing_ss';
var EP_ONDEMANDBATCH_DEPLOY = 'customdeploy_2663_on_demand_batch_ss';

//UUID for folder locations
var EP_UUID_EMAIL_TEMPLATES = 'dd874a40-535a-11e3-8f96-0800200c9a66';

//Field Level Help
var EP_FLH = {
	'en': {
		'custpage_2663_gl_bank_account': [
            'Select the GL account where the processed electronic payment transactions will be posted.', 
            'To create new Bank Accounts, go to Setup > Accounting > Chart of Accounts > New.'
        ].join('\n\n'),
		'custpage_2663_eft_file_cabinet_id': 'Select the folder that you created in the file cabinet for storing payment files.',
		'custpage_2663_eft_template': [
            'Select the payment file format template to use for this bank account when processing bills, expenses, commissions,  or customer refunds.',
            'Note: Install Electronic Payments for OneWorld bundle to use EFT templates in other countries. Otherwise you can only use EFT templates within the country of your operation or country of your parent subsidiary.'
         ].join('\n\n'),
        'custpage_2663_dd_template': [
            'Select the payment file format template to use for this bank account when processing payments from customers.',
            'Note: Install Electronic Payments for OneWorld bundle to use DD templates in other countries. Otherwise you can only use DD templates within the country of your operation or country of your parent subsidiary.'
         ].join('\n\n'),
        'custpage_2663_pp_template': 'Select the Positive Pay file format template to use for generating a list of issued checks from this bank account. See Verifying Issued Checks with Positive Pay in the Help Center.',
        'custpage_2663_bank_department': 'Select the department for payments made under this bank account.',
        'custpage_2663_bank_class': 'Select the default class for payments made under this bank account.',
        'custpage_2663_bank_location': 'Select the default location for payments made under this bank account.',
        'custpage_2663_eft_batch': 'Check this box if you want to process payment transactions for this bank account in batches. See Processing Bills and Expenses in Batches in the Help Center. Clear this box if you want to process payment transactions for this bank manually. See Manually Processing Payments in the Help Center.',
        'custpage_2663_auto_ap': 'Select the accounts payable register where the payments will be posted.',
        'custpage_2663_summarized': 'Select the accounts payable register where the payments will be posted.',
        'custpage_2663_trans_summary': 'This field indicates number of transactions that were paid over the number of transactions that were submitted for payment.',
        'custpage_2663_bank_currency': 'This field indicates the currency for this bank account.',
        'custpage_2663_amount': 'This field indicates the total amount of payments included in this payment file.',
        'custpage_agg_method': 'This field indicates the aggregation method used for the payments included in this payment file.',
        'custpage_2663_schedule_next_date': 'This field displays the date when the next open payment batch creation or approval will occur.',
        'custpage_2663_schedule_start_time': 'Select the time when the approval or creation of batches begins.',
        'custpage_2663_format_currency': 'Select the currencies that you want to include in a single payment run when processing payments using this payment file format.',
        'custpage_ep_eft_email_template': 'Select the email template to use for vendor payments.',
        'custpage_ep_dd_email_template': 'Select the email template to use for customer payments.',
        'bank_acct': 'Select the bank account of the payment batch you want to view. ',
        'bank_currency': 'This field displays the currency depending on the back account selected.',
        
        'custpage_2663_eft_bank_account': [
            'Select your company’s bank account record where the payment transactions will be posted.',
        	'Note: Only bank accounts that do not have the Process Bills Automatically option enabled appears in this list. For more information, see the Setting Up Company Bank Records topic for your country in the Help Center.'
        ].join('\n'),
        'custpage_2663_dd_bank_account': "Select your company's bank account where the payment transactions should be posted.",
        'custpage_2663_pp_bank_account': [
          	"Select your company's bank account where the checks are posted. For more information on setting up you company's bank account details for electronic payments, see Setting Up Bank Records.", 
        	"The Bank account format, Maximum payments in file, and Subsidiary fields are automatically updated based on the value in this field."
        ].join(' '),
        'custpage_2663_cr_bank_account': 'Select the bank account to use for this refund.',
        'custpage_2663_dd_customer': 'Select a customer to filter the list of transactions associated with the customer.',
        'custpage_2663_cr_customer': 'Use this field to narrow down the  list of refunds to a particular customer.',
        'custpage_2663_eft_date_from': 'Use this field to narrow down the list of transactions that are due on or later than a specified date. Use this field with the to field to list transactions that are due within a range of dates.',
        'custpage_2663_dd_date_from': 'Use this field to narrow down the list of transactions that are due on or later than a specified date. Use this field with the to field to list transactions that are due within a range of dates.',
        'custpage_2663_cr_date_from': 'Use this field to show transactions dated on or later than this date. Use this field with the Date to field to show transactions within a range of dates.',
        'custpage_2663_pp_date_from': 'Use this field to show checks issued on this date or later. To include checks issued within a range of dates, enter values for both Date From and Date To fields.',
        'custpage_2663_eft_date_to': 'Use this field to display a list transactions that are due on or before a specified date. Use this field with the Due date from field to display a list transactions that are due within a range of dates.',
        'custpage_2663_dd_date_to': 'Use this field to list transactions that are due on or before a specified date. Use this field with the Due date from field to list transactions that are due within a range of dates.',
        'custpage_2663_cr_date_to': 'Use this field to show transactions dated on or before this date. Use this field with the Due date from field to show transactions within a range of dates.',
        'custpage_2663_pp_date_to': 'Use this field to show checks issued on this date and earlier. To include checks issued within a range of dates, enter values in the Date From and Date To fields.',
        'custpage_2663_eft_payment_lines': 'This field displays the number of outstanding payment transactions that are marked for processing in the Select Transactions list.',
        'custpage_2663_dd_payment_lines': 'This field displays the number of outstanding payment transactions that are marked for processing in the Select Transactions list.',
        'custpage_2663_cr_payment_lines': 'This field indicates the number of transactions included in the payment file.',
        'custpage_2663_pp_payment_lines': 'This field indicates the number of transactions included in the payment file.',
        'custpage_2663_eft_total_amount': 'This field displays the total amount of outstanding payment transactions that are marked for processing in the Select Transactions list.',
        'custpage_2663_dd_total_amount': 'This field displays the total amount of outstanding payment transactions that are marked for processing in the Select Transactions list.',
        'custpage_2663_cr_total_amount': 'This field indicates the total payment amount of the payment file.',
        'custpage_2663_pp_total_amount': 'This field indicates the total payment amount of the payment file.',
        'custpage_2663_eft_process_date': 'Specify the date when you want the bank to process the payment. This will be the transaction date of the payment records.',
        'custpage_2663_dd_process_date': 'Specify the date when you want the bank to process the payment transaction.',
        'custpage_2663_cr_process_date': 'Specify the date when you want the bank to process the payment transaction.',
        'custpage_2663_eft_postingperiod': 'Select the accounting period where the bill payments will be posted.',
        'custpage_2663_dd_postingperiod': 'Select the accounting period where the payments will be posted.',
        'custpage_2663_eft_payment_ref': 'Enter a note to reference this payment batch.',
        'custpage_2663_dd_payment_ref': 'Enter a file reference or description to display in the Direct Debit file.',
        'custpage_2663_cr_payment_ref': 'Enter a note to reference this payment file.',
        'custpage_2663_eft_aggregate': 'Leave this box checked if you want to group outstanding transactions of a particular payee into a single payment. Clear this box if you want to create a bill payment for each of the outstanding transactions.',
        'custpage_2663_dd_aggregate': 'Check this box to aggregate payments by payee. Checking this box and setting the And field to blank will aggregate payments by entity. Clear this box is you want to create payment transaction for every bill or expense report.',
        'custpage_2663_eft_agg_method': 'Select another aggregation method to further aggregate payments that have been grouped by payee. Payment transactions will be aggregated to a single payment transaction using the selected method after they are aggregated by payee.',
        'custpage_2663_dd_agg_method': [
        	'Select an aggregation method. Setting this field to blank will aggregate payments by entity.',
        	'To add a new method, go to Setup > Payment Aggregation > New.'
        ].join('\n'),
        'custpage_2663_ap_account': 'Select the accounts payable register where the payments will be posted.',
        'custpage_2663_transtype': 'Select a transaction type to narrow down the list of open transactions.',
        'custpage_2663_vendor': 'Select a vendor to filter the list of transactions associated with the vendor.',
        'custpage_2663_employee': 'Select an employee to filter the list of transactions associated with the employee.',
        'custpage_2663_partner': 'Select a partner to filter the list of transactions associated with the partner.',
        'custpage_2663_department': 'Select the department for payments made under this bank account. This value is reflected on the payment records, depending on whether the following are enabled: Payment Aggregration and Allow Per Line Departments preference. For more information, see the Processing Bills and Expenses topic in the Help Center.',
        'custpage_2663_classification': 'Select the class for payments made under this bank account. This value is reflected on the payment records depending on whether payment aggregation and the allow per-line class preference are enabled. For more information, see the Processing Bills and Expenses topic in the Help Center.',
        'custpage_2663_location': 'Select the location for payments made under this bank account. This value is reflected on the payment records depending on whether payment aggregation and the allow per-line location preference are enabled. For more information, see the Processing Bills and Expenses topic in the Help Center.',
        'custpage_2663_ar_account': 'Select the accounts receivable register where the open receivables are posted.',
        'custpage_2663_dept_filter': 'Use this field to narrow down the list of transactions to those that originated from a specific department.',
        'custpage_2663_class_filter': 'Use this field to narrow down the list of transactions to those that originated from a specific class.',
        'custpage_2663_loc_filter': 'Use this field to narrow down the list of transactions to those that originated from a specific location.',
        'custpage_2663_dd_type': ['Select the direct debit type.', '• B2B – SEPA B2B (business to business) direct debit', '• COR1 – SEPA core direct debit with reduced execution time cycle by one day','• CORE – For SEPA core direct debit'].join('\n'),
        'custpage_2663_batchid': [
             'Select the payment batch that you want to process. This field lists all available payment batches for the bank account and accounts payable register that you selected in the Bank account field.', 
             'Note: Only batches that have been approved (Closed) are available in this field.'
         ].join('\n'),
        'custpage_2663_first_check_no': 'Enter the starting check number in a range of checks that will be included in the file format. Checks with numbers lower than this number will not be included in the file format.',
        'custpage_2663_last_check_no': 'Enter the last check number in a range of checks that will be included in the file format. Checks with numbers higher than this number will not be included in the file format.',
        'custpage_2663_void': 'Check this box to include checks that are voided through a reverse journal entry. For more information, see the Reversing Payments topic in the Help Center.',
        'custpage_2663_exclude_cleared': 'Check this box to exclude checks that were cleared in your bank register.',
        'custpage_2663_void_payment_lines': 'This field displays the number of void cheques that are included in the search criteria that you defined.',
        'custpage_2663_void_total_amount': 'This field displays the total amount of all void cheques that are included in the search criteria that you defined.'
	}
};