/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['N/record', 'N/search', '../class/config'], function (nRecord, nSearch, Config) {
  'use strict';

  return new Config(nRecord, nSearch);
});
