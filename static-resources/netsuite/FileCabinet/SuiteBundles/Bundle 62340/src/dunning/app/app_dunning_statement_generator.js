/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DurationStatementGenerator = function DurationStatementGenerator () {
  this.generateStatement = function generateStatement (input) {
    if (!input) {
      throw nlapiCreateError('DUNNING_STATEMENT_GENERATION_INPUT_REQUIRED', 'Method dunning.app.DurationStatementGenerator.generateStatement requires an input parameter of type DunningLevelStatementGeneratorInput');
    }
    var condition = [];
    condition.push('(TRUNC(SYSDATE)-TRUNC({duedate})) >=' + input['daysOverdue']);
    condition.push('{customer.daysoverdue} >=' + input['daysOverdue']);

    return '(' + condition.join(' and ') + ')';
  };
};

dunning.app.AmountStatementGenerator = function AmountStatementGenerator () {
  this.generateStatement = function generateStatement (input) {
    if (!input) {
      throw nlapiCreateError('DUNNING_STATEMENT_GENERATION_INPUT_REQUIRED', 'Method dunning.app.AmountStatementGenerator.generateStatement requires an input parameter of type DunningLevelStatementGeneratorInput');
    }

    var condition = [];

    /* line is optional if there is an amount in the minimum invoice amount */
    var amountremaining = Number(input['amount']);
    if (input['amount'] !== null && !isNaN(amountremaining)) {
      condition.push('{amountremaining} >=' + amountremaining);
    }

    /* line is optional if there is an amount in the total overdue balance */
    var overdueBalance = Number(input['overdueBalance']);
    if (input['overdueBalance'] !== null && !isNaN(overdueBalance)) {
      condition.push('{customer.overduebalance} >=' + overdueBalance);
    }

    var conditionStr;
    if (condition.length > 0) {
      conditionStr = '(' + condition.join(' {operator} ') + ')';
    }

    return conditionStr;
  };
};
