/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/search',
  'N/ui/serverWidget',
  'N/url',
  '../../../lib/N/runtime',
  './search/levels',
  '../common/search_util',
  '../common/di',
  '../common/utils',
  '../common/translate',
  '../../../dunning/constants',
  '../queue/search/results'
],
function (nSearch, nUi, nUrl, nRuntime, levels, search_util, di, utils, T, C, results) {
  const PARAM = C.QUEUE_MODULE.FILTER_PARAM;

  /**
   * @returns {boolean|*}
   * @private
   */
  function isOneWorld () {
    return nRuntime.isFeatureInEffect({feature: 'subsidiaries'});
  }

  /**
   * @typedef {Object} Option
   * @property {string} value
   * @property {string} text
   */

  /**
   * @param {string} value
   * @param {string} [text]
   * @returns {Option}
   */
  const option = function (value, text) {
    return {
      value: value,
      text: text || value
    };
  };

  /**
   * @returns {Option}
   */
  const emptyOption = function () {
    return option('0', '&nbsp;');
  };

  /**
   * @param {number} id
   * @returns {string}
   */
  function getEvaluationResultUrl (id) {
    return nUrl.resolveRecord({
      recordType: C.TYPE.EVALUATION_RESULT,
      recordId: String(id),
      isEditMode: false,
      params: {}
    });
  }

  /**
   * @param {Sublist} sublist
   * @param {Result} result
   * @param {number} line
   */
  function addToSublist (sublist, result, line) {
    function setter (id, lens) {
      return function (column) {
        sublist.setSublistValue({
          id: id,
          line: line,
          value: lens(column)
        });
      };
    }

    function text (column) {
      return result.getText(column);
    }

    function value (column) {
      return result.getValue(column);
    }

    function yesNo (column) {
      return value(column) === 'T'
        ? T('dqf.filter.boolean.yes')
        : T('dqf.filter.boolean.no');
    }

    sublist.setSublistValue({
      id: 'custpage_sublist_id',
      line: line,
      value: String(result.id)
    });

    const setters = {
      customer: setter('custpage_sublist_customer', text),
      recipient: setter('custpage_sublist_recipient', function (column) {
        // workaround for bug - entity sometimes returns an internalid instead of the entityid
        const entity = value(column);
        if (/^\d+$/.test(entity)) {
          return result.getText({
            name: 'custrecord_3805_evaluation_result_cust'
          });
        }
        return entity;
      }),
      applies_to: setter('custpage_sublist_appliesto', text),
      procedure: setter('custpage_sublist_dunningprocedure', text),
      level: setter('custpage_sublist_dunninglevel', text),
      last_letter_sent: setter('custpage_sublist_lastlettersent', value),
      allow_print: setter('custpage_sublist_allowprint', yesNo),
      allow_email: setter('custpage_sublist_allowemail', yesNo),
      evaluation_date: setter('custpage_sublist_evaluationdate', value)
    };
    if (isOneWorld()) {
      setters.subsidiary = setter('custpage_sublist_subsidiary', text);
    }

    result.columns
      .filter(function (column) {
        return setters.hasOwnProperty(column.label);
      })
      .forEach(function (column) {
        setters[column.label](column);
      });

    sublist.setSublistValue({
      id: 'custpage_sublist_view',
      line: line,
      value: getEvaluationResultUrl(result.id)
    });
  }

  function getCustomersOfDunningMgr () {
    var userId = nRuntime.getCurrentUser().id;

    const customerSearch = nSearch.create({
      columns: ['entityid', 'companyname', 'internalid'],
      join: ['customrecord_3805_dunning_eval_result'],
      filters: ['custentity_3805_dunning_manager', 'anyof', userId],
      type: nSearch.Type.CUSTOMER
    });

    var searchResult = search_util.fetchAll(customerSearch, function (result) {
      return {name: result.getValue('entityid') + ' ' + result.getValue('companyname'), internalid: result.getValue('internalid')};
    });

    var customerOptions = [];
    customerOptions.push(emptyOption());

    for (var i = 0; i < searchResult.length; i++) {
      customerOptions.push({text: searchResult[i].name, value: searchResult[i].internalid});
    }

    return customerOptions;
  }

  return {

    /**
     * Returns options for Dunning Level filter field
     *   - e.g. shows only 4 DL, if cust has only 4 DL (not all 15)
     * @returns {Array.<Option>}
     * @private
     */
    getLevelOptions: function () {
      /* istanbul ignore next */
      const options = levels.fetchAllNames().map(function (name) { return option(name, name); });
      return [emptyOption()].concat(options);
    },

    /**
     * @returns {Array.<Option>}
     * @private
     */
    getTargetOptions: function () {
      const options = [emptyOption()];
      const data = di.variables().getByType(di.variables().Type.DUNNING_SOURCE);

      /* istanbul ignore next */
      Object.keys(data).forEach(function (id) {
        options.push(option(id, data[id]));
      });

      return options;
    },

    /**
     * @param {number} pageCount
     * @returns {Array}
     * @private
     */
    getPageNumberOptions: function (pageCount) {
      const result = [];
      for (var i = 1; i <= pageCount; i++) {
        result.push(option(String(i)));
      }
      return result;
    },

    /**
     * @param {Sublist} sublist
     * @private
     */
    createQueueHeader: function (sublist) {
      sublist.addField({
        id: 'custpage_sublist_mark',
        label: T('dqf.sublist.common.mark'),
        type: nUi.FieldType.CHECKBOX
      });

      sublist.addField({
        id: 'custpage_sublist_id',
        label: 'id',
        type: nUi.FieldType.INTEGER
      }).updateDisplayType({
        displayType: nUi.FieldDisplayType.HIDDEN
      });

      const field = sublist.addField({
        id: 'custpage_sublist_view',
        label: T('dqf.sublist.common.view'),
        type: nUi.FieldType.URL
      });
      field.linkText = T('dqf.sublist.common.view');

      sublist.addField({
        id: 'custpage_sublist_customer',
        label: T('dqf.sublist.common.customer'),
        type: nUi.FieldType.TEXT
      });

      if (isOneWorld()) {
        sublist.addField({
          id: 'custpage_sublist_subsidiary',
          label: T('dqf.sublist.common.subsidiary'),
          type: nUi.FieldType.TEXT
        });
      }

      sublist.addField({
        id: 'custpage_sublist_recipient',
        label: T('dqf.sublist.common.related_entity'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_dunninglevel',
        label: T('dqf.sublist.common.dunning_level'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_dunningprocedure',
        label: T('dqf.sublist.common.dunning_procedure'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_appliesto',
        label: T('dqf.sublist.dp.applies_to'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_allowemail',
        label: T('dqf.sublist.record.dunning_allow_email'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_allowprint',
        label: T('dqf.sublist.record.dunning_allow_print'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_lastlettersent',
        label: T('dqf.sublist.record.last_letter_sent'),
        type: nUi.FieldType.TEXT
      });

      sublist.addField({
        id: 'custpage_sublist_evaluationdate',
        label: T('dqf.sublist.common.evaluation_date'),
        type: nUi.FieldType.TEXT
      });
    },

    /**
     * @param {Sublist} sublist
     * @param {number} page
     * @param {number} pageLength
     * @param {boolean} isEmailQueue
     * @private
     */
    createQueueButtons: function (sublist, page, pageLength, isEmailQueue) {
      const currentPage = parseInt(page);

      sublist.addMarkAllButtons();

      sublist.addButton({
        id: 'custpage_sublist_send',
        label: isEmailQueue
          ? T('dqf.form.action.send')
          : T('dqf.form.action.print'),
        functionName: 'onSend'
      });

      sublist.addButton({
        id: 'custpage_sublist_remove',
        label: T('dqf.form.action.remove'),
        functionName: 'onRemove'
      });

      if (currentPage !== 1 && ~~pageLength !== 0) {
        sublist.addButton({
          id: 'custpage_sublist_prev',
          label: T('dqf.form.action.prev'),
          functionName: 'toPreviousPage'
        });
      }

      if (currentPage !== pageLength) {
        sublist.addButton({
          id: 'custpage_sublist_next',
          label: T('dqf.form.action.next'),
          functionName: 'toNextPage'
        });
      }
    },

    /**
     * @param {module:N/ui/serverWidget.Form} form
     * @param {Object} params parameters from context.request
     * @private
     */
    buildFiltersTab: function (form, params) {
      const tab = 'custpage_tab_filters';

      form.addFieldGroup({
        id: tab,
        label: T('dqf.filter.fieldGroup')
      });

      utils.addField(form, params, {
        id: PARAM.CUSTOMER,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.customer'),
        help: T('dqf.filter.customer.help'),
        source: 'customer',
        container: tab
      });

      if (isOneWorld()) {
        utils.addField(form, params, {
          id: PARAM.SUBSIDIARY,
          type: nUi.FieldType.SELECT,
          label: T('dqf.filter.subsidiary'),
          help: T('dqf.filter.subsidiary.help'),
          source: 'subsidiary',
          container: tab
        });
      }

      utils.addField(form, params, {
        id: PARAM.PROCEDURE,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.procedure'),
        help: T('dqf.filter.procedure.help'),
        source: 'customrecord_3805_dunning_procedure',
        container: tab
      });

      utils.addField(form, params, {
        id: PARAM.LEVEL,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.dpLevel'),
        help: T('dqf.filter.dpLevel.help'),
        container: tab,
        options: this.getLevelOptions()
      });

      utils.addField(form, params, {
        id: PARAM.TARGET,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.appliesTo'),
        help: T('dqf.filter.appliesTo.help'),
        container: tab,
        options: this.getTargetOptions()
      });

      utils.addField(form, params, {
        id: PARAM.LETTER_START,
        type: nUi.FieldType.DATE,
        label: T('dqf.filter.lastLtrSentStart'),
        help: T('dqf.filter.lastLtrSentStart.help'),
        container: tab
      });

      utils.addField(form, params, {
        id: PARAM.LETTER_END,
        type: nUi.FieldType.DATE,
        label: T('dqf.filter.lastLtrSentEnd'),
        help: T('dqf.filter.lastLtrSentEnd.help'),
        container: tab
      });

      utils.addField(form, params, {
        id: PARAM.EVALUATION_START,
        type: nUi.FieldType.DATE,
        label: T('dqf.filter.evalDateStart'),
        help: T('dqf.filter.evalDateStart.help'),
        container: tab
      });

      utils.addField(form, params, {
        id: PARAM.EVALUATION_END,
        type: nUi.FieldType.DATE,
        label: T('dqf.filter.evalDateEnd'),
        help: T('dqf.filter.evalDateEnd.help'),
        container: tab
      });
    },

    /**
     * @param {module:N/ui/serverWidget.Form} form
     * @param {SearchPagedData} pagedData search containing all the records for  the queue, divided into pages
     * @param {number} pageNumber number of current page (from pagedSearch)
     * @param {number} pageSize size of a page (number of records)
     * @private
     */
    buildPagingOptionsTab: function (form, pagedData, pageNumber, pageSize) {
      const tab = 'custpage_tab_page_options';

      form.addFieldGroup({
        id: tab,
        label: T('dqf.filter.pagination.fieldGroup')
      });

      utils.addField(form, {}, {
        id: PARAM.PAGE,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.pagination.page'),
        help: T('dqf.filter.pagination.page.help'),
        container: tab,
        layoutType: nUi.FieldLayoutType.STARTROW,
        options: this.getPageNumberOptions(pagedData.pageRanges.length),
        defaultValue: pageNumber
      });

      utils.addField(form, {}, {
        id: PARAM.SIZE,
        type: nUi.FieldType.SELECT,
        label: T('dqf.filter.pagination.size'),
        help: T('dqf.filter.pagination.size.help'),
        container: tab,
        layoutType: nUi.FieldLayoutType.MIDROW,
        // options: this.getPageSizeOptions(),
        options: [option('30'), option('50'), option('100')],
        defaultValue: pageSize
      });

      utils.addField(form, {}, {
        id: 'custpage_page_pagetotal',
        type: nUi.FieldType.INTEGER,
        label: T('dqf.filter.pagination.max_page'),
        help: T('dqf.filter.pagination.max_page.help'),
        container: tab,
        layoutType: nUi.FieldLayoutType.MIDROW,
        displaySize: {
          height: 0,
          width: 10
        },
        displayType: nUi.FieldDisplayType.DISABLED,
        defaultValue: pagedData.pageRanges.length
      });

      utils.addField(form, {}, {
        id: 'custpage_page_emailtotal',
        type: nUi.FieldType.INTEGER,
        label: T('dqf.filter.pagination.total'),
        help: T('dqf.filter.pagination.total.help'),
        container: tab,
        layoutType: nUi.FieldLayoutType.ENDROW,
        displaySize: {
          height: 0,
          width: 10
        },
        displayType: nUi.FieldDisplayType.DISABLED,
        defaultValue: pagedData.count
      });
    },

    /**
     * @param {SearchPagedData} pagedData
     * @returns {boolean}
     * @private
     */
    isPagedSearchEmpty: function (pagedData) {
      return pagedData.count < 1;
    },

    /**
     * Gets records for a single page of a queue
     * @param {SearchPagedData} pagedData search to get data from
     * @param {number} pageNumber number of page to pull data for
     * @param {Sublist} sublist queue to add data into
     * @private
     */
    getDataFromPagedSearch: function (pagedData, pageNumber, sublist) {
      const data = pagedData.fetch({
        index: pagedData.pageRanges[pageNumber - 1].index
      });

      data.data.forEach(function (result, line) {
        addToSublist(sublist, result, line);
      });
    },

    /**
     * Builds an sublist / queue with all the records from the search
     * @param {Form} form sublist is added to this form
     * @param {number} pageNumber number of current page (from pagedSearch)
     * @param {SearchPagedData} pagedData search containing all the records for  the queue, divided into pages
     * @param {boolean} isEmailQueue
     * @returns {Sublist}
     * @private
     */
    buildQueue: function (form, pageNumber, pagedData, isEmailQueue) {
      const sublist = form.addSublist({
        id: 'custpage_sublist_queue',
        label: T('dqf.filter.currentQueue'),
        type: nUi.SublistType.LIST
      });
      this.createQueueHeader(sublist);
      this.createQueueButtons(sublist, pageNumber, pagedData.pageRanges.length, isEmailQueue);

      return sublist;
    },

    /**
     * @param {Object.<string, string>} params array of parameters from context.request
     * @param {SearchPagedData} pagedData search containing all the records for  the queue, divided into pages
     * @param {number} pageNumber number of current page (from pagedSearch)
     * @param {number} pageSize size of a page (number of records)
     * @param {boolean} isEmailQueue
     * @returns {Form}
     */
    buildForm: function (params, pagedData, pageNumber, pageSize, isEmailQueue) {
      const form = nUi.createForm({
        title: isEmailQueue
          ? T('dqf.form.send.title')
          : T('dqf.form.print.title')
      });

      form.clientScriptModulePath = '../../component/cs/cs_dunning_queue_ss2.js';

      utils.addField(form, params, {
        id: PARAM.URL,
        type: nUi.FieldType.TEXT,
        label: 'url',
        displayType: nUi.FieldDisplayType.HIDDEN
      });

      utils.addField(form, params, {
        id: PARAM.TYPE,
        type: nUi.FieldType.TEXT,
        label: 'type',
        displayType: nUi.FieldDisplayType.HIDDEN
      });

      utils.addField(form, params, {
        id: PARAM.TRANSLATIONS,
        type: nUi.FieldType.LONGTEXT,
        label: 'translations',
        displayType: nUi.FieldDisplayType.HIDDEN
      });

      form.addSubmitButton({
        label: T('dqf.filter.applyFiltersButton')
      });

      this.buildFiltersTab(form, params);
      this.buildPagingOptionsTab(form, pagedData, pageNumber, pageSize);

      const queue = this.buildQueue(form, pageNumber, pagedData, isEmailQueue);
      if (!this.isPagedSearchEmpty(pagedData)) {
        this.getDataFromPagedSearch(pagedData, pageNumber, queue);
      }

      return form;
    }
  };
});
