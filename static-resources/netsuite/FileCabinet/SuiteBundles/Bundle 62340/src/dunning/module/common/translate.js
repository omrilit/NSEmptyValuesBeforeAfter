/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  '../../../lib/N/runtime',
  './translations',
  './utils'
],
function (nRuntime, translations, utils) {
  'use strict';

  const FALLBACK = 'en_US';

  const getLanguage = utils.memoize(function () {
    const language = nRuntime.getCurrentUser().getPreference({name: 'language'});

    if (translations.hasOwnProperty(language)) {
      return language;
    }

    return FALLBACK;
  });

  /**
   * @param {string} key
   * @returns {string}
   */
  return function (key) {
    return translations[getLanguage()][key];
  };
});
