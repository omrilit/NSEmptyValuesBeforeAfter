/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 * 
 * include list: 2663_date_util.js
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/08/13  227868         2.00.1       			  Initial Version
 * 2012/08/14  227868         2.01.1                  Add validation for recurrence pattern
 * 2012/08/17  227868         2.01.1                  Display correct fields when no recurrence is selected
 * 2012/08/30  229820         2.01.1                  Call toggleFieldDisplay function as soon as DOM is ready
 * 2012/09/20  231643         2.01.1                  Reload page when bank account is selected to update time zone
 * 													  and set timeZoneOffset to [''] when match is null
 * 2012/09/25  231846         2.01.1                  Reload page when custpage_2663_schedule_bank_acct is selected 
 * 													  and pass value to parameter custparam_2663_bank_acct
 * 2013/04/15  248888   	  2.00.12				  Remove Company Bank field and add Time Zone field
 * 2014/05/06  282567    	  3.01.02				  Convert start time to time format of user before saving entry
 * 
 */

var psg_ep;

if (!psg_ep)
	psg_ep = {};

function pageInit(type) {
	nlapiSetFieldValue('custrecord_2663_schedule_type', 1);	//Default to Credit for now
}

function fieldChanged(type, name, line){
	toggleFieldDisplay(name);
}

function validateField(type, name, line){
	if (name.indexOf('custpage_2663_schedule_') > -1 || name == 'custrecord_2663_schedule_time_zone') {
		var newNextDate = getNextScheduleDate();
		if (newNextDate) {
			nlapiSetFieldValue('custpage_2663_schedule_next_date', nlapiDateToString(newNextDate));	
		} else {
			var nextDate = nlapiGetFieldValue('custpage_2663_schedule_next_date');
			if (nextDate) {
				nlapiSetFieldValue('custpage_2663_schedule_next_date', '');
			}
		}	
	}
	return true;
}

function saveRecord() {
	if (!nlapiGetFieldValue('custpage_2663_schedule_next_date')) {
		alert('Invalid recurrence pattern. Please select a valid recurrence pattern');
		return false;
	}
	
	var fldsToUpdate = [
        'recurrence', 'daily_option', 'num_of_days', 'num_of_weeks', 'days_of_week', 'monthly_option', 
        'day_of_month', 'week_of_month', 'day_of_week', 'next_date', 'start_time'
    ];
	
	for (var i = 0, ii = fldsToUpdate.length; i < ii; i++) {
		var fldToUpdate = fldsToUpdate[i];
		var fldValue = nlapiGetFieldValue('custpage_2663_schedule_' + fldToUpdate);
		if (fldValue && fldToUpdate == 'start_time') {
			fldValue = convertTimeToUserTimeFormat(fldValue);
		}
		nlapiSetFieldValue('custrecord_2663_schedule_' + fldToUpdate, fldValue);	
	}
	return true;
}


/**
*
* @appliedtorecord Partner, Vendor
* 
* @param {String} strTime - format hh:mm AM/PM
* @returns {String} - time converted to time format on user's preference
*/

function convertTimeToUserTimeFormat(strTime) {
	var strFormattedTime = strTime;
	if (strTime) {
		var strHrMin = (strTime.match(/\d{1,2}:\d{2}/) || [''])[0];
		var arrHrMin = strHrMin.split(':');
		var intHr = arrHrMin[0] * 1;
		if (strTime.indexOf('pm') > -1 && intHr != 12) {
			intHr += 12;
		} else if (strTime.indexOf('am') > -1 && intHr == 12) {
			intHr = 0;
		}
		var intMin = arrHrMin[1] * 1;
		return nlapiDateToString(new Date(2014, 1, 1, intHr, intMin), 'timeofday');
	}

	return strFormattedTime;
}

