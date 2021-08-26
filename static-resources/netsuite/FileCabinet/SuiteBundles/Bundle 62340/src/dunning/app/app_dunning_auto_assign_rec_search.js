/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.RecordSearch = function RecordSearch () {
  var obj = {
    searchRecord: searchRecord
  };

  var context = ns_wrapper.context();

  function searchRecord (requestDetails, savedSearch) {
    var dpType = requestDetails.type;

    var search = new suite_l10n.view.Search();
    search.type = dpType;
    search.id = savedSearch;
    var searchBuilder = new suite_l10n.app.SearchBuilder(search);

    // Additional filters from request details
    setFilters(requestDetails, search);

    var builtSearch = searchBuilder.buildSearch();
    return builtSearch.getIterator();
  }

  function setFilters (requestDetails, search) {
    var dpType = requestDetails.type;
    var subsidiaryFilterValue = requestDetails.subsidiary;
    var classFilterValue = requestDetails.classification;
    var locationFilterValue = requestDetails.location;
    var departmentFilterValue = requestDetails.department;
    var recordId = requestDetails.recordId;

    // TODO PROBLEM IS WHEN DP'S FILTERS HAVE SCDL. THEY BECOME AND ...not or. We need OR!!!
    var filterInfo = [
      {
        name: 'internalid',
        operator: 'is',
        value: recordId,
        //, join : null
        ignoreEmptyValue: false
      }
    ];

    // Subsidiary
    if (context.isOW()) {
      var filterSubsidiary = {
        name: 'subsidiary',
        operator: 'anyof',
        //, join : null
        value: [subsidiaryFilterValue],
        ignoreEmptyValue: false
      };
      filterInfo.push(filterSubsidiary);
    }

    if (dpType == dunning.view.INVOICE) {
      var cdl = [
        // Class
        {
          name: 'class',
          operator: 'anyof',
          value: classFilterValue,
          join: null,
          ignoreEmptyValue: true
        },

        // Location
        {
          name: 'location',
          operator: 'anyof',
          value: locationFilterValue,
          join: null,
          ignoreEmptyValue: true
        },

        // Department
        {
          name: 'department',
          operator: 'anyof',
          value: departmentFilterValue,
          join: null,
          ignoreEmptyValue: true
        }
      ];

      filterInfo = filterInfo.concat(cdl);
    }

    for (var i = 0; i < filterInfo.length; i++) {
      var row = filterInfo[i];
      var filter = new suite_l10n.view.SearchFilter();
      filter.name = row.name;
      filter.operator = row.operator;
      filter.value = row.value;
      filter.join = null;
      filter.ignoreEmptyValue = true;
      search.filters.push(filter);
    }
  }

  return obj;
};
