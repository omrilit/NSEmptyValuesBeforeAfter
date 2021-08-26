/**
 * Bryntum view presets
 * 
 * Version   Date         Author    Remarks
 * 1.00      11/28/2013   pmiller   Initial version
 * 2.00      04/28/2014   maquino   Added translation support
 */
 
var longDateDaily = convertNSLongDateFormat('daily');
var longDateWeekly = convertNSLongDateFormat('weekly');
var longDateMonthly = convertNSLongDateFormat('monthly');

Sch.preset.Manager.registerPreset('PSA.RA.ViewPreset.Daily', {
    timeColumnWidth : 100,
    displayDateFormat : "D M d",
    shiftUnit : "DAY",
    shiftIncrement : 1,
    defaultSpan : 14,
    timeResolution : {
        unit : "DAY",
        increment : 1
    },
    headerConfig : {
        middle : {
            unit : "DAY",
            dateFormat : longDateDaily
        }
    }
});
Sch.preset.Manager.registerPreset('PSA.RA.ViewPreset.Weekly', {
    timeColumnWidth : 100,
    displayDateFormat : "D M d",
    shiftUnit : "WEEK",
    shiftIncrement : 1,
    defaultSpan : 12,
    timeResolution : {
        unit : "DAY",
        increment : 1
    },
    headerConfig : {
        middle : {
            unit : "WEEK",
            renderer : function(start, end, headerConfig, index) {
                return translatedStrings.getText('VIEWPRESET.WEEK_OF') + ' ' + Ext4.Date.format(start, longDateWeekly);
            }
        }
    }
});
Sch.preset.Manager.registerPreset('PSA.RA.ViewPreset.Monthly', {
    timeColumnWidth : 100,
    displayDateFormat : "D M d",
    shiftIncrement : 1,
    shiftUnit : "MONTH",
    defaultSpan : 12,
    timeResolution : {
        unit : "DAY",
        increment : 1
    },
    headerConfig : {
        middle : {
            unit : "MONTH",
            dateFormat : longDateMonthly
        }
    }
});
