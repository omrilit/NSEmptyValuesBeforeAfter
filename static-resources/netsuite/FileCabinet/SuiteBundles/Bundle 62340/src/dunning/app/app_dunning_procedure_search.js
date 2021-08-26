/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.ProcedureSearch = function ProcedureSearch (dunningAssignViewRequestDetails) {
  var dpType = dunningAssignViewRequestDetails.type;
  var dpSub = dunningAssignViewRequestDetails.subsidiary;
  var dpClass = dunningAssignViewRequestDetails.classification;
  var dpLocation = dunningAssignViewRequestDetails.location;
  var dpDept = dunningAssignViewRequestDetails.department;

  var search = new suite_l10n.view.Search();
  search.type = dunning.view.DUNNING_PROCEDURE_CUSTOM_RECORD;

  // Add mandatory filters here
  prepareSearch();

  function searchDpList () {
    var searchBuilder = new suite_l10n.app.SearchBuilder(search);
    return searchBuilder.buildSearch().getIterator();
  }

  function prepareSearch () {
    search.id = dunning.view.AUTO_ASSIGNMENT_SEARCH;

    // Add filter for source
    addPresetFilterAppliesTo();
    addPresetFilterSCDL();
  }

  function addPresetFilterAppliesTo () {
    var appliesToFilter = new suite_l10n.view.SearchFilter();
    appliesToFilter.name = dunning.view.L10N_VAR_VALUE;
    appliesToFilter.join = dunning.view.DUNNING_PROCEDURE_SOURCE;
    appliesToFilter.operator = 'is';
    appliesToFilter.value = dpType;
    search.filters.push(appliesToFilter);
  }

  function addPresetFilterSCDL () {
    var subsidiaryFilter = new suite_l10n.view.SearchFilter();
    subsidiaryFilter.name = dunning.view.DUNNING_PROCEDURE_SUB;
    subsidiaryFilter.operator = 'anyof';
    subsidiaryFilter.join = null;
    subsidiaryFilter.value = [dpSub];
    search.filters.push(subsidiaryFilter);

    if (dpType == dunning.view.INVOICE) {
      var cdl = [
        {
          name: dunning.view.DUNNING_PROCEDURE_CLASS,
          operator: 'anyof',
          value: dpClass
        },
        {
          name: dunning.view.DUNNING_PROCEDURE_LOC,
          operator: 'anyof',
          value: dpLocation
        },
        {
          name: dunning.view.DUNNING_PROCEDURE_DEPT,
          operator: 'anyof',
          value: dpDept
        }
      ];

      for (var i = 0; i < cdl.length; i++) {
        var row = cdl[i];
        var filter = new suite_l10n.view.SearchFilter();
        filter.name = row.name;
        filter.operator = row.operator;
        filter.value = row.value ? [row.value, '@NONE@'] : '@NONE@';
        filter.join = null;
        search.filters.push(filter);
      }
    }
  }

  return {
    searchDpList: searchDpList
  };
};
