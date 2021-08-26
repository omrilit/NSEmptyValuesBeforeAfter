/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope public
 */

define([
  'N/url',
  'N/format',
  'N/runtime',
  'N/ui/dialog',
  'N/currentRecord',
  '../../module/common/utils',
  '../../constants'
], function (nUrl, nFormat, nRuntime, nDialog, nCurrentRecord, utils, constants) {
  const C = constants.QUEUE_MODULE;
  const context = {
    isOW: false,
    isPdf: false,
    syncLimit: 0,
    translations: {
      'dqf.email.async_info_si': null,
      'dqf.email.async_info_pl': null,
      'dqf.email.no_item_selected': null,
      'dqf.pdf.async_info_si': null,
      'dqf.pdf.async_info_pl': null,
      'dqf.pdf.no_item_selected': null,
      'dqf.remove.async_info_si': null,
      'dqf.remove.async_info_pl': null,
      'dqf.remove.no_item_selected': null,
      'dqf.popup.title': null,
      'dqf.popup.button': null
    }
  };

  /**
   * @param {string} singular
   * @param {string} [plural]
   * @param {number} [number]
   * @return {string}
   */
  function T (singular, plural, number) {
    const n = plural === undefined ? 1 : number;
    return context.translations[n > 1 ? plural : singular];
  }

  /**
   * @returns {Object.<string, string>}
   */
  function getParameters () {
    const record = nCurrentRecord.get();

    const getEntry = function (key) {
      return {
        key: key,
        value: record.getValue({
          fieldId: key
        })
      };
    };
    const onSingleInstanceRemoveSubsidiary = function (entry) {
      return context.isOW || entry.key !== C.FILTER_PARAM.SUBSIDIARY;
    };
    const removeEmptyValues = function (entry) {
      return ['', '0'].indexOf(entry.value) < 0;
    };
    const buildObject = function (params, entry) {
      params[entry.key] = entry.value;
      return params;
    };

    return utils.objectValues(C.FILTER_PARAM)
      .map(getEntry)
      .filter(onSingleInstanceRemoveSubsidiary)
      .filter(removeEmptyValues)
      .reduce(buildObject, {});
  }

  /**
   * @returns {string[]}
   */
  function getMarkedRecordIds () {
    const record = nCurrentRecord.get();
    const sublist = 'custpage_sublist_queue';
    const count = record.getLineCount(sublist);
    const ids = [];

    for (var i = 0; i < count; i++) {
      var selected = record.getSublistValue({
        sublistId: sublist,
        fieldId: 'custpage_sublist_mark',
        line: i
      });

      if (selected) {
        ids.push(record.getSublistValue({
          sublistId: sublist,
          fieldId: 'custpage_sublist_id',
          line: i
        }));
      }
    }

    return ids;
  }

  /**
   * @param {string} message
   * @param {number} length
   * @returns {*}
   */
  function showDialog (message, length) {
    return nDialog.confirm({
      title: T('dqf.popup.title'),
      message: message.replace('{{length}}', length)
    });
  }

  function showMessage (message) {
    nDialog.create({
      title: T('dqf.popup.title'),
      message: message,
      buttons: [
        {label: T('dqf.popup.button'), value: true}
      ]
    });
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  function isDate (key) {
    return [
      C.FILTER_PARAM.LETTER_START,
      C.FILTER_PARAM.LETTER_END,
      C.FILTER_PARAM.EVALUATION_START,
      C.FILTER_PARAM.EVALUATION_END
    ].indexOf(key) !== -1;
  }

  /**
   * @param {Object} params
   */
  function reload (params) {
    window.setWindowChanged(window, false);

    const url = params[C.FILTER_PARAM.URL].replace(/&$/, '');
    delete params[C.FILTER_PARAM.URL];
    delete params[C.FILTER_PARAM.TRANSLATIONS];

    Object.keys(params)
      .filter(isDate)
      .forEach(function (key) {
        params[key] = nFormat.format({
          type: nFormat.Type.DATE,
          value: params[key]
        });
      });

    window.location.href = nUrl.format({
      domain: url,
      params: params
    });
  }

  const process = function (ids, action) {
    const params = getParameters();

    params[C.PARAM.ACTION] = action;
    params[C.PARAM.IDS] = ids.join(',');

    reload(params);
  };

  return {
    pageInit: function () {
      const record = nCurrentRecord.get();
      context.isOW = nRuntime.isFeatureInEffect({ feature: 'SUBSIDIARIES' });
      context.isPdf = record.getValue({fieldId: C.FILTER_PARAM.TYPE}) === 'pdf';
      context.syncLimit = context.isPdf ? C.SYNC_LIMIT.PDF : C.SYNC_LIMIT.EMAIL;
      context.translations = JSON.parse(record.getValue({fieldId: C.FILTER_PARAM.TRANSLATIONS}));
    },

    fieldChanged: function (context) {
      switch (context.fieldId) {
        case C.FILTER_PARAM.PAGE:
        case C.FILTER_PARAM.SIZE:
          reload(getParameters());
          break;
      }
    },

    onRemove: function () {
      const ids = getMarkedRecordIds();
      const remove = function (confirmed) {
        if (confirmed) {
          process(ids, C.ACTION.REMOVE);
        }
      };

      if (ids.length > 0) {
        showDialog(T('dqf.remove.async_info_si', 'dqf.remove.async_info_pl', ids.length), ids.length).then(remove);
      } else {
        showMessage(T('dqf.remove.no_item_selected'));
      }
    },

    toPreviousPage: function () {
      const params = getParameters();

      params[C.FILTER_PARAM.PAGE]--;

      if (params[C.FILTER_PARAM.PAGE] < 2) {
        delete params[C.FILTER_PARAM.PAGE];
      }

      reload(params);
    },

    toNextPage: function () {
      const params = getParameters();

      params[C.FILTER_PARAM.PAGE]++;

      reload(params);
    },

    onSend: function () {
      const ids = getMarkedRecordIds();
      const send = function (confirmed) {
        if (confirmed) {
          process(ids, C.ACTION.PROCESS);
        }
      };

      if (ids.length > context.syncLimit) {
        var message;

        if (context.isPdf) {
          message = T('dqf.pdf.async_info_si', 'dqf.pdf.async_info_pl', ids.length);
        } else {
          message = T('dqf.email.async_info_si', 'dqf.email.async_info_pl', ids.length);
        }

        showDialog(message, ids.length).then(send);
      } else if (ids.length > 0) {
        send(true);
      } else {
        showMessage(context.isPdf ? T('dqf.pdf.no_item_selected') : T('dqf.email.no_item_selected'));
      }
    }
  };
});
