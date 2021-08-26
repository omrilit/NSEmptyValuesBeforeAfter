/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 *
 * Limitations:
 * Supports only one SubList.
 * For now, we'll just log a warning that the paging section may break the behavior for multiple pages.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SubListTabGenerator = function SubListTabGenerator (subListGeneratorInput) {
  var Field = suite_l10n.view.Field;
  var SubList = suite_l10n.view.SubList;
  var Button = suite_l10n.view.Button;
  var Tab = suite_l10n.view.Tab;
  var Option = suite_l10n.view.SelectOption;

  var obj = {
    getSubListTab: getSubListTab
  };

  function getLineItems (pageDetails) {
    var lineItems = [];
    if (subListGeneratorInput.showResults) {
      var lineItemGenerator = subListGeneratorInput.lineItemGenerator;
      lineItems = lineItemGenerator.generateLineItems(pageDetails.startIndex, pageDetails.endIndex);
    }
    return lineItems;
  }

  function getTabDefinition () {
    var tabDef = new Tab();
    tabDef.name = subListGeneratorInput.name + '_tab';
    var translator = subListGeneratorInput.translator;
    tabDef.label = translator.getString(subListGeneratorInput.label);
    return tabDef;
  }

  function getNaviButtons (pageDetails) {
    function getButtonScript (functionName) {
      return [subListGeneratorInput.pageManager, '.', functionName, '(\'', pageDetails.fieldName, '\')'].join('');
    }

    var translator = subListGeneratorInput.translator;
    var prev = new Button();
    prev.name = subListGeneratorInput.name + '_prev_btn';
    prev.label = translator.getString('dba.sublist.common.page_previous');
    var currentPage = pageDetails.currentPage;
    prev.isDisabled = currentPage === 1;
    prev.script = getButtonScript('previous');

    var next = new Button();
    next.name = subListGeneratorInput.name + '_next_btn';
    next.label = translator.getString('dba.sublist.common.page_next');
    next.isDisabled = currentPage === pageDetails.totalPages;
    next.script = getButtonScript('next');

    return [prev, next];
  }

  var stringFormatter;

  function getStringFormatter () {
    if (!stringFormatter) {
      stringFormatter = new suite_l10n.string.StringFormatter();
    }
    return stringFormatter;
  }

  function getPageOptionText (page, pageDetails) {
    var optionTextParams = new suite_l10n.view.PageOptionText();
    optionTextParams.startIndex = (page - 1) * pageDetails.entriesPerPage + 1;

    var endIndex = page * pageDetails.entriesPerPage;

    optionTextParams.endIndex = endIndex < pageDetails.totalEntryCount ? endIndex : pageDetails.totalEntryCount;
    optionTextParams.totalEntryCount = pageDetails.totalEntryCount;

    var translator = subListGeneratorInput.translator;
    var pageOptionFormat = String(translator.getString('dba.sublist.common.page_option'));
    var stringFormatter = getStringFormatter();
    stringFormatter.setString(pageOptionFormat);
    stringFormatter.replaceParameters(optionTextParams);
    return stringFormatter.toString();
  }

  function getPageOption (page, pageDetails) {
    var option = new Option();
    option.text = getPageOptionText(page, pageDetails);
    option.value = page;
    return option;
  }

  function getPageField (pageDetails) {
    var translator = subListGeneratorInput.translator;
    var field = new Field();
    field.name = pageDetails.fieldName;
    field.label = translator.getString('dba.sublist.common.page_field');
    field.type = 'select';
    field.displayType = 'normal';
    field.value = pageDetails.currentPage;

    var totalPages = pageDetails.totalPages;
    for (var i = 1; i <= totalPages; i++) {
      var option = getPageOption(i, pageDetails);
      field.options.push(option);
    }

    return field;
  }

  function getSubListDefinition (pageDetails) {
    var subListDef = new SubList();
    subListDef.name = subListGeneratorInput.name + '_sublist';
    subListDef.type = subListGeneratorInput.type;

    var translator = subListGeneratorInput.translator;
    subListDef.label = translator.getString(subListGeneratorInput.label);
    subListDef.addMarkAllButtons = subListGeneratorInput.addMarkAllButtons;

    var fieldConverter = new suite_l10n.app.FieldConverter();
    subListDef.fields = fieldConverter.castToMultipleViews(subListGeneratorInput.subListFields);
    subListDef.values = getLineItems(pageDetails);

    return subListDef;
  }

  function getSubListTab () {
    var tabDef = getTabDefinition();

    var pageDetailsGenerator = new suite_l10n.app.PageDetailsGenerator(subListGeneratorInput);
    var pageDetails = pageDetailsGenerator.generatePageDetails();
    var subListDef = getSubListDefinition(pageDetails);
    tabDef.subLists = [subListDef];

    if (pageDetails.enablePagination) {
      var pageField = getPageField(pageDetails);
      tabDef.fields.push(pageField);
      subListDef.buttons = subListDef.buttons.concat(getNaviButtons(pageDetails));
    }
    return tabDef;
  }

  return obj;
};

suite_l10n.app.PageDetailsGenerator = function PageDetailsGenerator (subListGeneratorInput) {
  var DEFAULT_ENTRIES_PER_PAGE = 25;

  function getCurrentPage (pageFieldName) {
    var currentPageValue = subListGeneratorInput.currPage || 1;
    return Number(currentPageValue);
  }

  function getEntriesPerPage () {
    var config = new ns_wrapper.api.config.Configuration('userpreferences');
    return config.getFieldValue('LISTSEGMENTSIZE') || DEFAULT_ENTRIES_PER_PAGE;
  }

  this.generatePageDetails = function generatePageDetails () {
    var pageDetails = new suite_l10n.view.SubListTabPageDetails();
    if (subListGeneratorInput.showResults && subListGeneratorInput.enablePagination) {
      var pageFieldName = subListGeneratorInput.name + '_curr_page';
      pageDetails.fieldName = pageFieldName;

      var entriesPerPage = getEntriesPerPage();
      pageDetails.entriesPerPage = entriesPerPage;

      var lineItemGenerator = subListGeneratorInput.lineItemGenerator;
      pageDetails.totalEntryCount = lineItemGenerator.getTotalLineItemCount();

      var totalPages = Math.ceil(pageDetails.totalEntryCount / entriesPerPage) || 1;
      pageDetails.totalPages = totalPages;

      var retrievedCurrentPage = getCurrentPage(pageFieldName);
      var currentPage = retrievedCurrentPage <= totalPages ? retrievedCurrentPage : totalPages;
      pageDetails.currentPage = currentPage;
      pageDetails.startIndex = (currentPage - 1) * entriesPerPage;
      pageDetails.endIndex = (currentPage) * entriesPerPage;

      pageDetails.enablePagination = pageDetails.totalPages > 1;
    }

    return pageDetails;
  };
};

/**
 * @extends {suite_l10n.app.BaseConverter<suite_l10n.view.Field,suite_l10n.view.Field>}
 * @constructor
 */
suite_l10n.app.FieldConverter = function () {
  return new suite_l10n.app.BaseConverter({
    view: suite_l10n.view.Field,
    model: suite_l10n.view.Field,
    modelViewMap: {
      name: 'name',
      label: 'label',
      type: 'type',
      source: 'source',
      isRadio: 'isRadio',
      tabOrGroup: 'tabOrGroup',
      value: 'value',
      help: 'help',
      displayType: 'displayType',
      linkText: 'linkText',
      options: 'options'
    },
    recordModelMap: {}
  });
};
