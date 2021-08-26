/**
 * Copyright (c) 2010, Hans Doller All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. * Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. * The names of its contributors may not be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.
 * 
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * Ext4.date.RangePicker Menu for receiving date range input
 * 
 * @author Hans Doller <hans@w3forge.org>
 * @version DateRange.js 2011-01-29 v0.1rc
 * 
 * @class Ext4.date.RangePicker
 * @extends Ext4.menu.Menu
 */
/**
 * Version  Date            Author      Remarks
 * 1.00     01/30/2014      maquino     Initial version
 * 2.00     02/03/2014      jmarimla    removed trailing commas, changed indexOf to Ext4.Array.indexOf
 * 3.00     02/03/2014      maquino     Updated code to display menu on trigger location
 * 4.00     02/07/2014      maquino     Updated date to comply with NS preference format
 *                                      Hide menu after choosing 2 dates
 * 5.00     02/10/2014      maquino     Removed hiding of menu after choosing 2 dates because it causes a different bug
 * 6.00     02/12/2014      maquino     Changed label for "Last" and "Next" menus
 *                                      Changed hideOnClicks to false
 *                                      Updated content for "This...", "Last..." and "Next..." menus
 * 7.00     02/12/2014      maquino     Added hideOnClick: false properties to all items
 *                                      Added menu separators
 * 8.00     02/13/2014      maquino     Removed a hideOnClick for the "On or Before" and "After" menu
 * 9.00     02/13/2014      maquino     Added logic to select previously chosen date in calendar pickers
 * 10.00    02/14/2014      maquino     Updated parsing of date for date format 'j F, Y'
 * 11.00    02/14/2014      maquino     Added 'clear' item in menu
 * 12.00    02/14/2014      maquino     Hide all menus when applying custom date range
 * 13.00    02/17/2014      maquino     Removed trailing comma
 * 14.00    02/17/2014      maquino     Fixed date formatting implementation
 * 15.00    04/28/2014      maquino     Added translation support
 * 16.00    05/09/2014      maquino     Placed translation support for additional strings
 * 17.00    05/29/2014      pbtan       updated string values to match the popup form's search strings. 
 *                                      for better compatibility with ns values. e.g. within lastfiscalquarter, after nextmonth, on today
 * 18.00    05/30/2014      pbtan       fixed error in removing "this fiscal quarter"
 * 19.00    05/30/2014      pbtan       removed extra comma for IE.
 *  
 */
Ext4.define('Ext4.date.RangePicker', {
    extend : 'Ext4.menu.Menu',
    /**
     * Internal date picker for right
     * 
     * @scope public
     * @var Ext4.DatePicker
     */
    _pickerLeft : null,
    /**
     * Internal date picker for right
     * 
     * @scope public
     * @var Ext4.DatePicker
     */
    _pickerRight : null,
    /**
     * Override constructor to input special configuration for this component
     * 
     * @scope public
     * @return void
     */
    constructor : function(c) {
        c = c || {};
        //
        this.addEvents({
            apply : true,
            change : true,
            cancel : true
        });
        //
        Ext4.date.RangePicker.superclass.constructor.call(Ext4.apply(this, c, Ext4.date.RangePicker.defaults), c);
    },
    /**
     * Override to implement special ui features for this component
     * 
     * @scope public
     * @return void
     */
    initComponent : function() {
        // get/assemble pickers
        var lD = this.getLeft(), rD = this.getRight();
        // build the main interface
        this.items = this._buildPanel();
        // assign events
        lD.addListener('select', this._handlePickerSelect, this);
        rD.addListener('select', this._handlePickerSelect, this);
        // setup handler
        this.addListener('apply', this.handler, this.scope);
        // prevent future dates
        if (this.preventFutureDates) {
            var now = new Date();
            lD.setMaxDate(now);
            rD.setMaxDate(now);
        }
        //
        Ext4.date.RangePicker.superclass.initComponent.call(this);
    },
    /**
     * Internal handler for date picker select events
     * 
     * @scope protected
     */
    _handlePickerSelect : function(dp, date) {
        this.fireEvent('change', this, dp, date);
    },
    /**
     * Construct a picker for this range picker
     * 
     * @scope protected
     * @return Ext4.DatePicker
     */
    _buildPicker : function(opts) {
        return new Ext4.DatePicker(Ext4.apply({}, opts, this.pickerOpts));
    },
    /**
     * Construct a picker for this range picker
     * 
     * @scope protected
     * @return Ext4.Panel
     */
    _buildPickerPanel : function(opts, picker) {
        return new Ext4.Panel(Ext4.apply({}, opts, {
            items : picker || this._buildPicker(opts),
            border : true
        }));
    },
    /**
     * Construct the main panel interface with pickers
     * 
     * @scope protected
     * @return Ext4.Panel
     */
    _buildPanel : function() {
        return new Ext4.form.FormPanel(Ext4.apply({}, this.panelOpts, {
            width : 352,
            baseCls : 'x-plain',
            layout : 'column',
            items : [
                this._buildPickerPanel({
                    columnWidth : .5,
                    title : Ext4.date.RangePicker.strings.strFromDate
                }, this.getLeft()), this._buildPickerPanel({
                    columnWidth : .5,
                    title : Ext4.date.RangePicker.strings.strToDate
                }, this.getRight())
            ],
            buttons : [
                {
                    text : Ext4.date.RangePicker.strings.strApply,
                    scope : this,
                    handler : function() {
                        // fire the choose event
                        this.fireEvent('apply', this, this.getDates());
                        // hide all menus
                        this.hide(true);
                    }
                }, {
                    text : Ext4.date.RangePicker.strings.strCancel,
                    scope : this,
                    handler : function() {
                        // fire the cancel event
                        this.fireEvent('cancel', this);
                        // hide this menu
                        this.hide();
                    }
                }
            ]
        }));
    },
    /**
     * Gets the date picker used for left value
     * 
     * @scope public
     * @return Ext4.DatePicker
     */
    getLeft : function() {
        //
        if (this._pickerLeft === null) { // construct a new picker
            this._pickerLeft = this._buildPicker({
                which : 'left',
                value : this.value[0]
            });
        }
        // .
        return this._pickerLeft;
    },
    /**
     * Gets the date from the current left date ui
     * 
     * @return Date
     */
    getLeftDate : function() {
        return this.getLeft().getValue();
    },
    /**
     * Gets the date picker used for right value
     * 
     * @scope public
     * @return Ext4.DatePicker
     */
    getRight : function() {
        //
        if (this._pickerRight === null) { // construct a new picker
            this._pickerRight = this._buildPicker({
                which : 'right',
                value : this.value[1] || this.value[0]
            });
        }
        // .
        return this._pickerRight;
    },
    /**
     * Gets the date from the right date ui
     * 
     * @return Date
     */
    getRightDate : function() {
        return this.getRight().getValue();
    },
    /**
     * Gets the current dates defined in the UI
     * @return Array
     */
    getDates : function() {
        //
        var d1 = this.getLeftDate(), d2 = this.getRightDate();
        //
        if (d1.toJSONString() === d2.toJSONString()) { return d1; }
        //
        return [
            d1, d2
        ];
    }
});
Ext4.date.RangePicker.defaults = {
    //
    plain : true,
    /**
     * Initial values for range picker
     * @var array
     */
    value : [],
    /**
     * Options applied to all pickers
     * 
     * @scope public
     * @var Object
     */
    pickerOpts : null,
    /**
     * Prevent future dates in selection
     * 
     * @scope public
     * @var Object
     */
    preventFutureDates : false,
    /**
     * Options to main ui panel
     * 
     * @scope public
     * @var Object
     */
    panelOpts : null
};
Ext4.date.RangePicker.strings = {
    strApply : 'Apply',
    strCancel : 'Cancel',
    strFromDate : '',
    strToDate : ''
};
/**
 * Ext4.date.RangeField class
 * 
 * @author Hans Doller <hans@w3forge.org>
 * @version DateRange.js 2011-01-29 v0.1rc
 * 
 * @class Ext4.date.RangeField
 * @extends Ext4.form.TriggerField
 */
