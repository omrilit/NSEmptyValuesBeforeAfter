/**
 * Module Description
 * 
 * Version    Date          Author          Remarks
 * 1.00     2014 01 14      pbtan           initial checkin. placed code in afterInstall.
 * 2.00     2014 01 22      pbtan           added beforeInstall and beforeUpdate to check if Advanced Projects feature is installed.
 * 3.00     2014 01 29      pbtan           seems like afterInstall is not called on bundle update... called afterInstall on afterUpdate.
 *                                          also added checking not to proceed with migration if v3 custom record is not empty.
 * 4.00     2014 01 30      pbtan           since BI has no logs, removed the try/catch maybe there was an error during install...
 * 5.00     2014 02 06      pbtan           removed migrate codes from bundle install script.
 * 6.00     2014 02 07      pbtan           removed migrate codes from bundle install script.
 * 7, 8     2014 02 10      jmarimla        removed unused logging
 * 9.00     2014 05 05      maquino         added support for translation
 * 10.00    2014 05 07      maquino         changed translation retrieval logic to remove installation error
 * 11.00    2014 05 14      pmiller         Added dummy translation (zh_CN) for initial testing
 */

var onServerLog = true;
var MSG_TITLE = 'Bundle Install';
var ptmServLib = psa_ptm.serverlibrary;
var logger = new psa_ptm.serverlibrary.logger(MSG_TITLE, false);

function beforeInstall(toversion) {
    if (onServerLog) {
        logger.enable();
    }
    
    logger.debug('beforeInstall', toversion);
    
    beforeUpdate();
}

function beforeUpdate(fromversion, toversion) {
    var advancedProjects = ptmServLib.isFeatureEnabled('ADVANCEDJOBS');
    var customRecords = ptmServLib.isFeatureEnabled('customrecords');
    var clientScript = ptmServLib.isFeatureEnabled('customcode');
    var serverScript = ptmServLib.isFeatureEnabled('serversidescripting');
    
    if (onServerLog) {
        logger.enable();
    }
    
    logger.debug('beforeUpdate', fromversion + ' - ' + toversion);
    
    if ( advancedProjects 
            && customRecords
            && clientScript
            && serverScript) {
        logger.debug('Feature', 'advanced projects, custom records, client/server side scripts enabled.');
    }
    else {
        throw new nlobjError('INSTALLATION_ERROR', getfeatureDisabledErrorMessage());
    }
}

/**
 * @param {Number} toversion
 * @returns {Void}
 */
function afterInstall(toversion) {

}

/**
 * @param {Number} fromversion
 * @param {Number} toversion
 * @returns {Void}
 */
function afterUpdate(fromversion, toversion) {

}

/**
 * @param {Number} fromversion
 * @param {Number} toversion
 * @returns {Void}
 */
function getfeatureDisabledErrorMessage(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var featureDisabledErrorMessage = {
        'cs_CZ' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'da_DK' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'de_DE' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'en'    : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'en_US' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'es_AR' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'es_ES' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'fr_CA' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'fr_FR' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'it_IT' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'ja_JP' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'ko_KR' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'nl_NL' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'pt_BR' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'ru_RU' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'sv_SE' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'th_TH' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'zh_CN' : '星期 Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'zh_TW' : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.'
    };
    return featureDisabledErrorMessage[lang] ? featureDisabledErrorMessage[lang] : 'Feature [Advanced Projects], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.';
}