function toggleFieldDisplay(name) {
	name = name || 'custpage_2663_schedule_recurrence';
	var fldValue = nlapiGetFieldValue(name);
	if (name == 'custpage_2663_schedule_recurrence') {
		if (fldValue == '1') {
			jQuery('[id^=custpage_2663_schedule_repeat_text]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_num_of_weeks]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_day]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_week]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_month]').closest('td').hide();
			if (nlapiGetFieldValue('custpage_2663_schedule_daily_option') == '1') {
				jQuery('[id^=custpage_2663_schedule_num_of_days]').closest('td').show();
				jQuery('[id^=custpage_2663_schedule_days_text]').closest('td').show();
			} else {
				jQuery('[id^=custpage_2663_schedule_num_of_days]').closest('td').hide();
				jQuery('[id^=custpage_2663_schedule_days_text]').closest('td').hide();
			}
			jQuery('[id^=custpage_2663_schedule_daily]').closest('td').show();
		} else if (fldValue == '2') {
			jQuery('[id^=custpage_2663_schedule_daily]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_num_of_days]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_day]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_week]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_monthly]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_repeat_text]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_num_of_weeks]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_days_of_week]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_weeks_text]').closest('td').show();
		} else if (fldValue == '3') {
			jQuery('[id^=custpage_2663_schedule_daily]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_repeat_text]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_num_of]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_days]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_weeks_text]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_monthly]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_month_text]').closest('td').show();
			if (nlapiGetFieldValue('custpage_2663_schedule_monthly_option') == '1') {
				jQuery('[id^=custpage_2663_schedule_day_of_month]').closest('td').show();
				jQuery('[id^=custpage_2663_schedule_week_of_month]').closest('td').hide();
				jQuery('[id^=custpage_2663_schedule_day_of_week]').closest('td').hide();
			} else {
				jQuery('[id^=custpage_2663_schedule_day_of_month]').closest('td').hide();
				jQuery('[id^=custpage_2663_schedule_week_of_month]').closest('td').show();
				jQuery('[id^=custpage_2663_schedule_day_of_week]').closest('td').show();
			}
		} else {
			jQuery('[id^=custpage_2663_schedule]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_next_date]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_start_time]').closest('td').show();
		}
	} else if (name == 'custpage_2663_schedule_daily_option') {
		if (fldValue == '1') {
			jQuery('[id^=custpage_2663_schedule_num_of_days]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_days_text]').closest('td').show();
		} else {
			jQuery('[id^=custpage_2663_schedule_num_of_days]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_days_text]').closest('td').hide();
		}
	} else if (name == 'custpage_2663_schedule_monthly_option') {
		if (nlapiGetFieldValue('custpage_2663_schedule_monthly_option') == '1') {
			jQuery('[id^=custpage_2663_schedule_day_of_month]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_week_of_month]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_day_of_week]').closest('td').hide();
		} else {
			jQuery('[id^=custpage_2663_schedule_day_of_month]').closest('td').hide();
			jQuery('[id^=custpage_2663_schedule_week_of_month]').closest('td').show();
			jQuery('[id^=custpage_2663_schedule_day_of_week]').closest('td').show();
		}
	}
}

function getNextScheduleDate(lastDate) {
	var dtUtil = new psg_ep.DateUtil();
	var recurrence = nlapiGetFieldValue('custpage_2663_schedule_recurrence');
	var timeZoneOffset = (nlapiGetFieldText('custrecord_2663_schedule_time_zone').match(/[+-]\d{2}:\d{2}/) || [''])[0];
	var currentDate = dtUtil.getCurrentTime(timeZoneOffset);
	var nextDate = new Date(lastDate || currentDate);
	var weekDays = '12345';

	if (recurrence) {
		if (recurrence == 1) {
			var dailyOption = nlapiGetFieldValue('custpage_2663_schedule_daily_option');
			if (dailyOption) {
				if (dailyOption == 1) {
					var numOfDays = parseInt(nlapiGetFieldValue('custpage_2663_schedule_num_of_days') || 0, 10);
					if (numOfDays > 0) {
						nextDate.setDate(nextDate.getDate() + numOfDays);
					}
				} else if (dailyOption == 2) {
					do {
						nextDate.setDate(nextDate.getDate() + 1);
					} while(weekDays.indexOf(nextDate.getDay()) < 0)
				}	
			}
		} else if (recurrence == 2) {
			var daysOfWeek = nlapiGetFieldValues('custpage_2663_schedule_days_of_week') || [];
			var numOfWeeks = nlapiGetFieldValue('custpage_2663_schedule_num_of_weeks');
			if (daysOfWeek.length > 0 && numOfWeeks > 0) {
				var intervalDays = 0;
				var diff = 0;
				while (diff <= 0) {
					for (var i = 0, ii = daysOfWeek.length; i < ii; i++) {
						diff = (daysOfWeek[i] - 1 + intervalDays) - nextDate.getDay();
						if (diff > 0) {
							nextDate.setDate(nextDate.getDate() + diff);
							break;
						}
					}
					intervalDays += 7;
				}
			}
		} else if (recurrence == 3) {
			var monthlyOption = nlapiGetFieldValue('custpage_2663_schedule_monthly_option');
			if (monthlyOption) {
				if (monthlyOption == 1) {
					var dayOfMonth = nlapiGetFieldValue('custpage_2663_schedule_day_of_month');
					var expectedMonth = nextDate.getMonth();
					if (nextDate.getDate() >= dayOfMonth) {
						expectedMonth += 1;
						nextDate.setMonth(expectedMonth);
					}
					nextDate.setDate(dayOfMonth);
					while (expectedMonth != nextDate.getMonth()) {
						nextDate.setDate(nextDate.getDate() - 1);
					}
				} else if (monthlyOption == 2) {
					var weekOfMonth = nlapiGetFieldValue('custpage_2663_schedule_week_of_month');
					var dayOfWeek = nlapiGetFieldValue('custpage_2663_schedule_day_of_week');
					if (weekOfMonth && dayOfWeek) {
						var dates = dtUtil.getDatesByDayOfWeek(nextDate, dayOfWeek - 1);
						var dateToClose = dates[(weekOfMonth == 5 ? dates.length : weekOfMonth) - 1];
						if (dateToClose && nextDate.getDate() >= dateToClose.getDate()) {
							nextDate.setDate(1);
							nextDate.setMonth(nextDate.getMonth() + 1);
							dates = dtUtil.getDatesByDayOfWeek(nextDate, dayOfWeek - 1);
							nextDate = dates[(weekOfMonth > 4 ? dates.length : weekOfMonth) - 1];
						} else {
							nextDate = dateToClose;
						}	
					}
				}
			}
		}
	}
	return nextDate <= currentDate ? '' : nextDate;
}

jQuery(document).ready(function(){ 
	toggleFieldDisplay(); 
});