Ext4.define('Ext4.date.RangeField', {
    extend : 'Ext4.form.field.Trigger',
    triggerCls : 'x4-form-date-trigger',
    /**
     * Internal buffers for to/from date.
     * @var Date
     */
    _dateFrom : false,
    _dateTo : false,
    /**
     * Internal default date values
     */
    _dateValue1 : null,
    _dateValue2 : null,
    _dateOperator : null,
    _menuOperator : null,
    /**
     * Internal menu storage
     * @var Ext4.menu.Menu
     */
    _menu : null,
    /**
     * Compares arguments to see if there are changes
     * @return bool
     */
    _compare : function() {
        var argSerialized = [];
        Ext4.each(arguments, function(v, i, a) {
            argSerialized[i] = Ext4.encode(v);
        });
        var lv, result = true;
        Ext4.each(argSerialized, function(v, i, a) {
            if (i === 0) {
                lv = v;
                return;
            }
            if (v !== lv) {
                result = false;
                return false;
            }
            lv = v;
        });
        //
        return result;
    },
    /**
     * Formats a date with the currently set format.
     * @return string
     */
    _formatDate : function(d) {
        return (d instanceof Date) ? d.format(this.format) : false;
    },
    /**
     * Parses a mixed value date and transforms it into a MS timestamp
     * @return integer
     */
    _parseDateTime : function(m) {
        switch (typeof (m)) {
            case 'function': {
                m = m();
                break;
            }
            case 'object': {
                if (false === (m instanceof Date)) { return false; }
                m = String(m);
                break;
            }
            case 'string': {
                // see if this is a quick kw
                if (Ext4.date.RangeField.keywords[m] !== undefined) {
                    m = Ext4.date.RangeField.keywords[m]();
                } else { // try to parse with datejs
                    m = Date.parse(m);
                }
                break;
            }
            default:
                return false;
        }
        //
        return (new Date(m)).getTime();
    },
    /**
     * Reads the current value (parsing date input)
     */
    _read : function(v) {
        v = v || this.getValue();
        //
        var dates = v, datesClean = [], result = [];
        if (Ext4.isString(dates) && Ext4.Array.indexOf(dates, this.delimiter) > -1) {
            dates = dates.split(this.delimiter);
        }
        //
        if (!Ext4.isArray(dates)) {
            dates = [
                dates
            ];
        }
        //
        Ext4.each(dates, function(v, i, a) {
            var parsed = this._parseDateTime(v);
            if (!parsed) { // skip if not parse-able
                return;
            }
            // add parsed date to stack as a ms timestamp (for sorting)
            datesClean.push(parsed);
        }, this);
        // add the numerically sorted dates to the result stack
        Ext4.each(datesClean.sort(function(a, b) {
            return (a - b);
        }), function(dateMs, i, a) {
            result.push(new Date(dateMs));
        });
        // apply the input read in
        this._dateFrom = result[0] || false;
        this._dateTo = result[1] || false;
    },
    /**
     * Write the current value (set triggerfield value)
     */
    _write : function() { //
        var outStr = "";
        if (this.getDateFrom()) {
            outStr += this._formatDate(this.getDateFrom());
            if (this.getDateTo()) {
                outStr += this.delimiter + this._formatDate(this.getDateTo());
            }
        }
        // set the triggerfield value
        this.setValue(outStr);
    },
    /**
     * Clears the current dates and control value
     */
    _clear : function() {
        // clear the internal values
        this._dateFrom = false;
        this._dateTo = false;
        // clear the triggerfield value
        this.setValue('');
    },
    /**
     * Creates menu categories items 
     * Options: "On", "After", "On or before" and "Within"
     * @return Ext4.menu.Item
     */
    _menuItemCategories : function(p) {
        var mItems = [];
        var text = p.text;
        switch (p.text) {
            case Ext4.date.RangeField.strings.strOnMenu:
                Ext4.each(this.getMenuOn(), function(v, i, a) {
                    mItems.push(this._menuItemOn(v, text));
                }, this);
                break;
            case Ext4.date.RangeField.strings.strWithinMenu:
                Ext4.each(this.getMenuWithin(), function(v, i, a) {
                    mItems.push(this._menuItemWithin(v));
                }, this);
                break;
            case Ext4.date.RangeField.strings.strOnOrBeforeMenu:
                Ext4.each(this.getMenuOA(), function(v, i, a) {
                    mItems.push(this._menuItemOA(v, text));
                }, this);
                break;
            case Ext4.date.RangeField.strings.strAfterMenu:
                Ext4.each(this.getMenuOA(), function(v, i, a) {
                    mItems.push(this._menuItemOA(v, text));
                }, this);
                break;
        }
        //Set the submenu in the selection.
        var submenu = new Ext4.menu.Menu({
            cls : 'ptm-datemenu-item-text',
            items : mItems
        });
        return new Ext4.menu.Item(Ext4.apply({}, p, {
            scope : this,
            hideOnClick : false,
            menu : submenu
        }));
    },
    /**
     * Sets value of specific date for "On" category
     * Options: "On Today", "On Yesterday", "On Tomorrow" and "On mm/dd/yyyy"
     * @return Ext4.menu.Item
     */
    _menuItemOn : function(p, text) {
        //Handler for specific date
        if (p.renderer) {
            var dateMenu = this.getDateMenu(p, this, '', text);
            return new Ext4.menu.Item(Ext4.apply({}, p, {
                hideOnClick : false,
                text : p.text,
                menu : dateMenu
            }));
        }
        //Handler for menu separator
        else if (p.xtype) {
            return '-';
        }
        //Handler for today, yesterday and tomorrow
        else {
            return new Ext4.menu.Item(Ext4.apply({}, p, {
                scope : this,
                handler : function() {
                    this.setValue(Ext4.date.RangeField.strings.strOn +  p.value);
                }
            }));
        }
    },
    /**
     * Sets value of custom date range for "Within" category
     * Displays menu for "Within This...", "Within Last...", and "Within Next..."
     * @var object
     */
    _menuItemWithin : function(p) {
        var mItems = [];
        var value = p.value;
        //Handler for custom date range
        if (p.renderer) {
            var dateMenu = this.getDateMenu(p, this);
            return new Ext4.menu.Item(Ext4.apply({}, p, {
                hideOnClick : false,
                text : p.text,
                menu : dateMenu
            }));
        }
        //Handler for menu separator
        else if (p.xtype) {
            return '-';
        }
        //Handler for this, last, and next menu
        else {
            if (p.text == Ext4.date.RangeField.strings.strThisMenu) {
                Ext4.each(this.getMenuThis(), function(v, i, a) {
                    mItems.push(this._menuItemThis(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            } else if (p.text == Ext4.date.RangeField.strings.strLastMenu) {
                Ext4.each(this.getMenuLast(), function(v, i, a) {
                    mItems.push(this._menuItemLast(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            } else if (p.text == Ext4.date.RangeField.strings.strNextMenu) {
                Ext4.each(this.getMenuNext(), function(v, i, a) {
                    mItems.push(this._menuItemNext(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            }
        }
    },
    /**
     * Sets value of custom date range for "On or Before and After" category
     * Displays menu for "On or Before This...", "On or Before Last...", and "On or Before Next..."
     * @var object
     */
    _menuItemOA : function(p, text) {
        var mItems = [];
        var value = text + ' ' + ((p.value) ? p.value : '');
        //Handler for specific date
        if (p.renderer) {
            var dateMenu = this.getDateMenu(p, this, value, text);
            return new Ext4.menu.Item(Ext4.apply({}, p, {
                hideOnClick : false,
                text : p.text,
                menu : dateMenu
            }));
        }
        //Handler for menu separator
        else if (p.xtype) {
            return '-';
        }
        //Handler for this, last, and next menu
        else {
            if (p.text == Ext4.date.RangeField.strings.strToday || p.text == Ext4.date.RangeField.strings.strYesterday || p.text == Ext4.date.RangeField.strings.strTomorrow) {
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : true,
                    handler : function() {
                        this.setValue(value);
                    }
                }));
            } else if (p.text == Ext4.date.RangeField.strings.strThisMenu) {
                Ext4.each(this.getMenuThis(), function(v, i, a) {
                    mItems.push(this._menuItemThis(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            } else if (p.text == Ext4.date.RangeField.strings.strLastMenu) {
                Ext4.each(this.getMenuLast(), function(v, i, a) {
                    mItems.push(this._menuItemLast(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            } else if (p.text == Ext4.date.RangeField.strings.strNextMenu) {
                Ext4.each(this.getMenuNext(), function(v, i, a) {
                    mItems.push(this._menuItemNext(v, this, value));
                }, this);
                var submenu = new Ext4.menu.Menu({
                    cls : 'ptm-datemenu-item-text',
                    items : mItems
                });
                return new Ext4.menu.Item(Ext4.apply({}, p, {
                    scope : this,
                    hideOnClick : false,
                    menu : submenu
                }));
            }
        }
    },
    /**
     * Sets value for "This..."
     * @var object
     */
    _menuItemThis : function(p, rf, value) {
        return new Ext4.menu.Item(Ext4.apply({}, p, {
            scope : this,
            handler : function() {
                rf.setValue(value + p.text);
            }
        }));
    },
    /**
     * Sets value for "Last..."
     * @var object
     */
    _menuItemLast : function(p, rf, value) {
        return new Ext4.menu.Item(Ext4.apply({}, p, {
            scope : this,
            handler : function() {
                rf.setValue(value + p.text);
            }
        }));
    },
    /**
     * Sets value for "Next..."
     * @var object
     */
    _menuItemNext : function(p, rf, value) {
        return new Ext4.menu.Item(Ext4.apply({}, p, {
            scope : this,
            handler : function() {
                rf.setValue(value + p.text);
            }
        }));
    },
    /**
     * Creates date picker or date range picker depending on renderer
     * @return Ext4.menu.Item
     */
    getDateMenu : function(p, rf, value, menuText) {
        var dateMenu = null;
        switch (p.renderer) {
            case 'picker':
                dateMenu = Ext4.create('Ext4.menu.Menu', {
                    plain : true,
                    listeners : {
                        close : function() {
                            this.hide();
                        }
                    },
                    items : [
                        Ext4.create('Ext4.picker.Date', {
                            listeners : {
                                beforerender : function() {
                                    if (rf._dateValue1 && (rf._dateOperator == menuText)) {
                                        //console.log('DateOperator: ' + rf._dateOperator);
                                        //console.log('Date1: ' + rf._dateValue1);
                                        var date = Date.parse(rf._dateValue1);
                                        var d = Ext4.Date.format(date, convertNSDateFormat());
                                        this.setValue(Date.parse(d));
                                    }
                                },
                                blur : function() {
                                    var d = new Date();
                                    this.setValue(d);
                                },
                                select : function(picker, date) {
                                    var d = Ext4.Date.format(date, convertNSDateFormat());
                                    rf.setValue((value ? value : '') + (p.value ? p.value : '') + d);
                                    dateMenu.fireEvent('close');
                                }
                            }
                        })
                    ]
                });
                break;
            case 'range':
                dateMenu = new Ext4.date.RangePicker({
                    listeners : {
                        beforerender : function() {
                            if (rf._dateValue1 && rf._dateValue2) {
                                var date1 = Date.parse(rf._dateValue1);
                                var d1 = Ext4.Date.format(date1, convertNSDateFormat());
                                var date2 = Date.parse(rf._dateValue2);
                                var d2 = Ext4.Date.format(date2, convertNSDateFormat());
                                //console.log('DateOperator: ' + rf._dateOperator);
                                //console.log('Date1: ' + rf._dateValue1);
                                //console.log('Date2: ' + rf._dateValue2);
                                this._pickerLeft.setValue(Date.parse(d1));
                                this._pickerRight.setValue(Date.parse(d2));
                            }
                        }
                    },
                    handler : function() {
                        if (this.getLeftDate() > this.getRightDate()) {
                            alert(translatedStrings.getText('MESSAGE.ERROR.START_DATE'));
                            return false;
                        }
                        var startDate = Ext4.Date.format(this.getLeftDate(), convertNSDateFormat());
                        var endDate = Ext4.Date.format(this.getRightDate(), convertNSDateFormat());
                        var d = startDate + ' ' + translatedStrings.getText('DATERANGE.TO') + ' ' + endDate;
                        rf.setValue((value ? value : '') + (p.value ? p.value : '') + d);
                        rf._menu.fireEvent('close', this);
                        return true;
                    }
                });
                break;
        }
        return dateMenu;
    },
    /**
     * Gets the current from date
     * @return Date|bool
     */
    getDateFrom : function() {
        return this._dateFrom;
    },
    /**
     * Gets the current to date
     * @return Date|bool
     */
    getDateTo : function() {
        return this._dateTo;
    },
    /**
     * Gets all available dates stored [deprecated, use getDateFrom() getDateTo()]
     * @return array
     */
    getDates : function() {
        var d = [];
        if (this.getDateFrom()) {
            d.push(this.getDateFrom());
        }
        if (this.getDateTo()) {
            d.push(this.getDateTo());
        }
        return d;
    },
    /**
     * Gets the internal menu for this triggerfield
     * @param bool reset
     * @return Ext4.menu.Menu
     */
    getMenu : function(reset) {
        if (this._menu === null || reset) {
            if (reset && this._menu) { // destroy previous menu
                this._menu.destroy();
            }
            //
            var mItems = [];
            Ext4.each(this.getMenuCategories(), function(v, i, a) { // add PTM menu
                mItems.push(this._menuItemCategories(v));
            }, this);
            
            var rf = this;
            var clear = new Ext4.menu.Item({
                hideOnClick : true,
                text : translatedStrings.getText('DATERANGE.CLEAR'),
                handler : function(){
                    rf.setValue('');
                }
            });
            mItems.push('-');
            mItems.push(clear);
            
            this._menu = new Ext4.menu.Menu({
                cls : 'ptm-datemenu-item-text',
                items : mItems,
                listeners : {
                    close : function(){
                        this.hide();
                    }
                }
            });
        }
        return this._menu;
    },
    /**
     * Gets the menu categories for this date range object.
     * Options: "On", "After", "On or before" and "Within"
     * @return Array
     */
    getMenuCategories : function() {
        //
        if (Ext4.isFunction(this.menucategories)) {
            this.menucategories = this.menucategories();
        }
        return this.menucategories;
    },
    /**
     * Gets the menu categories for this date range object.
     * Options: "On Today", "On Yesterday", "On Tomorrow" and "On mm/dd/yyyy"
     * @return Array
     */
    getMenuOn : function() {
        //
        if (Ext4.isFunction(this.menuOn)) {
            this.menuOn = this.menuOn();
        }
        return this.menuOn;
    },
    /**
     * Categories displayed under section "Within".
     * Options: "Within This...", "Within Last...", "Within Next..." and "Within mm/dd/yyyy to mm/dd/yyyy"
     * @var object
     */
    getMenuWithin : function() {
        //
        if (Ext4.isFunction(this.menuWithin)) {
            this.menuWithin = this.menuWithin();
        }
        return this.menuWithin;
    },
    /**
     * Categories displayed under section "On or Before" and "After".
     * Options: "On or Before/After Today", "On or Before/After Yesterday", "On or Before/After Tomorrow", "On or Before/After This...", "On or Before/After Last...", "On or Before/After Next...", and "On or Before/After mm/dd/yyyy"
     * @var object
     */
    getMenuOA : function() {
        //
        if (Ext4.isFunction(this.menuOA)) {
            this.menuOA = this.menuOA();
        }
        return this.menuOA;
    },
    /**
     * Reusable categories displayed under section "Within This", "On or Before This" and "After This".
     * Options: "... Month", "... Week", "... Fiscal Quarter" and "... Year"
     * @var object
     */
    getMenuThis : function() {
        //
        if (Ext4.isFunction(this.menuThis)) {
            this.menuThis = this.menuThis();
        }
        return this.menuThis;
    },
    /**
     * Reusable categories displayed under section "Within Last", "On or Before Last" and "After Last".
     * Options: "... Month", "... Week" and "... Fiscal Quarter"
     * @var object
     */
    getMenuLast : function() {
        //
        if (Ext4.isFunction(this.menuLast)) {
            this.menuLast = this.menuLast();
        }
        return this.menuLast;
    },
    /**
     * Reusable categories displayed under section "Within Next", "On or Before Next" and "After Next".
     * Options: "... One Month", "... Month", "... Fiscal Quarter" and "... Week"
     * @var object
     */
    getMenuNext : function() {
        //
        if (Ext4.isFunction(this.menuNext)) {
            this.menuNext = this.menuNext();
        }
        return this.menuNext;
    },
    /**
     * Clears the current dates and control value
     * Triggers beforeclear and clear events
     */
    clear : function() {
        // signal beforeclear event
        this.fireEvent('beforeclear', this, this.getDateFrom(), this.getDateTo());
        // clear the control
        this._clear();
        // signal clear event
        this.fireEvent('clear', this);
    },
    /**
     * Updates the internal dates for this date range field.
     * Triggers beforeset and set events
     * @return Ext4.date.RangeField
     */
    setDates : function(d) {
        var oFrom = this.getDateFrom(), oTo = this.getDateTo(), nFrom, nTo;
        // signal beforeset event
        this.fireEvent('beforeset', this, oFrom, oTo);
        // read user supplied date value(s)
        this._read(d);
        // update triggerfield value
        this._write();
        //
        nFrom = this.getDateFrom();
        nTo = this.getDateTo();
        // signal set event
        this.fireEvent('set', this, nFrom, nTo, (!this._compare(oFrom, nFrom) || !this._compare(oTo, nTo)));
        //
        return this;
    },
    /**
     * Override constructor to import value from configuration.
     * 
     * @scope public
     * @return void
     */
    constructor : function(c) {
        c = c || {};
        //
        this.addEvents({
            'beforeclear' : true,
            'beforeset' : true,
            'clear' : true,
            'set' : true
        });
        //
        Ext4.date.RangeField.superclass.constructor.call(Ext4.apply(this, c, Ext4.date.RangeField.defaults), c);
    },
    /**
     * Override to implement special ui features for this component
     * 
     * @scope public
     * @return void
     */
    initComponent : function() {
        // listen for handler if we have one
        this.addListener('set', function(rf, from, to, changed) {
            if (Ext4.isFunction(this.handler)) {
                this.handler(rf, from, to, changed);
            }
        }, this);
        // prevent events from being triggered
        this.suspendEvents();
        // import initial value applied
        this.setDates(this.value);
        // resume events monitoring
        this.resumeEvents();
        //
        Ext4.date.RangeField.superclass.initComponent.call(this);
    },
    /**
     * Handles trigger clicking
     * 
     * @scope public
     * @return void
     */
    onTriggerClick : function(e) {
        // bail if disabled
        if (this.disabled) { return; }
        // trigger our date menu. This will rebuild each time the trigger btn is clicked
        this.getDateValue();
        this.getMenu(true).showAt(e.getXY());
    },
    /* Gets date value if applicable. */
    getDateValue : function() {
        var value = this.getRawValue();
        var dateFormat = convertNSDateFormat();
        this._dateValue1 = null;
        this._dateValue2 = null;
        if (value) {
            var isDate = true;
            if ((value.search(translatedStrings.getText('DATERANGE.TODAY')) != -1) || (value.search(translatedStrings.getText('DATERANGE.YESTERDAY')) != -1) || (value.search(translatedStrings.getText('DATERANGE.TOMORROW')) != -1) || (value.search(translatedStrings.getText('DATERANGE.THIS_WEEK')) != -1) || (value.search(translatedStrings.getText('DATERANGE.THIS_MONTH')) != -1) || (value.search(translatedStrings.getText('DATERANGE.THIS_YEAR')) != -1) || (value.search(translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER')) != -1) || (value.search(translatedStrings.getText('DATERANGE.LAST_WEEK')) != -1) || (value.search(translatedStrings.getText('DATERANGE.LAST_MONTH')) != -1) || (value.search(translatedStrings.getText('DATERANGE.LAST_FISCAL_QUARTER')) != -1) || (value.search(translatedStrings.getText('DATERANGE.NEXT_WEEK')) != -1) || (value.search(translatedStrings.getText('DATERANGE.NEXT_ONE_MONTH')) != -1) || (value.search(translatedStrings.getText('DATERANGE.NEXT_MONTH')) != -1) || (value.search(translatedStrings.getText('DATERANGE.NEXT_FISCAL_QUARTER')) != -1)) isDate = false;
            if (isDate) {
                if (value.search(translatedStrings.getText('DATERANGE.WITHIN')) != -1) {
                    if (dateFormat == 'j F, Y') {
                        var result = value.split(" ");
                        this._dateValue1 = result[1] + ' ' + result[2] + ' ' + result[3]; //first date
                        this._dateValue2 = result[5] + ' ' + result[6] + ' ' + result[7]; //second date
                    } else {
                        var result = value.split(" ");
                        this._dateValue1 = result[1]; //first date
                        this._dateValue2 = result[3]; //second date
                    }
                } else if (value.search(translatedStrings.getText('DATERANGE.ON_OR_BEFORE')) != -1) {
                    if (dateFormat == 'j F, Y') {
                        var result = value.split(" ");
                        this._dateValue1 = result[3] + ' ' + result[4] + ' ' + result[5]; //first date
                    } else {
                        var result = value.split(" ");
                        this._dateValue1 = result[3]; //first date
                    }
                } else {
                    if (dateFormat == 'j F, Y') {
                        var result = value.split(" ");
                        this._dateValue1 = result[1] + ' ' + result[2] + ' ' + result[3]; //specific date
                    } else {
                        var result = value.split(" ");
                        this._dateValue1 = result[1]; //specific date
                    }
                }
                if (value.search(translatedStrings.getText('DATERANGE.ON_OR_BEFORE')) != -1) {
                    this._dateOperator = translatedStrings.getText('DATERANGE.ON_OR_BEFORE');
                } else if (value.search(translatedStrings.getText('DATERANGE.AFTER')) != -1) {
                    this._dateOperator = translatedStrings.getText('DATERANGE.AFTER');
                } else if (value.search(translatedStrings.getText('DATERANGE.WITHIN')) != -1) {
                    this._dateOperator = null;
                } else {
                    this._dateOperator = translatedStrings.getText('DATERANGE.ON');
                }
            }
        }
    }
});
/**
 * Strings which are used in Range Field
 */
Ext4.date.RangeField.strings = {
    strOnMenu : translatedStrings.getText('DATERANGE.ON'),
    strWithinMenu : translatedStrings.getText('DATERANGE.WITHIN'),
    strOnOrBeforeMenu : translatedStrings.getText('DATERANGE.ON_OR_BEFORE'),
    strAfterMenu : translatedStrings.getText('DATERANGE.AFTER'),
    strToday : translatedStrings.getText('DATERANGE.TODAY'),
    strYesterday : translatedStrings.getText('DATERANGE.YESTERDAY'),
    strTomorrow : translatedStrings.getText('DATERANGE.TOMORROW'),
    strSpecificDate : translatedStrings.getText('DATERANGE.SPECIFIC_DATE'),
    strCustomRange : translatedStrings.getText('DATERANGE.CUSTOM_DATE_RANGE'),
    strMonth : translatedStrings.getText('DATERANGE.MONTH'),
    strOneMonth : translatedStrings.getText('DATERANGE.ONE_MONTH'),
    strWeek : translatedStrings.getText('DATERANGE.WEEK'),
    strYear : translatedStrings.getText('DATERANGE.YEAR'),
    strFiscalQuarter : translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER'),
    strThisMenu : translatedStrings.getText('DATERANGE.THIS'),
    strLastMenu : translatedStrings.getText('DATERANGE.LAST'),
    strNextMenu : translatedStrings.getText('DATERANGE.NEXT'),
    strOn : translatedStrings.getText('DATERANGE.ON') + ' ',
    strWithin : translatedStrings.getText('DATERANGE.WITHIN') + ' ',
    strThisWeek : translatedStrings.getText('DATERANGE.THIS_WEEK'),
    strThisMonth : translatedStrings.getText('DATERANGE.THIS_MONTH'),
    strThisYear : translatedStrings.getText('DATERANGE.THIS_YEAR'),
    strThisFiscalQuarter : translatedStrings.getText('DATERANGE.THIS_FISCAL_QUARTER'),
    strNextWeek : translatedStrings.getText('DATERANGE.NEXT_WEEK'),
    strNextMonth : translatedStrings.getText('DATERANGE.NEXT_MONTH'),
    strNextOneMonth : translatedStrings.getText('DATERANGE.NEXT_ONE_MONTH'),
    strNextYear : translatedStrings.getText('DATERANGE.NEXT_YEAR'),
    strNextFiscalQuarter : translatedStrings.getText('DATERANGE.NEXT_FISCAL_QUARTER'),
    strLastWeek : translatedStrings.getText('DATERANGE.LAST_WEEK'),
    strLastMonth : translatedStrings.getText('DATERANGE.LAST_MONTH'),
    strLastYear : translatedStrings.getText('DATERANGE.LAST_YEAR'),
    strLastFiscalQuarter : translatedStrings.getText('DATERANGE.LAST_FISCAL_QUARTER')
};
/**
 * Defines the default options for the RageField
 */
Ext4.date.RangeField.defaults = {
    /**
     * Storage for handler
     * @var function(rangeField,startDate,endDate)
     */
    handler : null,
    /**
     * Delimiter used to split range string
     * @var string
     */
    delimiter : ' to ',
    /**
     * Date format to use
     * @var string
     */
    format : 'm-d-Y',
    /**
     * Categories displayed in menu.
     * Options: "On", "After", "On or before" and "Within"
     * @var object
     */
    menucategories : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strOnMenu
            }, {
                text : Ext4.date.RangeField.strings.strWithinMenu
            }, {
                text : Ext4.date.RangeField.strings.strOnOrBeforeMenu
            }, {
                text : Ext4.date.RangeField.strings.strAfterMenu
            }
        ];
    },
    /**
     * Categories displayed under section "On".
     * Options: "On Today", "On Yesterday", "On Tomorrow" and "On mm/dd/yyyy"
     * @var object
     */
    menuOn : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strToday,
                value : Ext4.date.RangeField.strings.strToday
            }, {
                text : Ext4.date.RangeField.strings.strYesterday,
                value : Ext4.date.RangeField.strings.strYesterday
            }, {
                text : Ext4.date.RangeField.strings.strTomorrow,
                value : Ext4.date.RangeField.strings.strTomorrow
            }, {
                xtype : 'menuseparator'
            }, {
                text : Ext4.date.RangeField.strings.strSpecificDate,
                value : Ext4.date.RangeField.strings.strOn,
                renderer : 'picker'
            }
        ];
    },
    /**
     * Categories displayed under section "Within".
     * Options: "Within This...", "Within Last...", "Within Next..." and "Within mm/dd/yyyy to mm/dd/yyyy"
     * @var object
     */
    menuWithin : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strThisMenu,
                value : Ext4.date.RangeField.strings.strWithin
            }, {
                text : Ext4.date.RangeField.strings.strLastMenu,
                value : Ext4.date.RangeField.strings.strWithin
            }, {
                text : Ext4.date.RangeField.strings.strNextMenu,
                value : Ext4.date.RangeField.strings.strWithin
            }, {
                xtype : 'menuseparator'
            }, {
                text : Ext4.date.RangeField.strings.strCustomRange,
                value : Ext4.date.RangeField.strings.strWithin,
                renderer : 'range'
            }
        ];
    },
    /**
     * Categories displayed under section "On or Before" and "After".
     * Options: "On or Before/After Today", "On or Before/After Yesterday", "On or Before/After Tomorrow", "On or Before/After This...", "On or Before/After Last...", "On or Before/After Next...", and "On or Before/After mm/dd/yyyy"
     * @var object
     */
    menuOA : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strToday,
                value : Ext4.date.RangeField.strings.strToday
            }, {
                text : Ext4.date.RangeField.strings.strYesterday,
                value : Ext4.date.RangeField.strings.strYesterday
            }, {
                text : Ext4.date.RangeField.strings.strTomorrow,
                value : Ext4.date.RangeField.strings.strTomorrow
            }, {
                text : Ext4.date.RangeField.strings.strThisMenu,
                value : Ext4.date.RangeField.strings.strThis
            }, {
                text : Ext4.date.RangeField.strings.strLastMenu,
                value : Ext4.date.RangeField.strings.strLast
            }, {
                text : Ext4.date.RangeField.strings.strNextMenu,
                value : Ext4.date.RangeField.strings.strNext
            }, {
                xtype : 'menuseparator'
            }, {
                text : Ext4.date.RangeField.strings.strSpecificDate,
                renderer : 'picker'
            }
        ];
    },
    /**
     * Reusable categories displayed under section "Within This", "On or Before This" and "After This".
     * Options: "... Month", "... Week", "... Fiscal Quarter" and "... Year"
     * @var object
     */
    menuThis : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strThisMonth,
                value : Ext4.date.RangeField.strings.strThisMonth
            }, {
                text : Ext4.date.RangeField.strings.strThisWeek,
                value : Ext4.date.RangeField.strings.strThisWeek
            }, {
                text : Ext4.date.RangeField.strings.strThisFiscalQuarter,
                value : Ext4.date.RangeField.strings.strThisFiscalQuarter
            }, {
                text : Ext4.date.RangeField.strings.strThisYear,
                value : Ext4.date.RangeField.strings.strThisYear
            }
        ];
    },
    /**
     * Reusable categories displayed under section "Within Last", "On or Before Last" and "After Last".
     * Options: "... Month", "... Week", and "... Fiscal Quarter"
     * @var object
     */
    menuLast : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strLastMonth,
                value : Ext4.date.RangeField.strings.strLastMonth
            }, {
                text : Ext4.date.RangeField.strings.strLastWeek,
                value : Ext4.date.RangeField.strings.strLastWeek
            }, {
                text : Ext4.date.RangeField.strings.strLastFiscalQuarter,
                value : Ext4.date.RangeField.strings.strLastFiscalQuarter
            }
        ];
    },
    /**
     * Reusable categories displayed under section "Within Next", "On or Before Next" and "After Next".
     * Options: "... One Month", "... Month", "... Fiscal Quarter", and "... Week"
     * @var object
     */
    menuNext : function() {
        return [
            {
                text : Ext4.date.RangeField.strings.strNextOneMonth,
                value : Ext4.date.RangeField.strings.strNextOneMonth
            }, {
                text : Ext4.date.RangeField.strings.strNextMonth,
                value : Ext4.date.RangeField.strings.strNextMonth
            }, {
                text : Ext4.date.RangeField.strings.strNextFiscalQuarter,
                value : Ext4.date.RangeField.strings.strNextFiscalQuarter
            }, {
                text : Ext4.date.RangeField.strings.strNextWeek,
                value : Ext4.date.RangeField.strings.strNextWeek
            }
        ];
    }
};
/**
 * Defines keywords to use for quick transformations. Can/should be extended to
 * implement application requirements
 */
Ext4.date.RangeField.keywords = Ext4.date.RangeField.keywords || {
    'bot' : function() {
        return new Date(1000);
    },
    'eot' : function() {
        return (new Date()).format('m-d-Y');
    } // today by default
};
// Hack for DateJS and ExtJS to live in harmony
Date.prototype.extAdd = Date.prototype.add;
/**
 * Version: 1.0 Alpha-1 Build Date: 13-Nov-2007 Copyright (c) 2006-2007, Coolite
 * Inc. (http://www.coolite.com/). All rights reserved. License: Licensed under
 * The MIT License. See license.txt and http://www.datejs.com/license/. Website:
 * http://www.datejs.com/ or http://www.coolite.com/datejs/
 */
Date.getMonthNumberFromName = function(name) {
    var n = Date.CultureInfo.monthNames, m = Date.CultureInfo.abbreviatedMonthNames, s = name.toLowerCase();
    for ( var i = 0; i < n.length; i++) {
        if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) { return i; }
    }
    return -1;
};
Date.getDayNumberFromName = function(name) {
    var n = Date.CultureInfo.dayNames, m = Date.CultureInfo.abbreviatedDayNames, o = Date.CultureInfo.shortestDayNames, s = name.toLowerCase();
    for ( var i = 0; i < n.length; i++) {
        if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) { return i; }
    }
    return -1;
};
Date.isLeapYear = function(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};
Date.getDaysInMonth = function(year, month) {
    return [
        31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ][month];
};
Date.getTimezoneOffset = function(s, dst) {
    return (dst || false) ? Date.CultureInfo.abbreviatedTimeZoneDST[s.toUpperCase()] : Date.CultureInfo.abbreviatedTimeZoneStandard[s.toUpperCase()];
};
Date.getTimezoneAbbreviation = function(offset, dst) {
    var n = (dst || false) ? Date.CultureInfo.abbreviatedTimeZoneDST : Date.CultureInfo.abbreviatedTimeZoneStandard, p;
    for (p in n) {
        if (n[p] === offset) { return p; }
    }
    return null;
};
Date.prototype.clone = function() {
    return new Date(this.getTime());
};
Date.prototype.compareTo = function(date) {
    if (isNaN(this)) { throw new Error(this); }
    if (date instanceof Date && !isNaN(date)) {
        return (this > date) ? 1 : (this < date) ? -1 : 0;
    } else {
        throw new TypeError(date);
    }
};
Date.prototype.equals = function(date) {
    return (this.compareTo(date) === 0);
};
Date.prototype.between = function(start, end) {
    var t = this.getTime();
    return t >= start.getTime() && t <= end.getTime();
};
Date.prototype.addMilliseconds = function(value) {
    this.setMilliseconds(this.getMilliseconds() + value);
    return this;
};
Date.prototype.addSeconds = function(value) {
    return this.addMilliseconds(value * 1000);
};
Date.prototype.addMinutes = function(value) {
    return this.addMilliseconds(value * 60000);
};
Date.prototype.addHours = function(value) {
    return this.addMilliseconds(value * 3600000);
};
Date.prototype.addDays = function(value) {
    return this.addMilliseconds(value * 86400000);
};
Date.prototype.addWeeks = function(value) {
    return this.addMilliseconds(value * 604800000);
};
Date.prototype.addMonths = function(value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};
Date.prototype.addYears = function(value) {
    return this.addMonths(value * 12);
};
Date.prototype.add = function(config) {
    if (typeof config == "number") {
        this._orient = config;
        return this;
    }
    var x = config;
    if (x.millisecond || x.milliseconds) {
        this.addMilliseconds(x.millisecond || x.milliseconds);
    }
    if (x.second || x.seconds) {
        this.addSeconds(x.second || x.seconds);
    }
    if (x.minute || x.minutes) {
        this.addMinutes(x.minute || x.minutes);
    }
    if (x.hour || x.hours) {
        this.addHours(x.hour || x.hours);
    }
    if (x.month || x.months) {
        this.addMonths(x.month || x.months);
    }
    if (x.year || x.years) {
        this.addYears(x.year || x.years);
    }
    if (x.day || x.days) {
        this.addDays(x.day || x.days);
    }
    return this;
};
Date._validate = function(value, min, max, name) {
    if (typeof value != "number") {
        throw new TypeError(value + " is not a Number.");
    } else if (value < min || value > max) { throw new RangeError(value + " is not a valid value for " + name + "."); }
    return true;
};
Date.validateMillisecond = function(n) {
    return Date._validate(n, 0, 999, "milliseconds");
};
Date.validateSecond = function(n) {
    return Date._validate(n, 0, 59, "seconds");
};
Date.validateMinute = function(n) {
    return Date._validate(n, 0, 59, "minutes");
};
Date.validateHour = function(n) {
    return Date._validate(n, 0, 23, "hours");
};
Date.validateDay = function(n, year, month) {
    return Date._validate(n, 1, Date.getDaysInMonth(year, month), "days");
};
Date.validateMonth = function(n) {
    return Date._validate(n, 0, 11, "months");
};
Date.validateYear = function(n) {
    return Date._validate(n, 1, 9999, "seconds");
};
Date.prototype.set = function(config) {
    var x = config;
    if (!x.millisecond && x.millisecond !== 0) {
        x.millisecond = -1;
    }
    if (!x.second && x.second !== 0) {
        x.second = -1;
    }
    if (!x.minute && x.minute !== 0) {
        x.minute = -1;
    }
    if (!x.hour && x.hour !== 0) {
        x.hour = -1;
    }
    if (!x.day && x.day !== 0) {
        x.day = -1;
    }
    if (!x.month && x.month !== 0) {
        x.month = -1;
    }
    if (!x.year && x.year !== 0) {
        x.year = -1;
    }
    if (x.millisecond != -1 && Date.validateMillisecond(x.millisecond)) {
        this.addMilliseconds(x.millisecond - this.getMilliseconds());
    }
    if (x.second != -1 && Date.validateSecond(x.second)) {
        this.addSeconds(x.second - this.getSeconds());
    }
    if (x.minute != -1 && Date.validateMinute(x.minute)) {
        this.addMinutes(x.minute - this.getMinutes());
    }
    if (x.hour != -1 && Date.validateHour(x.hour)) {
        this.addHours(x.hour - this.getHours());
    }
    if (x.month !== -1 && Date.validateMonth(x.month)) {
        this.addMonths(x.month - this.getMonth());
    }
    if (x.year != -1 && Date.validateYear(x.year)) {
        this.addYears(x.year - this.getFullYear());
    }
    if (x.day != -1 && Date.validateDay(x.day, this.getFullYear(), this.getMonth())) {
        this.addDays(x.day - this.getDate());
    }
    if (x.timezone) {
        this.setTimezone(x.timezone);
    }
    if (x.timezoneOffset) {
        this.setTimezoneOffset(x.timezoneOffset);
    }
    return this;
};
Date.prototype.clearTime = function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};
Date.prototype.isLeapYear = function() {
    var y = this.getFullYear();
    return (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0));
};
Date.prototype.isWeekday = function() {
    return !(this.is().sat() || this.is().sun());
};
Date.prototype.getDaysInMonth = function() {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};
Date.prototype.moveToFirstDayOfMonth = function() {
    return this.set({
        day : 1
    });
};
Date.prototype.moveToLastDayOfMonth = function() {
    return this.set({
        day : this.getDaysInMonth()
    });
};
Date.prototype.moveToDayOfWeek = function(day, orient) {
    var diff = (day - this.getDay() + 7 * (orient || +1)) % 7;
    return this.addDays((diff === 0) ? diff += 7 * (orient || +1) : diff);
};
Date.prototype.moveToMonth = function(month, orient) {
    var diff = (month - this.getMonth() + 12 * (orient || +1)) % 12;
    return this.addMonths((diff === 0) ? diff += 12 * (orient || +1) : diff);
};
Date.prototype.getDayOfYear = function() {
    return Math.floor((this - new Date(this.getFullYear(), 0, 1)) / 86400000);
};
Date.prototype.getWeekOfYear = function(firstDayOfWeek) {
    var y = this.getFullYear(), m = this.getMonth(), d = this.getDate();
    var dow = firstDayOfWeek || Date.CultureInfo.firstDayOfWeek;
    var offset = 7 + 1 - new Date(y, 0, 1).getDay();
    if (offset == 8) {
        offset = 1;
    }
    var daynum = ((Date.UTC(y, m, d, 0, 0, 0) - Date.UTC(y, 0, 1, 0, 0, 0)) / 86400000) + 1;
    var w = Math.floor((daynum - offset + 7) / 7);
    if (w === dow) {
        y--;
        var prevOffset = 7 + 1 - new Date(y, 0, 1).getDay();
        if (prevOffset == 2 || prevOffset == 8) {
            w = 53;
        } else {
            w = 52;
        }
    }
    return w;
};
Date.prototype.isDST = function() {
    console.log('isDST');
    return this.toString().match(/(E|C|M|P)(S|D)T/)[2] == "D";
};
Date.prototype.getTimezone = function() {
    return Date.getTimezoneAbbreviation(this.getUTCOffset, this.isDST());
};
Date.prototype.setTimezoneOffset = function(s) {
    var here = this.getTimezoneOffset(), there = Number(s) * -6 / 10;
    this.addMinutes(there - here);
    return this;
};
Date.prototype.setTimezone = function(s) {
    return this.setTimezoneOffset(Date.getTimezoneOffset(s));
};
Date.prototype.getUTCOffset = function() {
    var n = this.getTimezoneOffset() * -10 / 6, r;
    if (n < 0) {
        r = (n - 10000).toString();
        return r[0] + r.substr(2);
    } else {
        r = (n + 10000).toString();
        return "+" + r.substr(1);
    }
};
Date.prototype.getDayName = function(abbrev) {
    return abbrev ? Date.CultureInfo.abbreviatedDayNames[this.getDay()] : Date.CultureInfo.dayNames[this.getDay()];
};
Date.prototype.getMonthName = function(abbrev) {
    return abbrev ? Date.CultureInfo.abbreviatedMonthNames[this.getMonth()] : Date.CultureInfo.monthNames[this.getMonth()];
};
Date.prototype._toString = Date.prototype.toString;
Date.prototype.toString = function(format) {
    var self = this;
    var p = function p(s) {
        return (s.toString().length == 1) ? "0" + s : s;
    };
    return format ? format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g, function(format) {
        switch (format) {
            case "hh":
                return p(self.getHours() < 13 ? self.getHours() : (self.getHours() - 12));
            case "h":
                return self.getHours() < 13 ? self.getHours() : (self.getHours() - 12);
            case "HH":
                return p(self.getHours());
            case "H":
                return self.getHours();
            case "mm":
                return p(self.getMinutes());
            case "m":
                return self.getMinutes();
            case "ss":
                return p(self.getSeconds());
            case "s":
                return self.getSeconds();
            case "yyyy":
                return self.getFullYear();
            case "yy":
                return self.getFullYear().toString().substring(2, 4);
            case "dddd":
                return self.getDayName();
            case "ddd":
                return self.getDayName(true);
            case "dd":
                return p(self.getDate());
            case "d":
                return self.getDate().toString();
            case "MMMM":
                return self.getMonthName();
            case "MMM":
                return self.getMonthName(true);
            case "MM":
                return p((self.getMonth() + 1));
            case "M":
                return self.getMonth() + 1;
            case "t":
                return self.getHours() < 12 ? Date.CultureInfo.amDesignator.substring(0, 1) : Date.CultureInfo.pmDesignator.substring(0, 1);
            case "tt":
                return self.getHours() < 12 ? Date.CultureInfo.amDesignator : Date.CultureInfo.pmDesignator;
            case "zzz":
            case "zz":
            case "z":
                return "";
        }
    }) : this._toString();
};
Date.now = function() {
    return new Date();
};
Date.today = function() {
    return Date.now().clearTime();
};
Date.prototype._orient = +1;
Date.prototype.next = function() {
    this._orient = +1;
    return this;
};
Date.prototype.last = Date.prototype.prev = Date.prototype.previous = function() {
    this._orient = -1;
    return this;
};
Date.prototype._is = false;
Date.prototype.is = function() {
    this._is = true;
    return this;
};
Number.prototype._dateElement = "day";
Number.prototype.fromNow = function() {
    var c = {};
    c[this._dateElement] = this;
    return Date.now().add(c);
};
Number.prototype.ago = function() {
    var c = {};
    c[this._dateElement] = this * -1;
    return Date.now().add(c);
};
(function() {
    var $D = Date.prototype, $N = Number.prototype;
    var dx = ("sunday monday tuesday wednesday thursday friday saturday").split(/\s/), mx = ("january february march april may june july august september october november december").split(/\s/), px = ("Millisecond Second Minute Hour Day Week Month Year").split(/\s/), de;
    var df = function(n) {
        return function() {
            if (this._is) {
                this._is = false;
                return this.getDay() == n;
            }
            return this.moveToDayOfWeek(n, this._orient);
        };
    };
    for ( var i = 0; i < dx.length; i++) {
        $D[dx[i]] = $D[dx[i].substring(0, 3)] = df(i);
    }
    var mf = function(n) {
        return function() {
            if (this._is) {
                this._is = false;
                return this.getMonth() === n;
            }
            return this.moveToMonth(n, this._orient);
        };
    };
    for ( var j = 0; j < mx.length; j++) {
        $D[mx[j]] = $D[mx[j].substring(0, 3)] = mf(j);
    }
    var ef = function(j) {
        return function() {
            if (j.substring(j.length - 1) != "s") {
                j += "s";
            }
            return this["add" + j](this._orient);
        };
    };
    var nf = function(n) {
        return function() {
            this._dateElement = n;
            return this;
        };
    };
    for ( var k = 0; k < px.length; k++) {
        de = px[k].toLowerCase();
        $D[de] = $D[de + "s"] = ef(px[k]);
        $N[de] = $N[de + "s"] = nf(de);
    }
}());
Date.prototype.toJSONString = function() {
    return this.toString("yyyy-MM-ddThh:mm:ssZ");
};
Date.prototype.toShortDateString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.shortDatePattern);
};
Date.prototype.toLongDateString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.longDatePattern);
};
Date.prototype.toShortTimeString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.shortTimePattern);
};
Date.prototype.toLongTimeString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.longTimePattern);
};
Date.prototype.getOrdinal = function() {
    switch (this.getDate()) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
    }
};
(function() {
    Date.Parsing = {
        Exception : function(s) {
            this.message = "Parse error at '" + s.substring(0, 10) + " ...'";
        }
    };
    var $P = Date.Parsing;
    var _ = $P.Operators = {
        rtoken : function(r) {
            return function(s) {
                var mx = s.match(r);
                if (mx) {
                    return ([
                        mx[0], s.substring(mx[0].length)
                    ]);
                } else {
                    throw new $P.Exception(s);
                }
            };
        },
        token : function(s) {
            return function(s) {
                return _.rtoken(new RegExp("^\s*" + s + "\s*"))(s);
            };
        },
        stoken : function(s) {
            return _.rtoken(new RegExp("^" + s));
        },
        until : function(p) {
            return function(s) {
                var qx = [], rx = null;
                while (s.length) {
                    try {
                        rx = p.call(this, s);
                    } catch (e) {
                        qx.push(rx[0]);
                        s = rx[1];
                        continue;
                    }
                    break;
                }
                return [
                    qx, s
                ];
            };
        },
        many : function(p) {
            return function(s) {
                var rx = [], r = null;
                while (s.length) {
                    try {
                        r = p.call(this, s);
                    } catch (e) {
                        return [
                            rx, s
                        ];
                    }
                    rx.push(r[0]);
                    s = r[1];
                }
                return [
                    rx, s
                ];
            };
        },
        optional : function(p) {
            return function(s) {
                var r = null;
                try {
                    r = p.call(this, s);
                } catch (e) {
                    return [
                        null, s
                    ];
                }
                return [
                    r[0], r[1]
                ];
            };
        },
        not : function(p) {
            return function(s) {
                try {
                    p.call(this, s);
                } catch (e) {
                    return [
                        null, s
                    ];
                }
                throw new $P.Exception(s);
            };
        },
        ignore : function(p) {
            return p ? function(s) {
                var r = null;
                r = p.call(this, s);
                return [
                    null, r[1]
                ];
            } : null;
        },
        product : function() {
            var px = arguments[0], qx = Array.prototype.slice.call(arguments, 1), rx = [];
            for ( var i = 0; i < px.length; i++) {
                rx.push(_.each(px[i], qx));
            }
            return rx;
        },
        cache : function(rule) {
            var cache = {}, r = null;
            return function(s) {
                try {
                    r = cache[s] = (cache[s] || rule.call(this, s));
                } catch (e) {
                    r = cache[s] = e;
                }
                if (r instanceof $P.Exception) {
                    throw r;
                } else {
                    return r;
                }
            };
        },
        any : function() {
            var px = arguments;
            return function(s) {
                var r = null;
                for ( var i = 0; i < px.length; i++) {
                    if (px[i] == null) {
                        continue;
                    }
                    try {
                        r = (px[i].call(this, s));
                    } catch (e) {
                        r = null;
                    }
                    if (r) { return r; }
                }
                throw new $P.Exception(s);
            };
        },
        each : function() {
            var px = arguments;
            return function(s) {
                var rx = [], r = null;
                for ( var i = 0; i < px.length; i++) {
                    if (px[i] == null) {
                        continue;
                    }
                    try {
                        r = (px[i].call(this, s));
                    } catch (e) {
                        throw new $P.Exception(s);
                    }
                    rx.push(r[0]);
                    s = r[1];
                }
                return [
                    rx, s
                ];
            };
        },
        all : function() {
            var px = arguments, _ = _;
            return _.each(_.optional(px));
        },
        sequence : function(px, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            if (px.length == 1) { return px[0]; }
            return function(s) {
                var r = null, q = null;
                var rx = [];
                for ( var i = 0; i < px.length; i++) {
                    try {
                        r = px[i].call(this, s);
                    } catch (e) {
                        break;
                    }
                    rx.push(r[0]);
                    try {
                        q = d.call(this, r[1]);
                    } catch (ex) {
                        q = null;
                        break;
                    }
                    s = q[1];
                }
                if (!r) { throw new $P.Exception(s); }
                if (q) { throw new $P.Exception(q[1]); }
                if (c) {
                    try {
                        r = c.call(this, r[1]);
                    } catch (ey) {
                        throw new $P.Exception(r[1]);
                    }
                }
                return [
                    rx, (r ? r[1] : s)
                ];
            };
        },
        between : function(d1, p, d2) {
            d2 = d2 || d1;
            var _fn = _.each(_.ignore(d1), p, _.ignore(d2));
            return function(s) {
                var rx = _fn.call(this, s);
                return [
                    [
                        rx[0][0], r[0][2]
                    ], rx[1]
                ];
            };
        },
        list : function(p, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            return (p instanceof Array ? _.each(_.product(p.slice(0, -1), _.ignore(d)), p.slice(-1), _.ignore(c)) : _.each(_.many(_.each(p, _.ignore(d))), px, _.ignore(c)));
        },
        set : function(px, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            return function(s) {
                var r = null, p = null, q = null, rx = null, best = [
                    [], s
                ], last = false;
                for ( var i = 0; i < px.length; i++) {
                    q = null;
                    p = null;
                    r = null;
                    last = (px.length == 1);
                    try {
                        r = px[i].call(this, s);
                    } catch (e) {
                        continue;
                    }
                    rx = [
                        [
                            r[0]
                        ], r[1]
                    ];
                    if (r[1].length > 0 && !last) {
                        try {
                            q = d.call(this, r[1]);
                        } catch (ex) {
                            last = true;
                        }
                    } else {
                        last = true;
                    }
                    if (!last && q[1].length === 0) {
                        last = true;
                    }
                    if (!last) {
                        var qx = [];
                        for ( var j = 0; j < px.length; j++) {
                            if (i != j) {
                                qx.push(px[j]);
                            }
                        }
                        p = _.set(qx, d).call(this, q[1]);
                        if (p[0].length > 0) {
                            rx[0] = rx[0].concat(p[0]);
                            rx[1] = p[1];
                        }
                    }
                    if (rx[1].length < best[1].length) {
                        best = rx;
                    }
                    if (best[1].length === 0) {
                        break;
                    }
                }
                if (best[0].length === 0) { return best; }
                if (c) {
                    try {
                        q = c.call(this, best[1]);
                    } catch (ey) {
                        throw new $P.Exception(best[1]);
                    }
                    best[1] = q[1];
                }
                return best;
            };
        },
        forward : function(gr, fname) {
            return function(s) {
                return gr[fname].call(this, s);
            };
        },
        replace : function(rule, repl) {
            return function(s) {
                var r = rule.call(this, s);
                return [
                    repl, r[1]
                ];
            };
        },
        process : function(rule, fn) {
            return function(s) {
                var r = rule.call(this, s);
                return [
                    fn.call(this, r[0]), r[1]
                ];
            };
        },
        min : function(min, rule) {
            return function(s) {
                var rx = rule.call(this, s);
                if (rx[0].length < min) { throw new $P.Exception(s); }
                return rx;
            };
        }
    };
    var _generator = function(op) {
        return function() {
            var args = null, rx = [];
            if (arguments.length > 1) {
                args = Array.prototype.slice.call(arguments);
            } else if (arguments[0] instanceof Array) {
                args = arguments[0];
            }
            if (args) {
                for ( var i = 0, px = args.shift(); i < px.length; i++) {
                    args.unshift(px[i]);
                    rx.push(op.apply(null, args));
                    args.shift();
                    return rx;
                }
            } else {
                return op.apply(null, arguments);
            }
        };
    };
    var gx = "optional not ignore cache".split(/\s/);
    for ( var i = 0; i < gx.length; i++) {
        _[gx[i]] = _generator(_[gx[i]]);
    }
    var _vector = function(op) {
        return function() {
            if (arguments[0] instanceof Array) {
                return op.apply(null, arguments[0]);
            } else {
                return op.apply(null, arguments);
            }
        };
    };
    var vx = "each any all".split(/\s/);
    for ( var j = 0; j < vx.length; j++) {
        _[vx[j]] = _vector(_[vx[j]]);
    }
}());
(function() {
    var flattenAndCompact = function(ax) {
        var rx = [];
        for ( var i = 0; i < ax.length; i++) {
            if (ax[i] instanceof Array) {
                rx = rx.concat(flattenAndCompact(ax[i]));
            } else {
                if (ax[i]) {
                    rx.push(ax[i]);
                }
            }
        }
        return rx;
    };
    Date.Grammar = {};
    Date.Translator = {
        hour : function(s) {
            return function() {
                this.hour = Number(s);
            };
        },
        minute : function(s) {
            return function() {
                this.minute = Number(s);
            };
        },
        second : function(s) {
            return function() {
                this.second = Number(s);
            };
        },
        meridian : function(s) {
            return function() {
                this.meridian = s.slice(0, 1).toLowerCase();
            };
        },
        timezone : function(s) {
            return function() {
                var n = s.replace(/[^\d\+\-]/g, "");
                if (n.length) {
                    this.timezoneOffset = Number(n);
                } else {
                    this.timezone = s.toLowerCase();
                }
            };
        },
        day : function(x) {
            var s = x[0];
            return function() {
                this.day = Number(s.match(/\d+/)[0]);
            };
        },
        month : function(s) {
            return function() {
                this.month = ((s.length == 3) ? Date.getMonthNumberFromName(s) : (Number(s) - 1));
            };
        },
        year : function(s) {
            return function() {
                var n = Number(s);
                this.year = ((s.length > 2) ? n : (n + (((n + 2000) < Date.CultureInfo.twoDigitYearMax) ? 2000 : 1900)));
            };
        },
        rday : function(s) {
            return function() {
                switch (s) {
                    case "yesterday":
                        this.days = -1;
                        break;
                    case "tomorrow":
                        this.days = 1;
                        break;
                    case "today":
                        this.days = 0;
                        break;
                    case "now":
                        this.days = 0;
                        this.now = true;
                        break;
                }
            };
        },
        finishExact : function(x) {
            x = (x instanceof Array) ? x : [
                x
            ];
            var now = new Date();
            this.year = now.getFullYear();
            this.month = now.getMonth();
            this.day = 1;
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
            for ( var i = 0; i < x.length; i++) {
                if (x[i]) {
                    x[i].call(this);
                }
            }
            this.hour = (this.meridian == "p" && this.hour < 13) ? this.hour + 12 : this.hour;
            if (this.day > Date.getDaysInMonth(this.year, this.month)) { throw new RangeError(this.day + " is not a valid value for days."); }
            var r = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
            if (this.timezone) {
                r.set({
                    timezone : this.timezone
                });
            } else if (this.timezoneOffset) {
                r.set({
                    timezoneOffset : this.timezoneOffset
                });
            }
            return r;
        },
        finish : function(x) {
            x = (x instanceof Array) ? flattenAndCompact(x) : [
                x
            ];
            if (x.length === 0) { return null; }
            for ( var i = 0; i < x.length; i++) {
                if (typeof x[i] == "function") {
                    x[i].call(this);
                }
            }
            if (this.now) { return new Date(); }
            var today = Date.today();
            var method = null;
            var expression = !!(this.days != null || this.orient || this.operator);
            if (expression) {
                var gap, mod, orient;
                orient = ((this.orient == "past" || this.operator == "subtract") ? -1 : 1);
                if (this.weekday) {
                    this.unit = "day";
                    gap = (Date.getDayNumberFromName(this.weekday) - today.getDay());
                    mod = 7;
                    this.days = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
                }
                if (this.month) {
                    this.unit = "month";
                    gap = (this.month - today.getMonth());
                    mod = 12;
                    this.months = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
                    this.month = null;
                }
                if (!this.unit) {
                    this.unit = "day";
                }
                if (this[this.unit + "s"] == null || this.operator != null) {
                    if (!this.value) {
                        this.value = 1;
                    }
                    if (this.unit == "week") {
                        this.unit = "day";
                        this.value = this.value * 7;
                    }
                    this[this.unit + "s"] = this.value * orient;
                }
                return today.add(this);
            } else {
                if (this.meridian && this.hour) {
                    this.hour = (this.hour < 13 && this.meridian == "p") ? this.hour + 12 : this.hour;
                }
                if (this.weekday && !this.day) {
                    this.day = (today.addDays((Date.getDayNumberFromName(this.weekday) - today.getDay()))).getDate();
                }
                if (this.month && !this.day) {
                    this.day = 1;
                }
                return today.set(this);
            }
        }
    };
    var _ = Date.Parsing.Operators, g = Date.Grammar, t = Date.Translator, _fn;
    g.datePartDelimiter = _.rtoken(/^([\s\-\.\,\/\x27]+)/);
    g.timePartDelimiter = _.stoken(":");
    g.whiteSpace = _.rtoken(/^\s*/);
    g.generalDelimiter = _.rtoken(/^(([\s\,]|at|on)+)/);
    var _C = {};
    g.ctoken = function(keys) {
        var fn = _C[keys];
        if (!fn) {
            var c = Date.CultureInfo.regexPatterns;
            var kx = keys.split(/\s+/), px = [];
            for ( var i = 0; i < kx.length; i++) {
                px.push(_.replace(_.rtoken(c[kx[i]]), kx[i]));
            }
            fn = _C[keys] = _.any.apply(null, px);
        }
        return fn;
    };
    g.ctoken2 = function(key) {
        return _.rtoken(Date.CultureInfo.regexPatterns[key]);
    };
    g.h = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/), t.hour));
    g.hh = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/), t.hour));
    g.H = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/), t.hour));
    g.HH = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/), t.hour));
    g.m = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.minute));
    g.mm = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.minute));
    g.s = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.second));
    g.ss = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.second));
    g.hms = _.cache(_.sequence([
        g.H, g.mm, g.ss
    ], g.timePartDelimiter));
    g.t = _.cache(_.process(g.ctoken2("shortMeridian"), t.meridian));
    g.tt = _.cache(_.process(g.ctoken2("longMeridian"), t.meridian));
    g.z = _.cache(_.process(_.rtoken(/^(\+|\-)?\s*\d\d\d\d?/), t.timezone));
    g.zz = _.cache(_.process(_.rtoken(/^(\+|\-)\s*\d\d\d\d/), t.timezone));
    g.zzz = _.cache(_.process(g.ctoken2("timezone"), t.timezone));
    g.timeSuffix = _.each(_.ignore(g.whiteSpace), _.set([
        g.tt, g.zzz
    ]));
    g.time = _.each(_.optional(_.ignore(_.stoken("T"))), g.hms, g.timeSuffix);
    g.d = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
    g.dd = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
    g.ddd = g.dddd = _.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"), function(s) {
        return function() {
            this.weekday = s;
        };
    }));
    g.M = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/), t.month));
    g.MM = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/), t.month));
    g.MMM = g.MMMM = _.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"), t.month));
    g.y = _.cache(_.process(_.rtoken(/^(\d\d?)/), t.year));
    g.yy = _.cache(_.process(_.rtoken(/^(\d\d)/), t.year));
    g.yyy = _.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/), t.year));
    g.yyyy = _.cache(_.process(_.rtoken(/^(\d\d\d\d)/), t.year));
    _fn = function() {
        return _.each(_.any.apply(null, arguments), _.not(g.ctoken2("timeContext")));
    };
    g.day = _fn(g.d, g.dd);
    g.month = _fn(g.M, g.MMM);
    g.year = _fn(g.yyyy, g.yy);
    g.orientation = _.process(g.ctoken("past future"), function(s) {
        return function() {
            this.orient = s;
        };
    });
    g.operator = _.process(g.ctoken("add subtract"), function(s) {
        return function() {
            this.operator = s;
        };
    });
    g.rday = _.process(g.ctoken("yesterday tomorrow today now"), t.rday);
    g.unit = _.process(g.ctoken("minute hour day week month year"), function(s) {
        return function() {
            this.unit = s;
        };
    });
    g.value = _.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/), function(s) {
        return function() {
            this.value = s.replace(/\D/g, "");
        };
    });
    g.expression = _.set([
        g.rday, g.operator, g.value, g.unit, g.orientation, g.ddd, g.MMM
    ]);
    _fn = function() {
        return _.set(arguments, g.datePartDelimiter);
    };
    g.mdy = _fn(g.ddd, g.month, g.day, g.year);
    g.ymd = _fn(g.ddd, g.year, g.month, g.day);
    g.dmy = _fn(g.ddd, g.day, g.month, g.year);
    g.date = function(s) {
        return ((g[Date.CultureInfo.dateElementOrder] || g.mdy).call(this, s));
    };
    g.format = _.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/), function(fmt) {
        if (g[fmt]) {
            return g[fmt];
        } else {
            throw Date.Parsing.Exception(fmt);
        }
    }), _.process(_.rtoken(/^[^dMyhHmstz]+/), function(s) {
        return _.ignore(_.stoken(s));
    }))), function(rules) {
        return _.process(_.each.apply(null, rules), t.finishExact);
    });
    var _F = {};
    var _get = function(f) {
        return _F[f] = (_F[f] || g.format(f)[0]);
    };
    g.formats = function(fx) {
        if (fx instanceof Array) {
            var rx = [];
            for ( var i = 0; i < fx.length; i++) {
                rx.push(_get(fx[i]));
            }
            return _.any.apply(null, rx);
        } else {
            return _get(fx);
        }
    };
    g._formats = g.formats([
        "yyyy-MM-ddTHH:mm:ss", "ddd, MMM dd, yyyy H:mm:ss tt", "ddd MMM d yyyy HH:mm:ss zzz", "d"
    ]);
    g._start = _.process(_.set([
        g.date, g.time, g.expression
    ], g.generalDelimiter, g.whiteSpace), t.finish);
    g.start = function(s) {
        try {
            var r = g._formats.call({}, s);
            if (r[1].length === 0) { return r; }
        } catch (e) {
        }
        return g._start.call({}, s);
    };
}());
Date._parse = Date.parse;
Date.parse = function(s) {
    var r = null;
    if (!s) { return null; }
    try {
        r = Date.Grammar.start.call({}, s);
    } catch (e) {
        return null;
    }
    return ((r[1].length === 0) ? r[0] : null);
};
Date.getParseFunction = function(fx) {
    var fn = Date.Grammar.formats(fx);
    return function(s) {
        var r = null;
        try {
            r = fn.call({}, s);
        } catch (e) {
            return null;
        }
        return ((r[1].length === 0) ? r[0] : null);
    };
};
Date.parseExact = function(s, fx) {
    return Date.getParseFunction(fx)(s);
};
// continuation of hack
Date.prototype.datejsAdd = Date.prototype.add;
Date.prototype.add = function(config, extVal) {
    if (typeof config == "object") {
        return this.datejsAdd(config);
    } else {
        return this.extAdd(config, extVal);
    }
};
