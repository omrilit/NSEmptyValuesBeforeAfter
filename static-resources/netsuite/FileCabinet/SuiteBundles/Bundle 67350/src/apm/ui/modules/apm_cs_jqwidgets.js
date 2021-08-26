/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Sep 2016     jmarimla         Initial
 * 2.00       27 Oct 2016     jmarimla         Grid component
 * 3.00       09 Nov 2016     jmarimla         Grid paging component
 * 4.00       10 Nov 2016     rwong            Column panel widget
 * 5.00       11 Nov 2016     jmarimla         KPI panel
 * 6.00       25 Nov 2016     jmarimla         Dialog component
 * 7.00       28 Nov 2016     jmarimla         Make grid resizable
 * 8.00       12 Dec 2016     jmarimla         Components for global settings
 * 9.00       12 Jan 2017     jmarimla         Jqueryui paging combo box
 * 10.00      20 Jan 2017     jmarimla         Date validation
 * 11.00      22 Mar 2017     jmarimla         Grid default values and afterRefreshData listener
 * 12.00      04 Apr 2017     jmarimla         Disable resize and sort for columns
 * 13.00      05 May 2017     jmarimla         DateTime Filter
 * 14.00      07 Jul 2017     jmarimla         psgpTextBox
 * 15.00      04 Aug 2017     jmarimla         Portlet buttons
 * 16.00      05 Sep 2017     jmarimla         Add loading for grid
 * 17.00      07 Sep 2017     jmarimla         Get functions for datetime
 * 18.00      21 Sep 2017     jmarimla         Minor grid changes
 * 19.00      15 Jan 2017     jmarimla         Remove ui sorting when remote sorting
 * 20.00      06 Jul 2018     jmarimla         Translation readiness
 * 21.00      30 Jul 2018     justaris         Translation
 * 22.00      10 Aug 2018     jmarimla         Subpanel
 * 23.00      21 Jan 2019     jmarimla         IE11 fix
 * 24.00      14 May 2019     rwong            Added psgpTabs
 * 25.00      21 May 2019     jmarimla         Free form grid
 * 26.00      23 May 2019     jmarimla         tbody class
 * 27.00      27 May 2019     rwong            rename psgpTabs to psgpSubTabs
 * 28.00      10 Jul 2019     rwong            updated class from psgptabs to psgsubtabs
 * 29.00      18 Jul 2019     jmarimla         Expandable grid
 * 30.00      14 Aug 2019     jmarimla         Filters expand/collapse
 * 31.00      14 Oct 2019     erepollo         Fix odd rows
 * 32.00      21 Apr 2020     erepollo         Added message for empty results
 * 33.00      15 Jun 2020     erepollo         Group combo box
 * 34.00      30 Jul 2020     jmarimla         r2020a strings
 * 35.00      11 Aug 2020     earepollo        Added menu button and carousel components
 * 36.00      13 Aug 2020     lemarcelo        Added number range controls
 * 37.00      13 Aug 2020     lemarcelo        Added psgpTab
 * 38.00      19 Nov 2020     lemarcelo        Added help link and icon for portlet and subpanel title
 * 39.00      05 Apr 2021     lemarcelo        Added new APM SuiteApp note
 *
 */

//IE 11 support
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

