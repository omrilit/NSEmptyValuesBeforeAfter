/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This class handles the printing of customer statements.
 * Returns an nlobjFile of the PDF.
 *
 * @author cboydon
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerStatementPrinter = function CustomerStatementPrinter () {
  this.printCustomerStatement = printCustomerStatement;

  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;

  function printCustomerStatement (statementForm, evaluationResultView) {
    var recPrinter = new suite_l10n.app.RecordPrinter();
    var def = createDef(statementForm, evaluationResultView);

    return recPrinter.printRecord(def);
  }

  function createDef (statementForm, evaluationResultView) {
    var TYPE = 'STATEMENT';
    var MODE = 'PDF';

    var def = new suite_l10n.view.RecordPrinterDefinition();
    def.type = TYPE;
    def.id = evaluationResultView.customer;
    def.mode = MODE;
    def.properties = createProperties(statementForm);

    return def;
  }

  function createProperties (statementForm) {
    var properties = {};
    var statementDate = getStatementDate(statementForm.statementDate);
    var statementStartDate = getStatementStartDate(statementForm.statementStartDate);

    properties.openonly = statementForm.isOpenOnly;
    properties.startdate = statementStartDate ? statementStartDate.toString('date') : null;
    properties.statementdate = statementDate.toString('date');
    properties.formnumber = statementForm.customformid;

    return properties;
  }

  function getStatementStartDate (startDateDaysToAdd) {
    var date = new ns_wrapper.Date();

    if (startDateDaysToAdd) {
      date.addDays(startDateDaysToAdd);
    } else {
      date = null;
    }
    return date;
  }

  function getStatementDate (statementDateDaysToAdd) {
    var date = new ns_wrapper.Date();
    var SYS_PARAMS = 'syspar_type';
    var DEFAULT_STATEMENT_DATE = 'DEFAULT_STATEMENT_DATE';
    var sysParamsVariables = new LocalizationVariableList(SYS_PARAMS);

    var defaultStatementDate = sysParamsVariables.getValue(DEFAULT_STATEMENT_DATE);

    if (statementDateDaysToAdd) {
      date.addDays(statementDateDaysToAdd);
    } else {
      date.addDays(defaultStatementDate);
    }
    return date;
  }
};
