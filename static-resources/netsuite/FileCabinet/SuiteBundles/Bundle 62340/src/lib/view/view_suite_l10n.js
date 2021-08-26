/**
 * @license
 * © 2014 NetSuite Inc.  User may not copy; modify; distribute; or re-bundle or otherwise make available this code.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.view = suite_l10n.view || {};

suite_l10n.view.Help = function () {
  this.text = null;
  this.isInline = false;
};

suite_l10n.view.SelectOption = function () {
  this.text = null;
  this.value = null;
};

suite_l10n.view.Field = function () {
  this.name = null;
  this.label = null;
  this.type = null;
  this.source = null;
  this.isRadio = false;
  this.tabOrGroup = null;
  this.value = null;
  this.help = null;
  this.displayType = null;
  this.linkText = null;
  this.options = [];
  this.size = null;
  this.mandatory = false;
};

suite_l10n.view.Button = function () {
  this.name = null;
  this.label = null;
  this.isVisible = true;
  this.isDisabled = false;
  this.script = null;
};

suite_l10n.view.Tab = function () {
  this.name = null;
  this.label = null;
  this.help = null;
  this.fields = [];
  this.subLists = [];
  this.fieldGroups = [];
};

suite_l10n.view.FieldGroup = function () {
  this.name = null;
  this.label = null;
  this.collapsible = false;
  this.hidden = false;
  this.showBorder = false;
  this.singleColumn = false;
  this.tabOrGroup = null;
  this.fields = [];
};

suite_l10n.view.SubList = function () {
  this.name = null;
  this.type = null;
  this.label = null;
  this.help = null;
  this.displayType = null;
  this.addMarkAllButtons = false;
  this.addRefreshButton = false;
  this.amountField = null;
  this.uniqueField = null;
  this.tabOrGroup = null;
  this.buttons = [];
  this.fields = [];
  this.values = [];
};

suite_l10n.view.Form = function () {
  this.title = null;
  this.script = null;
  this.isHideNavBar = false;
  this.submitButton = null;
  this.disableSubmitButton = false;
  this.buttons = [];
  this.fields = [];
  this.credentialFields = [];
  this.tabs = [];
  this.subLists = [];
  this.fieldGroups = [];
};

suite_l10n.view.RowConverterLink = function () {
  this.script = null;
  this.text = null;
};

suite_l10n.view.SearchFilter = function () {
  this.name = null;
  this.join = null;
  this.operator = null;
  this.value = null;
  this.value2 = null;
  this.formula = null;
  this.summaryType = null;
  this.ignoreEmptyValue = false;
};

suite_l10n.view.SearchColumn = function () {
  this.name = null;
  this.join = null;
  this.summaryType = null;
  this.formula = null;
  this.functionId = null;
  this.label = null;
  this.isSortColumn = false;
  this.isDescending = false;
  this.isWhenOrderedBy = false;
  this.whenOrderName = null;
  this.whenOrderJoin = null;
  this.retrieveText = false;
  this.retrieveValues = false;
};

suite_l10n.view.Search = function () {
  this.type = null;
  this.id = null;
  this.filters = [];
  this.columns = [];
  this.filterExpression = null;
  this.isPublic = false;
  this.isRedirectToSearch = false;
  this.isRedirectToResults = false;
};

suite_l10n.view.SearchResult = function () {
  this.id = null;
  this.type = null;
  this.values = {};
};

suite_l10n.view.RecordPrinterDefinition = function () {
  this.type = null;
  this.id = null;
  this.mode = null;
  this.properties = {};
};

suite_l10n.view.EmailDefinition = function () {
  this.sender = null;
  this.recipients = null;
  this.subject = null;
  this.body = null;
  this.attachments = [];
  this.recordAttachments = null;
};

suite_l10n.view.ChildRemoverSetting = function () {
  this.childRecordType = null;
  this.parentFieldId = null;
  this.subListId = null;
  this.record = null;
  this.multipleSelect = false;
};

suite_l10n.view.MessageLoaderContext = function () {
  this.locale = null;
  this.stringCodes = [];
};

suite_l10n.view.Folder = function () {
  this.id = null;
  this.name = null;
  this.parent = null;
};

suite_l10n.view.LocalizationVariableDefinition = function () {
  this.type = null;
  this.variable = null;
};

suite_l10n.view.SubListTabPageDetails = function () {
  this.fieldName = null;
  this.currentPage = 1;
  this.entriesPerPage = 25;
  this.totalEntryCount = 0;
  this.totalPages = 0;
  this.enablePagination = false;
  this.startIndex = 0;
  this.endIndex = 0;
};

suite_l10n.view.SubListTabDefinition = function () {
  this.name = '';
  this.type = 'list';
  this.label = '';
  this.pageDetails = null;
  this.tabFields = [];
  this.subListFields = [];
  this.lineItems = [];
  this.addMarkAllButtons = false;
  this.translator = null;
  this.showResults = false;
  this.lineItemGenerator = null;
  this.enablePagination = null;
  this.currPage = 1;
  this.pageManager = null;
};

suite_l10n.view.SubListTabDefinitionGeneratorInput = function () {
  this.request = null;
  this.dunningProcedureView = null;
  this.translator = null;
};

suite_l10n.view.LineItemGeneratorSetting = function () {
  this.summaryField = null;
  this.summaryType = 'count';
  this.converterClass = null;
  this.totalCountSearch = null;
  this.lineItemSearch = null;
};

suite_l10n.view.PageOptionText = function () {
  this.startIndex = 0;
  this.endIndex = 0;
  this.totalEntryCount = 0;
};

suite_l10n.view.ResolveURLWithParamsInput = function () {
  this.type = 0;
  this.identifier = 0;
  this.id = 0;
  this.displayMode = 0;
  this.parameters = 0;
};

suite_l10n.view.CurrencyConverterSetting = function () {
  this.sourceCurrency = null;
  this.targetCurrency = null;
  this.effectiveDate = null;
};
