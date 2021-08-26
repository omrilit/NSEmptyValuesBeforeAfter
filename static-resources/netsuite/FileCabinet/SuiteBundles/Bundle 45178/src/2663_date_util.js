/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 *
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/08/13  227868         2.00.1       			  Initial version
 * 2012/09/21  231643         2.00.1       			  Set totalOffsetHrs in getCurrentTime to 0 if
 * 													  timeZoneOffset parameter is blank or null
 * 2012/10/22  233817         2.00.1       			  Add method reformatStringDate
 * 2014/05/06  282567    	  3.01.02				  Support time period in method formatDateTime
 * 													  Add method formatStringTime
 */
var psg_ep;

if (!psg_ep)
    psg_ep = {};

psg_ep.DateUtil = function() {
	var thisObj = this;
	
	function getCurrentTime(timeZoneOffset) {
		var totalOffsetHrs = 0;
		var currentDate = new Date();
		var utc = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000);
		//timeZoneOffset sample: '-08:00'
		if (timeZoneOffset) {
			var offsetArr = timeZoneOffset.split(':');
			var offsetHrs = (offsetArr[0] || 0) * 1;
			var offsetMins = (offsetArr[1] || 0) * 1;
			if (offsetHrs) {
				totalOffsetHrs = (Math.abs(offsetHrs) + (offsetMins/60))*(offsetHrs/Math.abs(offsetHrs));
			}
		}
		return new Date(utc + (3600000 * totalOffsetHrs));
	}

	function getDatesByDayOfWeek(currentDate, dayOfWeek){
		var dates = [];
		var currentMonth = currentDate.getMonth();
		for (var d = 1; d <= 31; d++) {
			var dt = new Date(currentDate);
			dt.setDate(d);
			if (currentMonth != dt.getMonth()) {
				break;
			}
			if (dt.getDay() == dayOfWeek) {
				dates.push(dt);
			}
		}
		return dates;
	}
	
	function formatDateTime(date, dateFormat){
	    function dayOfYear(date) {
	        var jan1 = new Date(date.getFullYear(), 0, 1);
	        var dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	        return Math.round((dateOnly - jan1) / 86400000) + 1;
	    }
	    if (date && dateFormat) {
	        return date ? dateFormat.replace(/Y{2,4}|MM|D{2,3}|HH|mm|ss|AM\/PM/g, function (match) {
	            var replacement = '';
	            switch (match) {
	                case 'DDD':
	                    replacement = dayOfYear(date);
	                    break;
	                case 'DD':
	                    replacement = date.getDate();
	                    break;
	                case 'MM':
	                    replacement = date.getMonth() + 1;
	                    break;
	                case 'YY':
	                case 'YYYY':
	                    replacement = date.getFullYear().toString().substr(-match.length);
	                    break;
	                case 'HH': {
	                    replacement = date.getHours();
	                    if (dateFormat.indexOf('AM/PM') > -1) {
	                    	if (replacement > 12) {
	                    		replacement = replacement - 12;	
	                    	} else if (replacement == 0) {
	                    		replacement = 12;
	                    	}
	                    }
	                    break;
	                }
	                case 'mm':
	                    replacement = date.getMinutes();
	                    break;
	                case 'ss':
	                    replacement = date.getSeconds();
	                    break;
	                case 'AM/PM': 
	                	replacement = date.getHours() > 11 ? 'pm' : 'am';
	                    break;
	            }
	            return match == 'AM/PM' ? replacement : strPad(replacement.toString(), match.length, 0, 1);
	        }) : '';
	    }
	    return '';
	}
	
	function strPad(str, len, pad, dir){
		// Set Sting options - LEFT - RIGHT - BOTH LEFT AND RIGHT
		var STR_PAD_LEFT = 1;
		var STR_PAD_RIGHT = 2;
		var STR_PAD_BOTH = 3;

		// Ensure that null values are set.
		str = (str == null) ? '' : str.trim();
		len = (len == null) ? 0 : len;
		pad = (pad == null) ? ' ' : pad;
		dir = (dir == null) ? STR_PAD_RIGHT : dir;

		// Pad the string.
		if (len + 1 >= str.length) {
			switch (dir) {
				case STR_PAD_LEFT:
					str = Array(len + 1 - str.length).join(pad) + str;
					// truncate on least significant digits (padded digits)
					if (str.length > len) {
						str = str.substring(str.length - len, str.length);
					}
					break;
				case STR_PAD_BOTH:
					var right = Math.ceil((padlen = len - str.length) / 2);
					var left = padlen - right;
					str = Array(left + 1).join(pad) + str + Array(right + 1).join(pad);
					// truncate on padded digits
					if (str.length > len) {
						str = str.substring(left, right + 1);
					}
					break;
				default:
					str = str + Array(len + 1 - str.length).join(pad);
					// truncate on least significant digits (padded digits)
					if (str.length > len) {
						str = str.substring(0, len);
					}
					break;
			}
		} else {
			if (dir == STR_PAD_LEFT) {
				str = str.substring(str.length - len, str.length);
			} else {
				str = str.substring(0, len);
			}
		}
		return str;
	}
	
	function reformatStringDate(strDate, format) {
		try {
			if (strDate && format) {
				var dt = nlapiStringToDate(strDate, format);
				strDate = nlapiDateToString(dt, format);
			}	
		} catch (ex) {
			var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
			nlapiLogExecution('error', 'Date Util: reformatStringDate', errorStr);
		}
		return strDate;
	}
	
	function formatStringTime(strTime, strInputFormat, strOutputFormat) {
		var strFormattedTime = strTime;
		
		if (strTime && strInputFormat) {
			var intHr = 0;
			var intMin = 0;
			
			// support only input time format 'hh:mm AM/PM' for now
			if (strInputFormat == 'hh:mm AM/PM') {
				var strHrMin = (strTime.match(/\d{1,2}:\d{2}/) || [''])[0];
				var arrHrMin = strHrMin.split(':');
				intHr = arrHrMin[0] * 1;
				if (strTime.indexOf('pm') > -1 && intHr != 12) {
					intHr += 12;
				} else if (strTime.indexOf('am') > -1 && intHr == 12) {
					intHr = 0;
				}
				intMin = arrHrMin[1] * 1;	
			}
			
			// add other supported input time format here
			// ...
			
			var dtTemp = new Date(2014, 1, 1, intHr, intMin);
			// format using strOutputFormat
			if (strOutputFormat) {
				return thisObj.formatDateTime(dtTemp, strOutputFormat);
			}
			
			// default to time format from user preference
			return nlapiDateToString(dtTemp, 'timeofday');
		}

		return strFormattedTime;
	}
	
	this.getCurrentTime = getCurrentTime;
	this.getDatesByDayOfWeek = getDatesByDayOfWeek;
	this.formatDateTime = formatDateTime;
	this.reformatStringDate = reformatStringDate;
	this.formatStringTime = formatStringTime;
};