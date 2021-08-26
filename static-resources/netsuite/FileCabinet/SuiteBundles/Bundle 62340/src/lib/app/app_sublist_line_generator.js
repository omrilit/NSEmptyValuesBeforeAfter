/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SubListLineGenerator = function SubListLineGenerator (input) {
  this.getTotalLineItemCount = function getTotalLineItemCount () {
    var search = input.totalCountSearch;
    var iterator = search.getIterator();
    var result = iterator.next();
    return result.getValue(input.summaryField, null, input.summaryType);
  };

  this.generateLineItems = function generateLineItems (startIndex, endIndex) {
    var search = input.lineItemSearch;
    search.setStartIndex(startIndex);
    search.setEndIndex(endIndex);

    var iterator = search.getIterator();
    var factory = new suite_l10n.app.factory.BasicFactory();
    var resultConverter = factory.getInstance(input.converterClass);

    var lines = [];
    while (iterator.hasNext()) {
      var result = iterator.next();
      var convertedResult = resultConverter.convertToRow(result);
      lines.push(convertedResult);
    }

    return lines;
  };
};
