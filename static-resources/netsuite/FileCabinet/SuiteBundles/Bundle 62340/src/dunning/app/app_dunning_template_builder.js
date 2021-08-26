/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {dunning.view.DunningTemplate} templateView
 * @constructor
 */
dunning.app.TemplateBuilder = function (templateView) {
  this._bodyRenderer = new ns_wrapper.TemplateRenderer();
  this._subjectRenderer = new ns_wrapper.TemplateRenderer();
  this._crmTemplateRecord = undefined;
  this._templateView = templateView;
};

dunning.app.TemplateBuilder.prototype = {

  /**
   * @param {Error} e
   * @param {string} code
   * @param {string} details
   * @returns {nlobjError}
   * @private
   */
  _createError: function (e, code, details) {
    details += ' Details: ' + JSON.stringify(e);
    nlapiLogExecution('ERROR', code, details);
    return nlapiCreateError(code, details);
  },

  /**
   * @returns {ns_wrapper.Record}
   * @private
   */
  _getCRMTemplateRecord: function () {
    if (!this._crmTemplateRecord) {
      var id = this._templateView.dunningCRMTemplate.emailTemplate;
      this._crmTemplateRecord = new ns_wrapper.Record('emailtemplate', id);
    }

    return this._crmTemplateRecord;
  },

  /**
   * @param {string} subjectText
   * @returns {string}
   * @private
   */
  _renderSubject: function (subjectText) {
    this._subjectRenderer.setTemplate(subjectText);
    return this._subjectRenderer.renderToString();
  },

  /**
   * @param {string} label
   * @param {nlobjRecord|ns_wrapper.Record} record
   */
  addRecord: function (label, record) {
    try {
      this._bodyRenderer.addRecord(label, record);
      this._subjectRenderer.addRecord(label, record);
      return record.id;
    } catch (exception) {
      throw this._createError(
        exception,
        'DUNNING_TEMPLATE_BUILDER_RECORD_ADDITION_ERROR',
        'An error has occurred while adding record to the template builder.'
      );
    }
  },

  /**
   * @param {string} label
   * @param {nlobjSearchResult[]} results
   */
  addSearchResults: function (label, results) {
    try {
      this._bodyRenderer.addSearchResults(label, results);
      this._subjectRenderer.addSearchResults(label, results);
      return results.length;
    } catch (exception) {
      throw this._createError(
        exception,
        'DUNNING_TEMPLATE_BUILDER_SEARCHRESULT_ADDITION_ERROR',
        'An error has occurred while adding search result to the template builder.'
      );
    }
  },

  /**
   * @returns {string}
   */
  stitchTemplateDocuments: function () {
    var view = this._templateView.dunningTemplateDocument;
    var items = [
      view.headerDocument,
      view.bodyDocument,
      view.footerDocument
    ];
    return items.map(function (item) {
      var file = item ? new ns_wrapper.File(item) : null;
      return file ? file.getValue() : '';
    }).join('');
  },

  /**
   * @returns {string}
   */
  retrieveCRMTemplateContent: function () {
    return this._getCRMTemplateRecord().getFieldValue('content');
  },

  /**
   * @returns {string}
   */
  retrieveCRMTemplateSubject: function () {
    return this._getCRMTemplateRecord().getFieldValue('subject');
  },

  /**
   * @returns {string}
   */
  extractTemplateText: function () {
    return this._templateView.dunningCRMTemplate
      ? this.retrieveCRMTemplateContent()
      : this.stitchTemplateDocuments();
  },

  /**
   * @returns {string}
   */
  getTemplateSubject: function () {
    return this._templateView.dunningCRMTemplate
      ? this.retrieveCRMTemplateSubject()
      : this._templateView.dunningTemplateDocument.subject;
  },

  /**
   * @returns {dunning.view.RenderedTemplate}
   */
  getRenderedTemplate: function () {
    var renderedTemplate = new dunning.view.RenderedTemplate();

    try {
      this._bodyRenderer.setTemplate(this.extractTemplateText());
      renderedTemplate.message = this._bodyRenderer.renderToString();
    } catch (exception) {
      this._createError(
        exception,
        'DUNNING_TEMPLATE_BUILDER_MESSAGE_RENDER_ERROR',
        'An error has occurred while rendering the message.'
      );
    }

    try {
      renderedTemplate.subject = this._renderSubject(this.getTemplateSubject());
    } catch (exception) {
      this._createError(
        exception,
        'DUNNING_TEMPLATE_BUILDER_SUBJECT_RENDER_ERROR',
        'An error has occurred while rendering the subject.'
      );
    }

    return renderedTemplate;
  }
};
