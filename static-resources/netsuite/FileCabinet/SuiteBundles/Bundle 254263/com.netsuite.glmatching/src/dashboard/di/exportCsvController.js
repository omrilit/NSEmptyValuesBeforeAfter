/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/format", "../../translator/di/translate", "../CsvBuilder", "../exportCsvController", "./currencyRepository", "./findNames", "./transactionSearch"], function (_exports, _format, _translate, _CsvBuilder, _exportCsvController, _currencyRepository, _findNames, _transactionSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.exportCsvController = void 0;
  var csvBuilder = (0, _CsvBuilder.csvBuilderConstructor)(_translate.translate, _format.format, _currencyRepository.currencyRepository);
  var exportCsvController = (0, _exportCsvController.exportCsvControllerConstructor)(csvBuilder, _findNames.findNames, _transactionSearch.transactionSearch);
  _exports.exportCsvController = exportCsvController;
});