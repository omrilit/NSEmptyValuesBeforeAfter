/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningEvalStatementManager = function DunningEvalStatementManager () {
  var STATEMENT_RECORD_TYPE = 'customrecord_3805_dunning_eval_statement';
  var STATEMENT_RECORD_STATEMENT_FIELD = 'custrecord_3805_des_statement';

  this.getEvaluationStatements = function getEvaluationStatements (procList) {
    var evalStatementGenerator = new dunning.app.DunningEvalStatementGenerator();

    return evalStatementGenerator.getEvaluationStatements(procList);
  };

  var evalStatementDAO = null;

  function getEvalStatementDAO () {
    if (!evalStatementDAO) {
      evalStatementDAO = new dao.DunningEvaluationStatementDAO();
    }
    return evalStatementDAO;
  }

  this.getEvalStatementRecords = function getEvalStatementRecords (procList) {
    return getEvalStatementDAO().retrieveByProcedures(procList);
  };

  this.filterStatementRecordsById = function filterStatementRecordsById (evalStatementRecords, procId) {
    function filterFunction (res) {
      return res.dunningProcedure == procId;
    }

    return evalStatementRecords.filter(filterFunction);
  };

  this.filterStatementRecordsByCurrency = function filterStatementRecordsByCurrency (evalStatementRecords, currency) {
    function filterFunction (res) {
      return res.currency == currency;
    }

    return evalStatementRecords.filter(filterFunction);
  };

  this.createEvalStatement = function createEvalStatement (procedureId, currency, statement) {
    var model = new dunning.model.DunningEvaluationStatement();
    model.dunningProcedure = procedureId;
    model.currency = currency;
    model.statement = statement;

    getEvalStatementDAO().create(model);
  };

  this.updateEvalStatements = function updateEvalStatements (procedureId, evalStringsByCurrency, evalStatementRecords) {
    for (var currency in evalStringsByCurrency) {
      var statement = evalStringsByCurrency[currency];
      var record = this.filterStatementRecordsByCurrency(evalStatementRecords, currency)[0];
      if (!record) {
        this.createEvalStatement(procedureId, currency, statement);
      } else {
        ns_wrapper.api.field
          .submitField(STATEMENT_RECORD_TYPE, record.id, STATEMENT_RECORD_STATEMENT_FIELD, statement);
      }
    }
  };

  this.updateEvaluationStatementRecords = function updateEvaluationStatementRecords (procList) {
    var evalStatementStrings = this.getEvaluationStatements(procList);
    var evalStatementRecords = this.getEvalStatementRecords(procList);

    // Update Evaluation Statement Records for each Dunning Procedure
    for (var i = 0; i < procList.length; i++) {
      var procedureId = procList[i];
      var procedureEvalStrings = evalStatementStrings[procedureId];
      var procedureEvalStatementRecords = this.filterStatementRecordsById(evalStatementRecords, procedureId);
      this.updateEvalStatements(procedureId, procedureEvalStrings, procedureEvalStatementRecords);
    }
  };
};
