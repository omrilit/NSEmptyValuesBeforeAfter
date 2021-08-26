/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
*/

define(['../adapter/fam_adapter_https',
        '../adapter/fam_adapter_record',
        '../adapter/fam_adapter_runtime',
        '../adapter/fam_adapter_url',
        './fam_util_math'],
function (https, record, runtime, url, utilMath){
    return {
        baseCurrency: null,  // store in memory in case already retrieved
        getPrecision : function getPrecision(currencyId) {
            try {
                // if single instance, currency is not set on asset
                // load company info and use base currency
                // this does not work on non-multicurrency accounts
                if (!currencyId && !runtime.isFeatureInEffect('SUBSIDIARIES')) {
                    if (!this.baseCurrency) {  // cache to avoid multiple calls
                        this.baseCurrency = +this.getBaseCurrency();
                    }
                    currencyId = this.baseCurrency;
                }
                
                // avoid exception if currency id is still undefined
                if (currencyId) {
                    var currency = record.load({ type : 'currency', id : currencyId });
                    return currency.getValue({fieldId : 'currencyprecision' });
                }
                else {
                    log.debug('fam_util_currency.getPrecision', 'Currency Id not specified. Defaulting to precision 2.');
                    return 2;
                }
            } catch (e) {
                log.error('fam_util_currency.getPrecision for currency ' + currencyId, 'Defaulting to precision 2. Exception: ' +  e);
                return 2; // Default to 2 decimal places
            }
        },
    
        round : function round(num, currencyId) {
            var prcn = this.getPrecision(currencyId);
            var ret = utilMath.roundByPrecision(num, prcn);
            return ret;
        },
        
        getBaseCurrency : function() {
            var suiteletURL = url.resolveScript({
                scriptId    : 'customscript_fam_serverapi_su',
                deploymentId: 'customdeploy_fam_serverapi_su',
                params: { func: 'loadConfig', params: 'companyinformation,basecurrency' },
                returnExternalUrl : true
            });
            
            var response = https.request({
                url : suiteletURL,
                method: https.getMethod().GET
            });
            
            return response.body || 1;
        }
    };
});