/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

dunning.component.wf.checkLastSentDate = function (assessmentInput) {
  var dpDao = new dao.DunningProcedureDAO();
  var procedure = dpDao.retrieve(assessmentInput.procedure);
  var isSentDateCleared = true;

  if (procedure.disableMinimumDunningInterval === 'F') {
    var currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    var nextSendDate = nlapiAddDays(nlapiStringToDate(assessmentInput.lastSentDate), procedure.daysBetweenSendingLetters);
    nextSendDate.setHours(0, 0, 0, 0);
    isSentDateCleared = currDate >= nextSendDate;

    nlapiLogExecution('DEBUG', 'isSentDateCleared: ' + isSentDateCleared, [
      'Current System Date',
      nlapiDateToString(currDate),
      'Next Allowed Date for sending a dunning letter',
      nlapiDateToString(nextSendDate),
      'Days between sending letters',
      procedure.daysBetweenSendingLetters].join('  -  '));
  }

  return isSentDateCleared;
};

dunning.component.wf.isForEvaluation = function (assessmentInput) {
  // do not dunn invoices in closed accounting periods
  if (assessmentInput.recordType === 'invoice') {
    var data = nlapiLookupField('invoice', assessmentInput.internalid, [
      'accountingperiod.closed',
      'accountingperiod.allownonglchanges'
    ]);

    if (data['accountingperiod.closed'] === 'T' && data['accountingperiod.allownonglchanges'] === 'F') {
      return false;
    }
  }

  if (assessmentInput.dunningPaused === 'T') {
    return false;
  }
  if (!assessmentInput.procedure || assessmentInput.procedure.length === 0) {
    return false;
  }
  if (assessmentInput.lastSentDate) {
    return dunning.component.wf.checkLastSentDate(assessmentInput);
  }
  return true;
};

dunning.component.wf.DunningEvaluator = function () {
  var context = ns_wrapper.context();

  // Step 1 - Get the common assessment input object for the assessor class
  function getAssessmentInput (recordId) {
    var className = context.getScriptSetting('custscript_3805_dn_source_adaptor_class');
    var sourceAdaptor = dunning.app.DunningSourceAdaptorFactory(className);
    var assessmentInput = null;

    if (sourceAdaptor) {
      assessmentInput = sourceAdaptor.getDunningLevelAssessmentInput(recordId);
    }

    return assessmentInput;
  }

  // Step 2 - Assess the level using input from step 1
  function getUpdatedDunningLevel (assessmentInput) {
    var processor = new dunningPL.DunningEvaluator();
    return processor.evaluateDunningLevel(assessmentInput);
  }

  // Step 3 - create results based on the assessment results
  function createDunningResults (assessmentInput, newLevel) {
    if (newLevel) {
      var className = context.getScriptSetting('custscript_3805_dn_result_creator_class');
      var resultCreator = dunning.app.DunningResultCreatorFactory(className, assessmentInput, newLevel);
      resultCreator.createResults(assessmentInput, newLevel);
    }
  }

  function changedDunningLevel (assessmentInput, newLevel) {
    var initialLevel = assessmentInput.level !== null;
    var noInitalLevel = !initialLevel || initialLevel.length === 0;
    var hasNewLevel = (newLevel !== null);
    var changedFromLevel0 = noInitalLevel && hasNewLevel;
    var changedToLevel0 = initialLevel && !hasNewLevel;
    var changedLevel = hasNewLevel && (newLevel.id != assessmentInput.level);

    return changedFromLevel0 || changedToLevel0 || changedLevel;
  }

  function updateDunningLevel (type, id, newLevel) {
    var newLevelId = newLevel ? newLevel.id : newLevel;
    var levelField = (type === 'customer') ? 'custentity_3805_dunning_level' : 'custbody_3805_dunning_level';

    nlapiSubmitField(type, id, levelField, newLevelId);
  }

  function processAssessmentResults (assessmentInput, newLevel) {
    if (changedDunningLevel(assessmentInput, newLevel)) {
      createDunningResults(assessmentInput, newLevel);
      updateDunningLevel(assessmentInput.recordType, assessmentInput.internalid, newLevel);
    }
  }

  /**
   * Used this setup to allow use by other functions/objects
   */
  this.evaluate = function (type, id) {
    var assessmentInput = getAssessmentInput(id);
    var newLevel = null;

    if (dunning.component.wf.isForEvaluation(assessmentInput)) {
      var hasInvoices = assessmentInput.invoices.length > 0;

      if (hasInvoices) {
        // No need for evaluation for if there are no overdue invoices or invoices that need reminders
        newLevel = getUpdatedDunningLevel(assessmentInput);
      }
      processAssessmentResults(assessmentInput, newLevel);
    }
    return newLevel;
  };
};

dunning.component.wf.evaluate = function () {
  var evaluator = new dunning.component.wf.DunningEvaluator();

  try {
    return evaluator.evaluate(nlapiGetRecordType(), nlapiGetRecordId());
  } catch (e) {
    if (e.getCode() === 'SSS_USAGE_LIMIT_EXCEEDED') {
      return; // it is safe here
    }
    throw e;
  }
};
