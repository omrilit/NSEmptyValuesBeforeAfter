/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/* Depreciation Period */
var DEPR_PERIOD_MONTHLY = '1';
var DEPR_PERIOD_ANNUALLY = '2';
var DEPR_PERIOD_FISCALPERIOD = '3';
var DEPR_PERIOD_FISCALYEAR = '4';

/* List - FAM Used Accounts */
var FAM_USED_ASSETACCOUNT = '1';
var FAM_USED_DEPRACCOUNT = '2';
var FAM_USED_DEPEXPENSE = '3';
var FAM_USED_WRITEOFFACCOUNT = '4';
var FAM_USED_WRITEDOWNNACCOUNT = '5';
var FAM_USED_DISPOSALACCOUNT = '6';
var FAM_USED_ALL = '1,2,3,4,5,6';

var _context = nlapiGetContext();
var _current_user_language = _context.getPreference('LANGUAGE');