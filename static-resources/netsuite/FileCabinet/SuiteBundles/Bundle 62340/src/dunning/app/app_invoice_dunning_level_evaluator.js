/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceDunningLevelEvaluator = function InvoiceDunningLevelEvaluator () {
  function getInvoiceDunningLevel (invoice, dunningLevels) {
    var assessedLevel = null;

    if (invoice.duedate && (invoice.duedate.length > 0)) {
      for (var i = 0; i < dunningLevels.length; i++) {
        var level = dunningLevels[i];

        var belowLevelDaysOverdue = (Number(level.daysOverdue) > Number(invoice.daysOverdue));
        var minAmt = Number(level.convertedAmount);
        var hitLevelMinAmount = (minAmt === 0) || (minAmt <= Number(invoice.amountDue));
        nlapiLogExecution('DEBUG', invoice.internalid || invoice.id, [
          belowLevelDaysOverdue,
          hitLevelMinAmount,
          level.daysOverdue,
          invoice.daysOverdue,
          level.minOutstandingAmount,
          level.convertedAmount,
          invoice.amountDue].join('      '));
        if (belowLevelDaysOverdue) {
          break;
        } else if (hitLevelMinAmount) {
          assessedLevel = level;
        }
      }
    }
    return assessedLevel;
  }

  function getCurrentDunningLevel (input) {
    var invoices = input.invoices;
    var dunningLevels = input.dunningLevels;
    var newLevel = null;
    var invoiceIdList = [];

    // we're expecting only one invoice here
    var currInvoice = invoices[0];
    if (currInvoice.procedure && (currInvoice.procedure.length > 0)) {
      invoiceIdList.push(currInvoice.internalid);
      var currLevel = getInvoiceDunningLevel(currInvoice, dunningLevels);
      newLevel = currLevel || null;

      input.invoices = invoiceIdList;
    }

    return newLevel;
  }

  function evaluateDunningLevel (input) {
    var level = null;

    if (input.parentDPOverride) {
      level = getCurrentDunningLevel(input);
    }

    return level;
  }

  return {
    evaluateDunningLevel: evaluateDunningLevel
  };
};
