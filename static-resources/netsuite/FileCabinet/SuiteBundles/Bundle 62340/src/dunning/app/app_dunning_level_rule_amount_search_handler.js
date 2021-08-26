/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLevelRuleAmountSearchHandler = function DunningLevelRuleAmountSearchHandler () {
  this.searchDunningLevelRuleAmount = function searchDunningLevelRuleAmount (dunningLevelRuleId) {
    var URLAPI = ns_wrapper.api.url;

    var suiteletURL = URLAPI.resolveUrl('SUITELET',
      'customscript_3805_search_dlra_su', 'customdeploy_3805_search_dlra_su');
    var responseObj = URLAPI.requestUrlCs(suiteletURL,
      {'dlrId': dunningLevelRuleId.toString()});
    return JSON.parse(responseObj.getBody());
  };
};
