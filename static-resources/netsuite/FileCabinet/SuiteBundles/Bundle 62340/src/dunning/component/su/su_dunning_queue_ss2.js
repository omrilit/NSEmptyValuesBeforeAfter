/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope public
 */

define([
  'N/url',
  './../../../lib/N/runtime',
  '../../module/common/utils',
  '../../module/common/Request',
  '../../module/common/cache',
  '../../module/queue/search/results',
  '../../module/queue/form_builder',
  '../../module/queue/action/process',
  '../../module/queue/action/remove',
  '../../module/common/translate',
  '../../constants'
],
function (nUrl, nRuntime, utils, Request, cache, results, formBuilder, process, remove, T, C) {
  'use strict';

  const MODULE = C.QUEUE_MODULE;

  return {
    onRequest: function (context) {
      const script = nRuntime.getCurrentScript();
      const request = new Request(context.request, script);
      const params = context.request.parameters;

      request.onProcess.push(process);
      request.onRemove.push(remove);

      const cleanParams = function () {
        utils.objectValues(C.QUEUE_MODULE.FILTER_PARAM)
          .filter(function (key) { return params[key] === ''; })
          .forEach(function (key) { delete params[key]; });

        delete params[C.QUEUE_MODULE.PARAM.TYPE];
        delete params[C.QUEUE_MODULE.PARAM.ACTION];
        delete params[C.QUEUE_MODULE.PARAM.PAGE];
        delete params[C.QUEUE_MODULE.PARAM.IDS];
        delete params[C.QUEUE_MODULE.FILTER_PARAM.TYPE];
        delete params[C.QUEUE_MODULE.FILTER_PARAM.URL];

        context.response.sendRedirect({
          type: nRuntime.ContextType.SUITELET,
          identifier: C.QUEUE_MODULE.SUITELET.SCRIPT,
          id: request.isPdfQueue()
            ? MODULE.SUITELET.DEPLOYMENT.PDF
            : MODULE.SUITELET.DEPLOYMENT.EMAIL,
          parameters: params
        });
      };

      request.onProcess.push(cleanParams);
      request.onRemove.push(cleanParams);

      request.onDefault.push(function () {
        params[MODULE.FILTER_PARAM.URL] = nUrl.resolveScript({
          scriptId: MODULE.SUITELET.SCRIPT,
          deploymentId: request.isPdfQueue()
            ? MODULE.SUITELET.DEPLOYMENT.PDF
            : MODULE.SUITELET.DEPLOYMENT.EMAIL
        });
        params[MODULE.FILTER_PARAM.TYPE] = request.isPdfQueue() ? 'pdf' : 'email';
        params[MODULE.FILTER_PARAM.TRANSLATIONS] = JSON.stringify({
          'dqf.email.async_info_si': T('dqf.email.async_info_si'),
          'dqf.email.async_info_pl': T('dqf.email.async_info_pl'),
          'dqf.email.no_item_selected': T('dqf.email.no_item_selected'),
          'dqf.pdf.async_info_si': T('dqf.pdf.async_info_si'),
          'dqf.pdf.async_info_pl': T('dqf.pdf.async_info_pl'),
          'dqf.pdf.no_item_selected': T('dqf.pdf.no_item_selected'),
          'dqf.remove.async_info_si': T('dqf.remove.async_info_si'),
          'dqf.remove.async_info_pl': T('dqf.remove.async_info_pl'),
          'dqf.remove.no_item_selected': T('dqf.remove.no_item_selected'),
          'dqf.popup.title': T('dqf.popup.title'),
          'dqf.popup.button': T('dqf.popup.button')
        });

        const except = cache.getLockedResults();
        const pageSize = params[MODULE.FILTER_PARAM.SIZE] || 30;
        var pagedData;

        if (request.isPdfQueue()) {
          pagedData = results.pdfQueue(params, pageSize, except);
        } else {
          pagedData = results.emailQueue(params, pageSize, except);
        }

        const pageNumber = utils.trim(~~params[MODULE.FILTER_PARAM.PAGE], 1, pagedData.pageRanges.length);
        const form = formBuilder.buildForm(params, pagedData, pageNumber, pageSize, request.isEmailQueue());

        context.response.writePage(form);
      });

      request.handle();
    }
  };
});
