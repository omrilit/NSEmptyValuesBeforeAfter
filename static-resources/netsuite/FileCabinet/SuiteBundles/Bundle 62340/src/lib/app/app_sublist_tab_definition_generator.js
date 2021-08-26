/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SubListTabDefinitionGenerator = function SubListTabDefinitionGenerator (input) {
  this.getLineItemGeneratorInput = function getLineItemGeneratorInput () {
    var setting = new suite_l10n.view.LineItemGeneratorSetting();
    setting.summaryField = this.summaryField;
    setting.summaryType = this.summaryType;
    setting.converterClass = this.converterClass;
    setting.totalCountSearch = this.getTotalCountSearch();
    setting.lineItemSearch = this.getLineItemSearch();

    return setting;
  };

  /**
   *
   * Returns a search object with a single summary column
   */
  this.getTotalCountSearch = function getTotalCountSearch () {
    var search = this.getBaseSearch();
    search.clearSavedSearchColumns(true);
    search.removeColumns();
    search.addSummaryColumn(this.summaryField, this.summaryType);
    return search;
  };

  /**
   * @abstract
   *
   * Returns a search object with filters
   */
  this.getBaseSearch = function getBaseSearch () {
    throw Error('Please override abstract function');
  };

  /**
   * @abstract
   *
   * Returns a search object with columns set for line Item generation.
   */
  this.getLineItemSearch = function getLineItemSearch () {
    throw new Error('Please override abstract function');
  };

  this.generateSubListTabDefinition = function generateSubListTabDefinition () {
    var obj = new suite_l10n.view.SubListTabDefinition();

    obj.translator = input.translator;
    obj.name = this.tabListName;
    obj.type = this.type;
    obj.label = this.label;
    obj.addMarkAllButtons = this.addMarkAllButtons;
    obj.subListFields = this.subListFields;
    obj.showResults = this.showResults;
    obj.enablePagination = this.enablePagination;
    obj.currPage = this.currPage;
    obj.pageManager = this.pageManager;

    if (obj.showResults) {
      var lineItemGeneratorInput = this.getLineItemGeneratorInput();
      obj.lineItemGenerator = new suite_l10n.app.SubListLineGenerator(lineItemGeneratorInput);
    }

    return obj;
  };
};
