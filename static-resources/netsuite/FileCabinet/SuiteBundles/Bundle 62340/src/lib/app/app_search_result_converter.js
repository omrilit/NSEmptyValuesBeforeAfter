/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SearchResultConverter = function SearchResultConverter (columnDefs) {
  function convertSearchResult (searchResult) {
    var resultView = new suite_l10n.view.SearchResult();
    for (var i = 0; i < columnDefs.length; i++) {
      var column = columnDefs[i];
      var colName = column.name;
      resultView.values[colName] = column.retrieveValues ? searchResult.getValues(colName) : searchResult
        .getValue(colName);

      if (column.retrieveText) {
        resultView.values[colName + 'Text'] = column.retrieveValues ? searchResult.getTexts(colName) : searchResult
          .getText(colName);
      }
    }
    resultView.id = searchResult.getId();
    resultView.type = searchResult.getRecordType();
    return resultView;
  }

  return {
    convertSearchResult: convertSearchResult
  };
};