function ApmJqWidgets() {

    (function (apmWidgetsInit) {

        apmWidgetsInit($, window, document);

    }(function ($, window, document) {

        var defaultNamespace = 'PSGP';


        /*
         * psgpSuiteletTitle
         * options:
         *      title
         */
        $.widget(defaultNamespace + '.psgpSuiteletTitle', {
            _create: function () {
                var title = this.options.title;
                this.element.addClass('psgp-suitelet-title');
                var $obj = '<span class="psgp-suitelet-title-text">' + title + '</span>';
                this.element.append($obj);
            }
        });

        /*
         * psgpSuiteletSettings
         * options:
         *      label
         */
        $.widget(defaultNamespace + '.psgpSuiteletSettings', {
            options: {
                label: '',
                $dialog: null
            },
            updateLabel : function (newLabel) {
                var me = this;
                $(me.element).find('.label').text(newLabel);
            },
            _create: function () {
                var me = this;
                var $obj = '<span class="label">' + this.options.label + '</span>';
                this.element.addClass('psgp-suitelet-settings')
                            .click(function () {
                                var $dialog  = me.options.$dialog;
                                if ($dialog && $dialog.dialog('isOpen')) {
                                    var $btnCancel = $dialog.find('.btn-cancel');
                                    if ($btnCancel.length > 0) {
                                        $btnCancel.find('.psgp-btn-default').click();
                                    } else {
                                        $dialog.dialog('close');
                                    }
                                } else {
                                    $dialog.dialog('option', 'position', { my: 'right top', at: 'right bottom', of: $(me.element) });
                                    $dialog.dialog('open');
                                }
                            })
                            .append($obj);
            }
        });

        /*
         * psgpSettingsDialog
         * options:
         *
         */
        $.widget(defaultNamespace + '.psgpSettingsDialog', {
            options: {
                resizable: false,
                modal: false,
                dialogClass : 'psgp-settings-dialog',
                minWidth: 0,
                minHeight: 0
            },
            _create: function () {
                $(this.element).dialog({
                    modal: this.options.modal,
                    resizable: this.options.resizable,
                    dialogClass : this.options.dialogClass,
                    minWidth: this.options.minWidth,
                    minHeight: this.options.minHeight,
                    width: this.options.width,
                    autoOpen: false,
                    closeOnEscape: false,
                    close: function( event, ui ) {
//                      var me = this;
//                      $(me).dialog('destroy').remove();
                    }
                });
            }
        });

        /*
         * psgpSpacer
         * options:
         * height
         */
        $.widget(defaultNamespace + '.psgpSpacer', {
            _create: function () {
                var height = this.options.height;
                this.element.height(height);
            }
        });

        /*
         * psgpButton
         * options:
         * text - button label
         * handler - onclick function
         */
        $.widget(defaultNamespace + '.psgpButton', {
            _create: function () {
                var text = this.options.text;
                var handler = this.options.handler;
                var $obj = $('<input type="button" class="psgp-btn-default"/>');
                $obj.attr('value', text)
                    .click(handler)
                    .appendTo(this.element);
            }
        });

        $.widget(defaultNamespace + '.psgpBlueButton', $.PSGP.psgpButton, {
            _create: function () {
                this._super();
                var $btn = this.element.find('input');
                $btn.addClass('psgp-btn-blue')
                    .on({
                        'focus': function () {
                            $(this).addClass('psgp-btn-blue-focus');
                        },
                        'blur': function () {
                            $(this).removeClass('psgp-btn-blue-focus');
                        },
                        'mouseover': function () {
                            $(this).addClass('psgp-btn-blue-over');
                        },
                        'mouseout': function () {
                            $(this).removeClass('psgp-btn-blue-over');
                            $(this).removeClass('psgp-btn-blue-pressed');
                        },
                        'mousedown': function () {
                            $(this).addClass('psgp-btn-blue-pressed');
                        },
                        'mouseup': function () {
                            $(this).removeClass('psgp-btn-blue-pressed');
                        },
                    });
            }
        });

        $.widget(defaultNamespace + '.psgpGrayButton', $.PSGP.psgpButton, {
            _create: function () {
                this._super();
                var $btn = this.element.find('input');
                $btn.addClass('psgp-btn-gray')
                    .on({
                        'focus': function () {
                            $(this).addClass('psgp-btn-gray-focus');
                        },
                        'blur': function () {
                            $(this).removeClass('psgp-btn-gray-focus');
                        },
                        'mouseover': function () {
                            $(this).addClass('psgp-btn-gray-over');
                        },
                        'mouseout': function () {
                            $(this).removeClass('psgp-btn-gray-over');
                            $(this).removeClass('psgp-btn-gray-pressed');
                        },
                        'mousedown': function () {
                            $(this).addClass('psgp-btn-gray-pressed');
                        },
                        'mouseup': function () {
                            $(this).removeClass('psgp-btn-gray-pressed');
                        },
                    });
            }
        });

        /*
         * psgpFilterPanel
         */
        $.widget(defaultNamespace + '.psgpFilterPanel', {
            addFilterField: function ($field) {
                var $this = this.element;
                $field.addClass('psgp-filter-block');
                $this.find('.psgp-filters-body').append($field);
            },
            _create: function () {
                var me = this;
                var markUp = '';
                markUp += '<div class="psgp-filters">';
                markUp += '<div class="psgp-filters-header"><span class="psgp-filters-header-icon"></span><span class="psgp-filters-header-title">' + APMTranslation.apm.common.label.filters() +'</span></div>';
                markUp += '<div class="psgp-filters-body"></div>';
                markUp += '</div>';
                $obj = $(markUp);
                $obj.find('.psgp-filters-header').click(function () {
                    var $panel = $(this).parent();
                    var $body = $panel.children('.psgp-filters-body');
                    var $icon = $panel.find('.psgp-filters-header-icon');
                    if ($body.is(':hidden')) {
                        me.expand();
                    } else {
                        me.collapse();
                    }
                });
                $obj.appendTo(this.element);
            },
            collapse: function () {
                var $this = this.element;
                $this.find('.psgp-filters-body').hide();
                $this.find('.psgp-filters-header-icon').addClass('psgp-filters-header-icon-expand');
            },
            expand: function () {
                var $this = this.element;
                $this.find('.psgp-filters-body').show();
                $this.find('.psgp-filters-header-icon').removeClass('psgp-filters-header-icon-expand');
            }
        });

        /*
         * psgpSubPanel
         */
        $.widget(defaultNamespace + '.psgpSubPanel', {
            getBody: function () {
                var $this = this.element;
                return $this.find('.psgp-subpanel-body');
            },
            _create: function () {
                var title = this.options.title;
                var height = this.options.height;
                var markUp = '';
                markUp += '<div class="psgp-subpanel">';
                markUp += '<div class="psgp-subpanel-header">' +
                        '<span class="psgp-subpanel-header-icon"></span>' +
                        '<span class="psgp-subpanel-header-title"></span>' +
                        '<span class="info-icon"></span>' +
                    '</div>';
                markUp += '<div class="psgp-subpanel-body"></div>';
                markUp += '</div>';
                $obj = $(markUp);
                $obj.find('.psgp-subpanel-header-title').text(title);

                //initialize help link
                if (this.options.helpLink && (this.options.helpLink.hover ) && (this.options.helpLink.link)) {
                    $obj.find('.info-icon').prop('title', this.options.helpLink.hover);
                    var helpUrl = this.options.helpLink.link;
                    $obj.find('.info-icon').click(function() {
                        window.open(helpUrl);
                    });
                }
                else {
                    $obj.find('.info-icon').hide();
                }

                $obj.find('.psgp-subpanel-body').height(height);
                $obj.find('.psgp-subpanel-header').click(function (event) {
                    if( !$(event.target).hasClass('info-icon') ) {
                        var $panel = $(this).parent();
                        var $body = $panel.children('.psgp-subpanel-body');
                        var $icon = $panel.find('.psgp-subpanel-header-icon');
                        if ($body.is(':hidden')) {
                            $body.show();
                            $icon.removeClass('psgp-subpanel-header-icon-expand');
                        } else {
                            $body.hide();
                            $icon.addClass('psgp-subpanel-header-icon-expand');
                        }
                    }
                });
                $obj.appendTo(this.element);
            }
        });

        /*
         *  psgpColumnPanel
         *  options:
         *  columndef -> [{width: 80%, padding: '0 0 0 0'}]
         */
        $.widget(defaultNamespace + '.psgpColumnPanel', {
            _create: function () {
                var columndef = this.options.columndef;
                var markUp = '';
                $.each(columndef, function (index, element) {
                    markUp += '<div class="psgp-column-panel psgp-column-panel-' + (index + 1) + '" style="width:' + element.width + '; padding:' + element.padding + ';"></div>';
                });
                $obj = $(markUp);
                $obj.appendTo(this.element);
            }
        });

        /*
         * psgpTabs
         * options:
         *  prefixId -- string; tab id prefix
         *  labels -- string array; tab labels
         *  listeners
         *      tabsActivate
         *
         */
        $.widget(defaultNamespace + '.psgpTabs', {
            options: {
                prefixId: '',
                labels: [],
                listeners: {
                    tabsActivate: null
                }
            },
            _create: function () {
                var me = this;
                var prefixId = me.options.prefixId;
                var labels = me.options.labels;
                var markup = '<div class="psgp-tabs"><ul class="list"></ul></div>';
                var $obj = $(markup);
                $obj.appendTo(me.element);
                var tabsMarkup = '';
                var contentsMarkup = '';
                $.each(labels, function (index, item) {
                    var tabId = prefixId + index;
                    tabsMarkup += '<li><a href="#' + tabId + '">' + item +'</a></li>';
                    contentsMarkup += '<div id="' + tabId + '"></div>'
                });
                $(me.element).find('.psgp-tabs .list').append($(tabsMarkup));
                $(me.element).find('.psgp-tabs').append($(contentsMarkup));
                $(me.element).find('.psgp-tabs').tabs();

                if (me.options.listeners.tabsActivate) {
                    $(me.element).find('.psgp-tabs').on( "tabsactivate", me.options.listeners.tabsActivate );
                }
            },
            selectTab: function (tabIndex) {
                var me = this;
                $(me.element).find('.psgp-tabs').tabs('option', 'active', tabIndex);
            }
        });

        /*
         * psgpSubTabs
         * options:
         *  prefixId -- string; tab id prefix
         *  labels -- string array; tab labels
         *  listeners
         *      tabsActivate
         *
         */
        $.widget(defaultNamespace + '.psgpSubTabs', {
            options: {
                prefixId: '',
                labels: []
            },
            _create: function () {
                var me = this;
                var prefixId = me.options.prefixId;
                var labels = me.options.labels;
                var markup = '<div class="psgp-subtabs"><ul class="list"></ul></div>';
                var $obj = $(markup);
                $obj.appendTo(me.element);
                var tabsMarkup = '';
                var contentsMarkup = '';
                $.each(labels, function (index, item) {
                    var tabId = prefixId + index;
                    tabsMarkup += '<li><a href="#' + tabId + '">' + item +'</a></li>';
                    contentsMarkup += '<div id="' + tabId + '"></div>'
                });
                $(me.element).find('.psgp-subtabs .list').append($(tabsMarkup));
                $(me.element).find('.psgp-subtabs').append($(contentsMarkup));
                $(me.element).find('.psgp-subtabs').tabs();

                if (me.options.listeners.tabsActivate) {
                    $(me.element).find('.psgp-subtabs').on( "tabsactivate", me.options.listeners.tabsActivate );
                }
            },
            selectTab: function (tabIndex) {
                var me = this;
                $(me.element).find('.psgp-subtabs').tabs('option', 'active', tabIndex);
            }
        });

        /*
         * psgpPortlet
         * options:
         * title
         * height - body height
         * buttons
         */
        $.widget(defaultNamespace + '.psgpPortlet', {
            getBody: function () {
                var $this = this.element;
                return $this.find('.psgp-portlet-body');
            },
            _create: function () {
                var title = this.options.title;
                var height = this.options.height;
                var helpLink = this.options.helpLink;
                var markUp = '';
                markUp += '<div class="psgp-portlet">';
                markUp += '<div class="psgp-portlet-header">' +
                    '<div class="title">'+
                        '<span class="psgp-portlet-header-title"></span>' +
                    '</div>' +
                    '<div class="help-link">' +
                        '<div class="info-icon"></div>' +
                    '</div>' +
                    '<div class="buttons"></div></div>';
                markUp += '<div class="psgp-portlet-body"></div>';
                markUp += '</div>';
                var $obj = $(markUp);
                $obj.find('.psgp-portlet-header-title').text(title);
                $obj.find('.psgp-portlet-body').height(height);
                $obj.appendTo(this.element);

                //initialize help link
                if (this.options.helpLink && (this.options.helpLink.hover ) && (this.options.helpLink.link)) {
                    $obj.find('.info-icon').prop('title', this.options.helpLink.hover);
                    var helpUrl = this.options.helpLink.link;
                    $obj.find('.info-icon').click(function() {
                        window.open(helpUrl);
                    });
                }
                else {
                    $obj.find('.info-icon').hide();
                }

                //add buttons
                $obj.find('.buttons').hide();
                if (this.options.buttons && (this.options.buttons instanceof Array) && (this.options.buttons.length > 0)) {
                    for (var i in this.options.buttons) {
                        $obj.find('.buttons').append(this.options.buttons[i]);
                    }
                    $obj.mouseover(function() {
                        $obj.find('.buttons').show();
                    });
                    $obj.mouseleave(function() {
                        $obj.find('.buttons').hide();
                    });
                }
            }
        });

        /*
         * psgpPortletRefreshBtn
         * options:
         */
        $.widget(defaultNamespace + '.psgpPortletRefreshBtn', {
            _create: function () {
                var handler = this.options.handler;
                var $obj = $('<input type="button" class="psgp-portlet-btn-refresh"/>');
                $obj.click(handler)
                    .appendTo(this.element);
            }
        });

        /*
         * psgpPortletMenuBtn
         * options:
         *  items: { text, handler }
         */
        $.widget(defaultNamespace + '.psgpPortletMenuBtn', {
            _create: function () {
                var me = this;
                var items = me.options.items;
                var $obj = $('<div class="psgp-portlet-btn-menu"><input type="button" class="button"/><div class="dropdown"></div></div>');
                $obj.appendTo(this.element);
                $.each(items, function (index, item) {
                    var $link = $('<div class="link-' + index + '">' + item.text + '</div>');
                    $obj.find('.dropdown').append($link);
                    $link.click(item.handler).appendTo(this.element);
                });
                $obj.on("click", function (event) {
                    if ($obj.hasClass('clicked')) {
                        $obj.removeClass('clicked');
                    } else {
                        $obj.addClass('clicked');
                    }
                });
                $(document).on("click", function (event) {
                    if ($obj !== event.target && !$obj.has(event.target).length) {
                        $obj.removeClass('clicked');
                    }
                });
            }
        });

        /*
         * psgpTextBox
         */
        $.widget(defaultNamespace + '.psgpTextBox', {
            options: {

            },
            _create: function () {
                var me = this;
                var markUp = '' +
                    '<input class="psgp-textbox"></input>';
                $obj = $(markUp);
                $obj.appendTo(this.element);
            }
        });

        /*
         * psgpComboBox
         * options:
         *      list: {name, id}
         */
        $.widget(defaultNamespace + '.psgpComboBox', {
            options: {
                menuClass: 'psgp-combobox-form-menu',
                inputClass: 'psgp-combobox-form'
            },
            _create: function () {
                var me = this;
                var list = me.options.list;
                var markUp = '' +
                    '<select class="psgp-combobox"></select>';
                var options = '';
                $.each(list, function (index, item) {
                    options += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                var $obj = $(markUp).append($(options));
                $obj.appendTo(me.element)
                    .selectmenu({
                        width: me.options.width,
                        change: me.options.change
                    });
                $obj.parent().addClass(me.options.inputClass);
                $obj.selectmenu('menuWidget').parent().addClass(this.options.menuClass);
            }
        });

        /*
         * psgpGroupComboBox
         * options:
         *      list: {
         *          label,
         *          grouplist: {name, id}
         *      }
         */
        $.widget(defaultNamespace + '.psgpGroupComboBox', {
            options: {
                menuClass: 'psgp-combobox-form-menu',
                inputClass: 'psgp-combobox-form'
            },
            _create: function () {
                var me = this;
                var list = me.options.list;
                var markUp = '' +
                    '<select class="psgp-combobox"></select>';
                var options = '';
                $.each(list, function (index, group) {
                    if (group.label) {
                        options += '<optgroup label="' + group.label + '">';
                        $.each(group.grouplist, function (index2, item) {
                            options += '<option value="' + item.id + '">' + item.name + '</option>';
                        });
                        options += '</optgroup>';
                    } else {
                        $.each(group.grouplist, function (index2, item) {
                            options += '<option value="' + item.id + '">' + item.name + '</option>';
                        });
                    }

                });
                var $obj = $(markUp).append($(options));
                $obj.appendTo(me.element)
                    .selectmenu({
                        width: me.options.width,
                        change: me.options.change
                    });
                $obj.parent().addClass(me.options.inputClass);
                $obj.selectmenu('menuWidget').parent().addClass(this.options.menuClass);
            }
        });

        /*
         * psgpTimeComboBox
         * options:
         * list: {name, id}
         */
        $.widget(defaultNamespace + '.psgpTimeComboBox', $.PSGP.psgpComboBox, {
            options: {
                list: new Array(),
                width: 100
            },
            _createTimeList: function () {
                var startmin = 0;
                var endmin = 24 * 60;
                var interval = 15;
                var list = new Array();
                for (var i = startmin; i < endmin; i = i + interval) {
                    var hr = Math.floor(i / 60);
                    var min = i % 60;
                    var id = '' + (hr < 10 ? ('0' + hr) : hr) + ':' + (min < 10 ? ('0' + min) : min);
                    var hr12 = (hr <= 12) ? hr : (hr - 12);
                    var name = '' + (hr12 == 0 ? '12' : hr12) + ':' + (min < 10 ? ('0' + min) : min) + ' ' + (hr < 12 ? APMTranslation.apm.common.time.am() : APMTranslation.apm.common.time.pm() );
                    list.push({
                        id: id,
                        name: name
                    });
                }
                this.options.list = list;
            },
            _create: function () {
                this._createTimeList();
                this._super();
            }
        });

        /*
         * psgpDatePicker
         * options:
         */
        $.widget(defaultNamespace + '.psgpDatePicker', {
            _create: function () {
                var markUp = '' +
                    '<input type="text" class="psgp-date-picker">';
                $(this.element).append(markUp);
                $(this.element).find('.psgp-date-picker').datepicker({
                    showOn: 'button',
                    buttonText: '',
                    monthNames: [ APMTranslation.apm.common.shortmonth.january(),
                                 APMTranslation.apm.common.shortmonth.february(),
                                 APMTranslation.apm.common.shortmonth.march(),
                                 APMTranslation.apm.common.shortmonth.april(),
                                 APMTranslation.apm.common.shortmonth.may(),
                                 APMTranslation.apm.common.shortmonth.june(),
                                 APMTranslation.apm.common.shortmonth.july(),
                                 APMTranslation.apm.common.shortmonth.august(),
                                 APMTranslation.apm.common.shortmonth.september(),
                                 APMTranslation.apm.common.shortmonth.october(),
                                 APMTranslation.apm.common.shortmonth.november(),
                                 APMTranslation.apm.common.shortmonth.december()
                                 ],
                    dayNamesMin: [ APMTranslation.apm.r2020a.sun(),
                                 APMTranslation.apm.r2020a.mon(),
                                 APMTranslation.apm.r2020a.thu(),
                                 APMTranslation.apm.r2020a.wed(),
                                 APMTranslation.apm.r2020a.tue(),
                                 APMTranslation.apm.r2020a.fri(),
                                 APMTranslation.apm.r2020a.sat()
                                 ]
                });
            }
        });

        /*
         * psgpDateTimeField
         * options:
         * label
         */
        $.widget(defaultNamespace + '.psgpDateTimeField', {
            options: {
                label: ''
            },
            isDateValid: function () {
                var $this = this.element;
                var value = $this.find('.psgp-field-datetime-date .psgp-date-picker').val();
                var dateValue = Date.parse(value);
                if (isNaN(dateValue)==true ){
                   return false;
                } else {
                    return true;
                }
            },
            getDateValue: function () {
                var $this = this.element;
                return $this.find('.psgp-field-datetime-date .psgp-date-picker').datepicker('getDate');
            },
            getTimeValue: function () {
                var $this = this.element;
                return $this.find('.psgp-field-datetime-time .psgp-combobox').val();
            },
            setDateValue: function (dateValue) {
                var $this = this.element;
                $this.find('.psgp-field-datetime-date .psgp-date-picker').datepicker('setDate', dateValue);
            },
            setTimeValue: function (timeValue) {
                var $this = this.element;
                $this.find('.psgp-field-datetime-time .psgp-combobox').val(timeValue);
                $this.find('.psgp-field-datetime-time .psgp-combobox').selectmenu('refresh');
            },
            _create: function () {
                var markUp = '' +
                    '<div class="psgp-field-datetime" style="display:inline-block">' +
                    '   <div style="display:inline-block"><span class="psgp-field-datetime-label psgp-field-label"></span><div class="psgp-field-datetime-date" ></div></div>' +
                    '   <div class="psgp-field-datetime-time" style="display:inline-block"></div>' +
                    '</div>';
                var $obj = $(markUp);
                $obj.appendTo(this.element);
                $obj.find('.psgp-field-datetime-label').text(this.options.label);
                $obj.find('.psgp-field-datetime-date').psgpDatePicker();
                $obj.find('.psgp-field-datetime-time').psgpTimeComboBox();
            }
        });

        /*
         * psgpDateTimeFilter
         * options:
         * label
         */
        $.widget(defaultNamespace + '.psgpDateTimeFilter', {
            options: {
                label: ''
            },
            isDateValid: function () {
                var $this = this.element;
                var value = $this.find('.psgp-field-datetime-date .psgp-date-picker').val();
                var dateValue = Date.parse(value);
                if (isNaN(dateValue)==true ){
                   return false;
                } else {
                    return true;
                }
            },
            getDateValue: function () {
                var $this = this.element;
                return $this.find('.psgp-field-datetime-date .psgp-date-picker').datepicker('getDate');
            },
            getTimeValue: function () {
                var $this = this.element;
                return $this.find('.psgp-field-datetime-time .psgp-combobox').val();
            },
            _create: function () {
                var markUp = '' +
                    '<div class="psgp-filter-datetime" style="display:inline-block">' +
                    '   <div style="display:inline-block"><span class="psgp-field-datetime-label psgp-field-label"></span><div class="psgp-field-datetime-date" ></div></div>' +
                    '   <div class="psgp-field-datetime-time" style="display:inline-block"></div>' +
                    '</div>';
                var $obj = $(markUp);
                $obj.appendTo(this.element);
                $obj.find('.psgp-field-datetime-label').text(this.options.label);
                $obj.find('.psgp-field-datetime-date').psgpDatePicker();
                $obj.find('.psgp-field-datetime-time').psgpTimeComboBox();
            }
        });

        /*
         * psgpNumberBox
         * options:
         *     width: number or css value
         * methods:
         *     getValue
         *     isValid
         */
        $.widget(defaultNamespace + '.psgpNumberBox', {
            options: {
                width: 150,
                allowDecimal: true
            },
            _create: function () {
                var me = this;
                var width = me.options.width;
                var allowDecimal = me.options.allowDecimal;
                var markUp = '' +
                    '<input class="psgp-textbox psgp-numberbox"></input>';
                $obj = $(markUp);
                $obj.width(width);
                $obj.appendTo(this.element);
                $(this.element)
                    .on({
                        'keypress': function (e) {
                            if (!$.isNumeric(e.key) && e.key != '.') {
                                return false;
                            }
                        },
                        'focusout': function () {
                            var value = $(this).find('.psgp-numberbox').val();
                            if (value != '') {
                                var updatedValue;
                                if (allowDecimal) {
                                    updatedValue = (parseFloat(value)).toFixed(2);
                                } else {
                                    updatedValue = (parseFloat(value)).toFixed(0);
                                }
                                $(this).find('.psgp-numberbox').val(updatedValue);
                            }
                        }
                    })
            },
            getValue: function () {
                var $this = this.element;
                var content = $this.find('.psgp-numberbox').val();
                return content.trim();
            },
            isValid: function () {
                var me = this;
                var content = me.getValue();
                return ($.isNumeric(content)) ? true : false;
            }
        });

        /*
         * psgpNumberRangeFilter
         * options:
         *      label
         *
         */
        $.widget(defaultNamespace + '.psgpNumberRangeFilter', {
            options: {
                label:''
            },
            _create: function () {
                var me = this;
                var markUp = '' +
                    '<div class="psgp-numberrangefilter">' +
                        '<div class="label"></div>' +
                        '<div class="fieldgroup">' +
                            '<div class="operator"></div>' +
                            '<div class="val-1"></div>' +
                            '<div class="and"><div></div></div>' +
                            '<div class="val-2"></div>' +
                         '</div>' +
                    '</div>';
                $obj = $(markUp);
                $obj.appendTo(this.element);
                me.element.find('.label').text(this.options.label);
                me.element.find('.operator').psgpComboBox({
                    list: [
                           { 'name': ' ', 'id': '' },
                           { 'name': APMTranslation.apm.pts.label.greaterthan(), 'id': 'gt' },
                           { 'name': APMTranslation.apm.pts.label.lessthan(), 'id': 'lt' },
                           { 'name': APMTranslation.apm.pts.label.between(), 'id': 'bw' }
                    ],
                    width: 120,
                    change: function( event, ui ) {
                        var newValue = ui.item.value;
                        switch (newValue) {
                        case 'gt':
                            me.element.find('.val-1').show();
                            me.element.find('.and').hide();
                            me.element.find('.val-2').hide();
                            break;
                        case 'lt':
                            me.element.find('.val-1').show();
                            me.element.find('.and').hide();
                            me.element.find('.val-2').hide();
                            break;
                        case 'bw':
                            me.element.find('.val-1').show();
                            me.element.find('.and').show();
                            me.element.find('.val-2').show();
                            break;
                        default:
                            me.element.find('.val-1').hide();
                            me.element.find('.and').hide();
                            me.element.find('.val-2').hide();
                        }
                    }
                });
                me.element.find('.val-1').psgpNumberBox({
                    width: 70
                });
                me.element.find('.and div').text(APMTranslation.apm.pts.label.and());
                me.element.find('.val-2').psgpNumberBox({
                    width: 70
                });
                //default appearance
                me.element.find('.val-1').hide();
                me.element.find('.and').hide();
                me.element.find('.val-2').hide();

            },
            getValue: function() {
                var me = this;
                var operatorValue = me.element.find('.operator .psgp-combobox').val();
                var val1Value = me.element.find('.val-1').psgpNumberBox('getValue');
                var val2Value = me.element.find('.val-2').psgpNumberBox('getValue');
                var operIsValid = true;
                var val1IsValid = me.element.find('.val-1').psgpNumberBox('isValid');
                var val2IsValid = me.element.find('.val-2').psgpNumberBox('isValid');
                var isNumRangeValid = true;

                switch (operatorValue) {
                case 'gt':
                    isNumRangeValid = val1IsValid;
                    break;
                case 'lt':
                    isNumRangeValid = val1IsValid;
                    break;
                case 'bw':
                    isNumRangeValid = val1IsValid && val2IsValid && (parseFloat(val1Value, 10) < parseFloat(val2Value,10));
                    break;
                default:
                    operIsValid = false;
                }

                return {
                    operatorValue: operatorValue,
                    val1Value: val1Value,
                    val2Value: val2Value,

                    operIsValid: operIsValid,
                    val1IsValid: val1IsValid,
                    val2IsValid: val1IsValid,

                    isNumRangeValid: isNumRangeValid
                }
            }
        });

        /*
         * KPI Panel
         * options:
         *      height
         *      width
         */
        $.widget(defaultNamespace + '.psgpKPIPanel', {
            options: {
                height: '100px',
                width: '100%'
            },
            /*
             * data:
             *      id
             *      label
             *      value
             */
            refreshData : function (data) {
                var me = this;
                var $obj = me.element;
                $obj.children('.psgp-kpipanel').children().remove();
                var markUpChildren = '';
                $.each(data, function (index, item) {
                    markUpChildren +=   '<div class="psgp-kpipanel-item" dataIndex="' + item.id + '">' +
                                            '<div>' +
                                                '<span class="psgp-kpipanel-item-label">' + item.label + '</span>' + '<br>' +
                                                '<span class="psgp-kpipanel-item-value">' + item.value + '</span>' +
                                            '</div>' +
                                        '</div>';
                });
                $obj.children('.psgp-kpipanel').append(markUpChildren);
                $obj.find('.psgp-kpipanel-item:not(:last-child)').addClass('not-last');
            },
            _create: function () {
                var markUp = '' +
                    '<div class="psgp-kpipanel">' +

                    '</div>';
                var $obj = $(markUp)
                    .css({
                        width: this.options.width,
                        height: this.options.height
                    });
                $obj.appendTo(this.element);
            }
        });

        /*
         * psgpPagingSelect
         * options:
         *      list: {name, id}
         */
        $.widget(defaultNamespace + '.psgpPagingSelect', {
            options: {
                list: [],
                menuClass: 'psgp-paging-select-form-menu',
                inputClass: 'psgp-paging-select-form'
            },
            _create: function () {
                var me = this;
                var list = me.options.list;
                var markUp = '' +
                    '<select class="psgp-paging-select"></select>';
                var options = '';
                $.each(list, function (index, item) {
                    options += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                var $obj = $(markUp).append($(options));
                $obj.appendTo(me.element)
                    .selectmenu({
                        width: 'auto',
                        change: me.options.change
                    });
                $obj.parent().addClass(me.options.inputClass);
                $obj.selectmenu('menuWidget').parent().addClass(this.options.menuClass);
                $obj.parent().find('.ui-selectmenu-button').mouseenter( function () {
                    $obj.selectmenu('open');
                });
            }
        });

        /*
         * psgpGrid
         * options:
         *      url - optional
         *      columns:
         *          dataIndex
         *          text
         *          renderer
         *          defaultValue - optional
         *          width - optional
         *          resizable - true/false; default: true
         *          sortable - true/false; default: true
         *      data
         *      sort:
         *          dataIndex
         *          dir: true - desc; false - asc
         *          remote: true/false
         *      paging:
         *      listeners
         *          afterRefreshData ( gridObject, response )
         *      exportCSV: true/false
         *
         *
         */
        $.widget(defaultNamespace + '.psgpGrid', {
            options: {
                url: null,
                params: null,
                columns: [],
                data: [],
                sort: {
                    dataIndex: '',
                    dir: false,
                    remote: false
                },
                paging: null,
                exportCSV: null,
                emptyMessage: APMTranslation.apm.r2020a.norecordsareavailablefordisplay(),
                listeners: {}
            },
            _private: {
                totalPages: null,
                currPage: null
            },
            refreshDataRemote: function (params, page) {
                var me = this;
                if (me.options.sort.remote) {
                    params.sort = me.options.sort.dataIndex;
                    params.dir = (me.options.sort.dir) ? 'DESC' : 'ASC';
                }
                if (me.options.paging) {
                    params.pageLimit = me.options.paging.pageLimit;
                    params.startIndex = (page) ? ((page - 1) * params.pageLimit) : 0;
                }
                me.element.addClass('psgp-loading-mask');
                $.ajax({
                        url: me.options.url,
                        type: 'GET',
                        data: params,
                        dataType: 'json'
                    }).done(function (response) {
                        if (!response.success) {
                            alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                            return;
                        }
                        me.options.params = params;
                        me.refreshData(response);
                        if (me.options.paging) me._refreshPagingToolbar(response, page);
                        me.element.removeClass('psgp-loading-mask');
                    })
                    .fail(function (response) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                        me.element.removeClass('psgp-loading-mask');
                    });
            },
            remoteExportCSV: function (params) {
                var me = this;
                var urlRequest = me.options.url;
                var paramString = $.param(params);
                window.location.href = urlRequest + '&getcsv=T' + '&' + paramString;
            },
            refreshData: function (response) {
                var me = this;
                me.options.response = response;
                me.options.data = response.data;
                me.sortColumn(me.options.sort);
            },
            _refreshPagingToolbar: function (response, page) {
                var me = this;
                var total = response.total;
                var pages = response.pages;
                me.element.find('.psgp-paging-total-value').text(total);
                var $pagingSelect = me.element.find('.psgp-paging-select');
                var markUpPages = '';
                $.each(pages, function (index, item) {
                    markUpPages += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                $pagingSelect.children().remove();
                $pagingSelect.append($(markUpPages));
                me._private.totalPages = response.totalPages;
                me._private.currPage = (page) ? page : 1;
                $pagingSelect.val(me._private.currPage);
                $pagingSelect.selectmenu('refresh');
                if (me._private.currPage <= 1) {
                    me.element.find('.psgp-paging-btn-prev').prop('disabled', true);
                } else {
                    me.element.find('.psgp-paging-btn-prev').prop('disabled', false);
                }
                if (me._private.currPage >= me._private.totalPages) {
                    me.element.find('.psgp-paging-btn-next').prop('disabled', true);
                } else {
                    me.element.find('.psgp-paging-btn-next').prop('disabled', false);
                }
            },
            _renderHeader: function () {
                var me = this;
                this.element.find('thead tr').remove();
                var $header = $('<tr></tr>');
                $.each(me.options.columns, function (index, value) {
                    var $col = $('<th><span></span></th>');
                    $col.attr('data-index', value.dataIndex);
                    if (value.width) $col.css('width', value.width);
                    $col.find('span').text(value.text);
                    $header.append($col);

                    //attach resizable
                    if (value.resizable !== false) {
                        $col.resizable({
                            handles: 'e'
                        });
                    }

                    //attach sorting
                    if (value.sortable !== false) {
                        $col.click(function () {
                            var column = this;
                            me._sortColumnByClick(column);
                        });
                    }

                });
                me.element.find('thead').append($header);
            },
            _renderBody: function () {
                var me = this;
                this.element.find('tbody tr').remove();
                var markUp = '';

                if (me.options.data && me.options.data.length > 0) {
                    $.each(me.options.data, function (index, value) {
                        markUp += me._getBodyRowMarkUp(value, me.options.columns);
                    });
                    if (markUp) me.element.find('tbody').append(markUp);
                    me.element.find('.empty-message').hide();
                } else { //empty grid
                    me.element.find('.empty-message').show();
                }

                //run afterRefreshData listener
                if (me.options.listeners.afterRefreshData) {
                    me.options.listeners.afterRefreshData(me, me.options.response);
                }
            },
            sortColumn: function (sort) {
                var me = this;
                var column = me.element.find('[data-index="' + sort.dataIndex + '"]');
                me._removeSortClass();
                if (column.length == 1) { //should only be one result
                    $(column).find('span').addClass(sort.dir ? 'desc' : 'asc');
                    if (!me.options.sort.remote) $.PSGP.sortObjectArray(me.options.data, sort.dataIndex, sort.dir);
                }
                me._renderBody();
            },
            _sortColumnByClick: function (column) {
                var me = this;
                var dataIndex = $(column).attr('data-index');
                var data = me.options.data;
                var dir = false;
                var $span = $(column).find('span');
                if ($span.hasClass('asc')) {
                    me._removeSortClass();
                    dir = true;
                    $span.addClass('desc');
                } else {
                    me._removeSortClass();
                    dir = false;
                    $span.addClass('asc');
                }
                me.options.sort.dataIndex = dataIndex;
                me.options.sort.dir = dir;
                if (me.options.sort.remote) {
                    if (!me.options.params) return;
                    me.refreshDataRemote(me.options.params, me._private.currPage);
                } else {
                    $.PSGP.sortObjectArray(data, dataIndex, dir);
                    me._renderBody();
                }
            },
            _removeSortClass: function () {
                var me = this;
                me.element.find('.asc').removeClass('asc');
                me.element.find('.desc').removeClass('desc');
            },
            _getBodyRowMarkUp: function (data, columns) {
                var me = this;
                var markUp = '<tr>';
                $.each(me.options.columns, function (index, value) {
                    var renderedValue = '';
                    if (value.renderer) {
                        renderedValue = value.renderer(data[value.dataIndex], data);
                    } else if (data[value.dataIndex]) {
                        renderedValue = data[value.dataIndex];
                    } else if (value.defaultValue) {
                        renderedValue = value.defaultValue;
                    } else {
                        renderedValue = '';
                    }
                    markUp += '<td><span>' + renderedValue + '</span></td>';
                });
                markUp += '</tr>';
                return markUp;
            },
            _create: function () {
                var me = this;
                var markUp = '<div class="psgp-grid">' +
                    '<table>' +
                    '<colgroup></colgroup>' +
                    '<thead></thead>' +
                    '<tfoot></tfoot>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '<div class="empty-message"></div>' +
                    '</div>';
                var $obj = $(markUp);
                $obj.appendTo(me.element);
                me.element.find('.empty-message').html(me.options.emptyMessage).hide();
                if (me.options.paging || me.options.exportCSV) {
                    var markUpPaging = '<div class="psgp-paging">';

                    var markUpPaging = '<div class="psgp-paging">';
                    if (me.options.exportCSV) {
                        markUpPaging += '<div class="psgp-paging-exportcsv" title="' + APMTranslation.apm.common.label.exportcsv() +'"></div>';
                    }
                    if (me.options.paging) {
                        markUpPaging += '<div class="psgp-paging-comp">' +
                        '<div class="psgp-paging-select-div"></div>' +
                        '<input type="button" class="psgp-paging-btn psgp-paging-btn-prev"/>' +
                        '<input type="button" class="psgp-paging-btn psgp-paging-btn-next"/>' +
                        '<span class="psgp-paging-total-label">' + APMTranslation.apm.common.label.total() + ':</span>' +
                        '<span class="psgp-paging-total-value"></span>' +
                        '</div>';
                    }
                    markUpPaging += '</div>';

                    $obj.prepend(markUpPaging);

                    if (me.options.exportCSV) {
                        $obj.find('.psgp-paging-exportcsv').click(function () {
                            me.remoteExportCSV(me.options.params);
                        });
                    }

                    if (me.options.paging) {
                        $obj.find('.psgp-paging-select-div').psgpPagingSelect({
                            change: function (event, ui) {
                                var newPage = parseInt($(this).val());
                                me.refreshDataRemote(me.options.params, newPage);
                            }
                        });
                        $obj.find('.psgp-paging-btn-prev').click(function () {
                            var newPage = me._private.currPage - 1;
                            me.refreshDataRemote(me.options.params, newPage);
                        });
                        $obj.find('.psgp-paging-btn-next').click(function () {
                            var newPage = me._private.currPage + 1;
                            me.refreshDataRemote(me.options.params, newPage);
                        });
                        $obj.find('.psgp-paging-btn-prev').prop('disabled', true);
                        $obj.find('.psgp-paging-btn-next').prop('disabled', true);
                    }

                }
                me._renderHeader();
                me.sortColumn(me.options.sort);
            }
        });

        /*
         * psgpDialog
         * options:
         *
         */
        $.widget(defaultNamespace + '.psgpDialog', {
            options: {
                resizable: false,
                modal: true,
                position: {},
                dialogClass : 'psgp-dialog',
                minWidth: 0,
                minHeight: 0,
                title: '',
                autoOpen: true,
                closeOnEscape: true,
                close: function( event, ui ) {
                    var me = this;
                    $(me).dialog('destroy').remove();
                }
            },
            _create: function () {
                $(this.element).dialog({
                    modal: this.options.modal,
                    resizable: this.options.resizable,
                    position: this.options.position,
                    dialogClass : this.options.dialogClass,
                    minWidth: this.options.minWidth,
                    minHeight: this.options.minHeight,
                    width: this.options.width,
                    title: this.options.title,
                    autoOpen: this.options.autoOpen,
                    closeOnEscape: this.options.closeOnEscape,
                    close: this.options.close,
                    closeText: APMTranslation.apm.common.label.close()
                });
            }
        });

        /*
         * psgpCarousel
         * options:
         *      height - css format
         *      width - css format
         *      pageSize - int
         *      contentArray - array of jquery elements
         *      listeners
         *          afterItemRender (item)
         *
         */
        $.widget(defaultNamespace + '.psgpCarousel', {
            options: {
                height: '100%',
                width: '100%',
                pageSize: 1,
                contentArray: [],
                listeners: {}
            },
            changePage: function (direction) {
                var me = this;
                me._changePage(direction);
            },
            pagination: function () {
                var me = this;
                var contentArray = me.options.contentArray;
                var pageDetails = {
                    tilesPerPage: me.options.pageSize,
                    currentPage: me._private.currentPage,
                    totalTiles: contentArray.length
                }
                return pageDetails;
            },
            resetPagination: function () {
                var me = this;
                me._private.currentPage = 1;
            },
            _private: {
                currentPage: 1
            },
            _create: function () {
                var me = this;
                var markUp =
                    '<div class="psgp-carousel">' +
                    '<div class="prev btn">' +
                    '<div class="btn-body">' +
                    '</div>' +
                    '</div>' +
                    '<div class="main">' +
                    '</div>' +
                    '<div class="next btn">' +
                    '<div class="btn-body">' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var $obj = $(markUp);
                $obj.height(me.options.height);
                $obj.width(me.options.width);
                $obj.appendTo(me.element);

                var pageSize = me.options.pageSize;
                //generate rooms
                for (var i = 0; i < pageSize; i++) {
                    var $room = $('<div class="room"></div>');
                    $room.addClass('room-'+i);
                    $obj.find('.main').append($room);
                }

                var contentArray = me.options.contentArray;
                contentArray = (contentArray && contentArray.length > 0) ? contentArray : [];
                var currPageElements =  contentArray.slice(0, pageSize);
                $.each(currPageElements, function (index, item) {
                    $obj.find('.room-'+index).append(item);
                    //run afterItemRender listener
                    if (me.options.listeners.afterItemRender) {
                        me.options.listeners.afterItemRender(item);
                    }
                });

                $obj.find('.prev .btn-body').click(function () {
                    me._changePage('prev');
                });
                $obj.find('.next .btn-body').click(function () {
                    me._changePage('next');
                });

            },
            _destroy: function () {
                this.element.empty();
            },
            _changePage: function (direction) {
                var me = this;
                var currentPage = me._private.currentPage;
                var pageSize = me.options.pageSize;
                var contentArray = me.options.contentArray;
                var totalContent = contentArray.length;
                var lastPage = Math.ceil(totalContent / pageSize);
                var newPage = 0;
                if (direction == 'prev') {
                    newPage = (currentPage == 1) ? lastPage : (currentPage-1);
                } else { //next
                    newPage = (currentPage == lastPage) ? 1 : (currentPage+1);
                }
                $(me.element).find('.room').children().detach();
                var newPageElements =  contentArray.slice(pageSize*(newPage-1), (pageSize*(newPage-1))+pageSize);
                $.each(newPageElements, function (index, item) {
                    $(me.element).find('.room-'+index).append(item);
                    //run afterItemRender listener
                    if (me.options.listeners.afterItemRender) {
                        me.options.listeners.afterItemRender(item);
                    }
                });
                me._private.currentPage = newPage;
            }
        });

        /*
         * psgpExpandableGrid
         * options:
         *      url - optional
         *      bodyHeight - integer
         *      columns:
         *          dataIndex
         *          text
         *          renderer
         *          defaultValue - optional
         *          width - optional
         *          resizable - true/false; default: true
         *          sortable - true/false; default: true
         *      data
         *      sort:
         *          dataIndex
         *          dir: true - desc; false - asc
         *          remote: true/false
         *      paging:
         *      listeners
         *          afterRefreshData ( gridObject, response )
         *      exportCSV: true/false
         *
         *
         */
        $.widget(defaultNamespace + '.psgpExpandableGrid', {
            options: {
                url: null,
                params: null,
                columns: [],
                bodyHeight: 400,
                data: [],
                sort: {
                    dataIndex: '',
                    dir: false,
                    remote: false
                },
                paging: null,
                exportCSV: null,
                listeners: {}
            },
            _private: {
                totalPages: null,
                currPage: null,
                isRowOdd: true
            },
            refreshDataRemote: function (params, page) {
                var me = this;
                if (me.options.sort.remote) {
                    params.sort = me.options.sort.dataIndex;
                    params.dir = (me.options.sort.dir) ? 'DESC' : 'ASC';
                }
                if (me.options.paging) {
                    params.pageLimit = me.options.paging.pageLimit;
                    params.startIndex = (page) ? ((page - 1) * params.pageLimit) : 0;
                }
                me.element.addClass('psgp-loading-mask');
                $.ajax({
                        url: me.options.url,
                        type: 'GET',
                        data: params,
                        dataType: 'json'
                    }).done(function (response) {
                        if (!response.success) {
                            alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthissearch());
                            return;
                        }
                        me.options.params = params;
                        me.refreshData(response);
                        if (me.options.paging) me._refreshPagingToolbar(response, page);
                        me.element.removeClass('psgp-loading-mask');
                    })
                    .fail(function (response) {
                        alert(APMTranslation.apm.r2020a.anerroroccurredwhileloadingthispage());
                        me.element.removeClass('psgp-loading-mask');
                    });
            },
            remoteExportCSV: function (params) {
                var me = this;
                var urlRequest = me.options.url;
                var paramString = $.param(params);
                window.location.href = urlRequest + '&getcsv=T' + '&' + paramString;
            },
            refreshData: function (response) {
                var me = this;
                me.options.response = response;
                me.options.data = response.data;
                me.sortColumn(me.options.sort);
            },
            _refreshPagingToolbar: function (response, page) {
                var me = this;
                var total = response.total;
                var pages = response.pages;
                me.element.find('.psgp-paging-total-value').text(total);
                var $pagingSelect = me.element.find('.psgp-paging-select');
                var markUpPages = '';
                $.each(pages, function (index, item) {
                    markUpPages += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                $pagingSelect.children().remove();
                $pagingSelect.append($(markUpPages));
                me._private.totalPages = response.totalPages;
                me._private.currPage = (page) ? page : 1;
                $pagingSelect.val(me._private.currPage);
                $pagingSelect.selectmenu('refresh');
                if (me._private.currPage <= 1) {
                    me.element.find('.psgp-paging-btn-prev').prop('disabled', true);
                } else {
                    me.element.find('.psgp-paging-btn-prev').prop('disabled', false);
                }
                if (me._private.currPage >= me._private.totalPages) {
                    me.element.find('.psgp-paging-btn-next').prop('disabled', true);
                } else {
                    me.element.find('.psgp-paging-btn-next').prop('disabled', false);
                }
            },
            _renderHeader: function () {
                var me = this;
                this.element.find('thead tr').remove();
                var $header1 = $('<tr class="tr-1"></tr>');
                var $header2 = $('<tr class="tr-2"></tr>');
                $.each(me.options.columns, function (index, value) {
                    var thClass = 'th-' + index;
                    var $col = $('<th class="' + thClass + '"><span></span></th>');
                    $col.attr('data-index', value.dataIndex);
                    if (value.width) $col.css('width', value.width);
                    $col.find('span').text(value.text);
                    $header1.append($col);
                    $header2.append($col.clone());

                    //attach resizable
                    if (value.resizable !== false) {
                        $col.resizable({
                            handles: 'e',
                            alsoResize: '.thead-2' + ' .' + thClass
                        });
                    }

                    //attach sorting
                    if (value.sortable !== false) {
                        $col.click(function () {
                            var column = this;
                            me._sortColumnByClick(column);
                        });
                    }

                });
                me.element.find('.thead-1').append($header1);
                me.element.find('.thead-2').append($header2);

            },
            _renderBody: function () {
                var me = this;
                this.element.find('.main-tbody tr').remove();
                var markUp = '';
                me._private.isRowOdd = true;
                $.each(me.options.data, function (index, value) {
                    markUp += me._getBodyRowMarkUp(value, me.options.columns);
                });
                if (markUp) me.element.find('.main-tbody').append(markUp);

                //run afterRefreshData listener
                if (me.options.listeners.afterRefreshData) {
                    me.options.listeners.afterRefreshData(me, me.options.response);
                }
            },
            sortColumn: function (sort) {
                var me = this;
                var column = me.element.find('[data-index="' + sort.dataIndex + '"]');
                me._removeSortClass();
                if (column.length == 1) { //should only be one result
                    $(column).find('span').addClass(sort.dir ? 'desc' : 'asc');
                    if (!me.options.sort.remote) $.PSGP.sortObjectArray(me.options.data, sort.dataIndex, sort.dir);
                }
                me._renderBody();
            },
            _sortColumnByClick: function (column) {
                var me = this;
                var dataIndex = $(column).attr('data-index');
                var data = me.options.data;
                var dir = false;
                var $span = $(column).find('span');
                if ($span.hasClass('asc')) {
                    me._removeSortClass();
                    dir = true;
                    $span.addClass('desc');
                } else {
                    me._removeSortClass();
                    dir = false;
                    $span.addClass('asc');
                }
                me.options.sort.dataIndex = dataIndex;
                me.options.sort.dir = dir;
                if (me.options.sort.remote) {
                    if (!me.options.params) return;
                    me.refreshDataRemote(me.options.params, me._private.currPage);
                } else {
                    $.PSGP.sortObjectArray(data, dataIndex, dir);
                    me._renderBody();
                }
            },
            _removeSortClass: function () {
                var me = this;
                me.element.find('.asc').removeClass('asc');
                me.element.find('.desc').removeClass('desc');
            },
            _getBodyRowMarkUp: function (data, columns) {
                var me = this;
                var isRowOdd = me._private.isRowOdd;
                var rowOddEvenClass = me._private.isRowOdd ? 'tr-odd' : 'tr-even';
                me._private.isRowOdd = !me._private.isRowOdd;
                var markUp = '<tr class="tr-main ' + rowOddEvenClass + '">';
                $.each(me.options.columns, function (index, value) {
                    var renderedValue = '';
                    if (value.renderer) {
                        renderedValue = value.renderer(data[value.dataIndex], data);
                    } else if (data[value.dataIndex]) {
                        renderedValue = data[value.dataIndex];
                    } else if (value.defaultValue) {
                        renderedValue = value.defaultValue;
                    } else {
                        renderedValue = '';
                    }
                    markUp += '<td valign="top">' + renderedValue + '</td>';
                });
                markUp += '</tr>';
                var columnTotal = me.options.columns.length;
                markUp += '<tr class="tr-expandable ' + rowOddEvenClass + '"><td colspan="' + columnTotal + '"></td></tr>';
                return markUp;
            },
            _create: function () {
                var me = this;
                var markUp =
                    '<div class="psgp-expandable-grid">' +
                        '<div class="grid-header">' +
                            '<table>' +
                                '<colgroup></colgroup>' +
                                '<thead class="thead-1"></thead>' +
                                '<tfoot></tfoot>' +
                                '<tbody></tbody>' +
                            '</table>' +
                        '</div>' +
                        '<div class="grid-main">' +
                            '<table>' +
                                '<colgroup></colgroup>' +
                                '<thead class="thead-2"></thead>' +
                                '<tfoot></tfoot>' +
                                '<tbody class="main-tbody"></tbody>' +
                            '</table>' +
                         '</div>' +
                    '</div>';
                var $obj = $(markUp);
                $obj.appendTo(me.element);
                if (me.options.bodyHeight && me.options.bodyHeight > 0) {
                    $obj.find('.grid-main').css({
                        'height': me.options.bodyHeight + 'px',
                        'overflow-y': 'scroll'
                    });
                    $obj.find('.grid-header').css({
                        'padding-right': '15px'
                    });
                }
                if (me.options.paging || me.options.exportCSV) {
                    var markUpPaging = '<div class="psgp-paging">';

                    var markUpPaging = '<div class="psgp-paging">';
                    if (me.options.exportCSV) {
                        markUpPaging += '<div class="psgp-paging-exportcsv" title="' + APMTranslation.apm.common.label.exportcsv() +'"></div>';
                    }
                    if (me.options.paging) {
                        markUpPaging += '<div class="psgp-paging-comp">' +
                        '<div class="psgp-paging-select-div"></div>' +
                        '<input type="button" class="psgp-paging-btn psgp-paging-btn-prev"/>' +
                        '<input type="button" class="psgp-paging-btn psgp-paging-btn-next"/>' +
                        '<span class="psgp-paging-total-label">' + APMTranslation.apm.common.label.total() + ':</span>' +
                        '<span class="psgp-paging-total-value"></span>' +
                        '</div>';
                    }
                    markUpPaging += '</div>';

                    $obj.prepend(markUpPaging);

                    if (me.options.exportCSV) {
                        $obj.find('.psgp-paging-exportcsv').click(function () {
                            me.remoteExportCSV(me.options.params);
                        });
                    }

                    if (me.options.paging) {
                        $obj.find('.psgp-paging-select-div').psgpPagingSelect({
                            change: function (event, ui) {
                                var newPage = parseInt($(this).val());
                                me.refreshDataRemote(me.options.params, newPage);
                            }
                        });
                        $obj.find('.psgp-paging-btn-prev').click(function () {
                            var newPage = me._private.currPage - 1;
                            me.refreshDataRemote(me.options.params, newPage);
                        });
                        $obj.find('.psgp-paging-btn-next').click(function () {
                            var newPage = me._private.currPage + 1;
                            me.refreshDataRemote(me.options.params, newPage);
                        });
                        $obj.find('.psgp-paging-btn-prev').prop('disabled', true);
                        $obj.find('.psgp-paging-btn-next').prop('disabled', true);
                    }

                }
                me._renderHeader();
                me.sortColumn(me.options.sort);
            }
        });

        /*
         * New APM SuiteApp Version Available in Marketplace notice
         */
        $.widget(defaultNamespace + '.psgpNewSuiteAppNote', {
            _create: function () {
                var noteTitle = APMTranslation.apm_r2021a_newapmsuiteappversionavailableinmarketplace();
                var noteDetails = APMTranslation.apm_r2021a_theapmsuiteappismovingtothesuiteappmarketplace();
                var linkText = APMTranslation.apm_r2021a_installingfromthesuiteappmarketplace();
                var linkUrl = '/app/help/helpcenter.nl?fid=section_1539799323.html';
                
                
                //Preserve markup indention
                //prettier-ignore
                var markUp =
                    '' +
                    '<div class="apm-new-suiteapp-note">' +
                        '<div class="apm-new-suiteapp-note-title">' + noteTitle + '</div> ' +
                        '<div class="apm-new-suiteapp-note-details">' + noteDetails +
                                        ' ' + '<a style="color:#0000CC" target="_blank" href="'+ linkUrl +'">' + linkText + '</a>' + '</div> ' +
                    '</div>';

                var $obj = $(markUp);
                $obj.appendTo(this.element);
            }
        });

        if (!$[defaultNamespace]) $[defaultNamespace] = {};

        /*
         * sortObjectArray
         * parameters:
         *  arr - object to sort
         *  key - sorting key
         *  dir - true - descending, false - ascending
         */
        $[defaultNamespace].sortObjectArray = function (arr, key, dir) {
            dir = (dir) ? true : false;
            arr.sort(function (a, b) {
                var keyA = a[key];
                var keyB = b[key];
                var x = 0;
                if (keyA < keyB) x = -1;
                if (keyA > keyB) x = 1;
                if (dir) x *= -1;
                return x;
            });
        };

    }));

}