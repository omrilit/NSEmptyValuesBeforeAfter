/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var CLIENT_SCRIPT = {
    NAME:           'customscript_mapper_cs',
    CANCEL_HANDLER: 'TAF.Mapper.ViewClient.cancel()'
};
var SUITELET = {
    NAME:       'customscript_mapper_s',
    DEPLOYMENT: 'customdeploy_mapper_s'
};
var ELEMENT_NAME = {
    CANCEL:     'custpage_cancel_button',
    CATEGORY:   'custpage_category',
	SUBSIDIARY: 'custpage_subsidiary',
    SUBLIST:    'custpage_sublist',
    MAP_ID:     'custpage_map_id',
    FROM:       'custpage_from',
    FROM_ID:    'custpage_from_id',
    TO:         'custpage_to',
    TO_ID:      'custpage_to_id',
    MAPPINGS:   'custpage_mappings',
    URL:        'custpage_url',
    ACTION:     'custpage_action',
    MESSAGE:    'custpage_message',
    UI_FILTERS: 'custpage_ui_filters',
    FIELD:      'custpage_',
	SELECTED_CATEGORY : 'custpage_selected_category'
};
var LABEL = {
    MAP_ID:     'Map Id',
    FROM_ID:    'From (Id)',
    TO:         'To',
    TO_ID:      'To (Id)',
    MAPPINGS:   'Mappings',
    URL:        'URL',
    ACTION:     'Action',
    UI_FILTERS: 'UI Filters',
	SELECTED_CATEGORY:  'SELECTED CATEGORY'
};
var MESSAGE_SIZE = '825px';
var ACTION = {
    EDIT: 'edit',
    VIEW: 'view',
    SAVE: 'save',
    VIEWONLY: 'viewonly'
};
