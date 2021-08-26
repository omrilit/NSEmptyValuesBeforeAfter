/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerDunningLevelEvaluator = function CustomerDunningLevelEvaluator () {
  var Search = ns_wrapper.Search;

  var obj = {
    evaluateDunningLevel: evaluateDunningLevel
  };

  var SAVED_SEARCH_ID = 'customsearch_3805_dl_eval_invoice_search';

  function getParentOverride (input) {
    var isOverride = false;
    switch (input.recordType) {
      case 'invoice':
        isOverride = input.parentDPOverride;
        break;
      case 'customer':
      default:
        isOverride = input.override;
    }
    return isOverride;
  }

  function isDunnable (type, isParentOverride, hasDP) {
    var dunnable = isParentOverride && hasDP;
    if (type === 'customer') {
      dunnable = !dunnable;
    }
    return dunnable;
  }

  function hasDunningProcedure (invoiceObject) {
    return invoiceObject.dunningProcedure && invoiceObject.dunningProcedure.length > 0;
  }

  function hasReachedMinLevel (invoice, minLevel) {
    var reachedMinLevel = true;
    if (invoice.computedDaysOverdue < 0) {
      var reachedDaysOverdue = invoice.computedDaysOverdue >= minLevel.daysOverdue;
      var reachedAmount = minLevel.convertedAmount > 0 ? invoice.amountDue >= minLevel.convertedAmount : true;
      reachedMinLevel = reachedDaysOverdue && reachedAmount;
    }
    return reachedMinLevel;
  }

  function getInvoiceList (input, minLevel) {
    var invoiceObjectList = input.invoices;
    var parentOverride = getParentOverride(input);
    var invoiceIdList = [];
    for (var i = 0; i < invoiceObjectList.length; i++) {
      var currInvoice = invoiceObjectList[i];
      var hasDP = hasDunningProcedure(currInvoice);
      var includeInvoice = hasReachedMinLevel(currInvoice, minLevel) &&
        isDunnable(input.recordType, parentOverride, hasDP);
      if (includeInvoice) {
        invoiceIdList.push(currInvoice.internalid);
      }
    }
    return invoiceIdList;
  }

  function getDunningLevelCaseStatement (dunningLevels) {
    var caseStatement = ['case'];

    for (var i = dunningLevels.length - 1; i >= 0; i--) {
      var currLevel = dunningLevels[i];

      var whenStatement = ['when {daysoverdue} >=', currLevel.daysOverdue];
      if (Number(currLevel.convertedAmount) > 0) {
        whenStatement.push('and {amountremaining} >= ');
        whenStatement.push(currLevel.convertedAmount);
      }

      whenStatement.push('then');
      whenStatement.push(i);

      caseStatement.push(whenStatement.join(' '));
    }
    caseStatement.push('else -1 end');
    return caseStatement.join(' ');
  }

  function searchMaxLevel (dunningCaseStatement, invoiceList) {
    var column = new nlobjSearchColumn('formulatext', null, 'max');
    column.setFormula(dunningCaseStatement);

    var filters = [new nlobjSearchFilter('internalid', null, 'anyof', invoiceList)];

    var search = new Search('transaction');
    search.setSavedSearchId(SAVED_SEARCH_ID);
    search.addFilters(filters);
    search.addColumns(column);

    var rs = search.getIterator();

    var levelId = -1;

    if (rs.hasNext()) {
      var res = rs.next();
      levelId = res.getValue(column);
    }

    return levelId;
  }

  function evaluateDunningLevel (input) {
    var invoiceList = getInvoiceList(input, input.dunningLevels[0]);

    var dunningCaseStatement = getDunningLevelCaseStatement(input.dunningLevels);
    nlapiLogExecution('DEBUG', 'dunningCaseStatement', dunningCaseStatement);

    var newLevel = null;
    if (invoiceList.length > 0) {
      var levelId = searchMaxLevel(dunningCaseStatement, invoiceList);

      // newLevel may be an object or null
      newLevel = (levelId > -1) ? input.dunningLevels[levelId] : null;
      input.invoices = invoiceList;
    }

    return newLevel;
  }

  return obj;
};
