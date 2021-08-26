/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_ptm;
if (!psa_ptm) { psa_ptm = {}; }
if (!psa_ptm.serverlibrary) { psa_ptm.serverlibrary = {}; }


/**
 * Check Object Validity
 */
psa_ptm.serverlibrary.isValidObject = function(objectToTest) {
    var isValidObject = false;
    isValidObject = (objectToTest!=null && objectToTest!='' && objectToTest!=undefined) ? true : false;
    return isValidObject;    
}; 


/**
 * Logging utility.
 */
psa_ptm.serverlibrary.logger = function(logTitle, isClientside, isEnabled) {
    // Logger Constants  
    var startLogMessage     = '=====Start=====';
    var endLogMessage       = '======End======';
    var setStartLogMessage  = function(newStartLogMessage) { startLogMessage = newStartLogMessage;  }; 
    var setEndLogMessage    = function(newEndtLogMessage)  { endLogMessage   = newEndLogMessage;    };
     
    this.getStartLogMessage = function() { return startLogMessage;  }; 
    this.getEndLogMessage   = function() { return endLogMessage;    }; 
    
    // logTitle manipulation 
    var logTitle           = logTitle;
    this.setLogTitle       = function(newLogTitle) { logTitle = newLogTitle;  };
    this.getLogTitle       = function() { return logTitle;  }; 

    // Determines whether to print a log or display an alert message 
    var isClientside       = (!isClientside) ? false : isClientside;  
    var isForceClientside  = false; 
    
    this.forceClientside   = function() { isForceClientside = true;  };          // Force Client Side logging via alerts
    this.unforceClientside = function() { isForceClientside = false; };          // Unforce Client Side logging via alerts
    
    // Defines the logLevel similar to that of log4j  
    var ALL        = 0; // The ALL has the lowest possible rank and is intended to turn on all logging.
    var AUDIT      = 1; // The AUDIT Level designates finer-grained informational events than the DEBUG
    var DEBUG      = 2; // The DEBUG Level designates fine-grained informational events that are most useful to debug an application.
    var ERROR      = 3; // The ERROR level designates error events that might still allow the application to continue running.
    var EMERGENCY  = 4; // The EMERGENCY level designates very severe error events that will presumably lead the application to abort.
    var OFF        = 5; // The OFF has the highest possible rank and is intended to turn off logging.

    var LOG_LEVELS = new Array('ALL', 'AUDIT', 'DEBUG', 'ERROR', 'EMERGENCY', 'OFF');
    var logLevel   = OFF; // current log level - default is OFF

    // Convenience method to set log level to ALL, AUDIT, DEBUG, ERROR, EMERGENCY and OFF 
    this.setLogLevelToAll       = function() { logLevel = ALL;       };
    this.setLogLevelToAudit     = function() { logLevel = AUDIT;     };
    this.setLogLevelToDebug     = function() { logLevel = DEBUG;     };
    this.setLogLevelToError     = function() { logLevel = ERROR;     };
    this.setLogLevelToEmergency = function() { logLevel = EMERGENCY; };
    this.setLogLevelToOff       = function() { logLevel = OFF;       };
     
    this.enable   = function() { this.setLogLevelToAll(); };                     // Enable the logging mechanism
    this.disable  = function() { this.setLogLevelToOff(); };                     // Disable the logging mechanism
    if (!isEnabled) {
        this.disable();
    } else {
        if (isEnabled == true) this.enable();
    }  

    // Facility for pretty-fying the output of the logging mechanism
    var TAB             = '\t';                                                 // Tabs
    var SPC             = ' ';                                                  // Space
    var indentCharacter = SPC;                                                  // character to be used for indents: 
    var indentations    = 0;                                                    // number of indents to be padded to message
    
    this.indent   = function() { indentations++; };
    this.unindent = function() { indentations--; };

    // Prints a log either as an alert for CSS or a server side log for SSS
    this.log = function (logType, newLogTitle, logMessage) {
        // Pop an alert window if isClientside or isForceClientside  
        if ((isClientside) || (isForceClientside)) {
            alert(LOG_LEVELS[logType] + ' : ' + newLogTitle + ' : ' + logMessage);
        }

        // Prints a log message if !isClientside 
        if (!isClientside) {                                                    
            for (var i = 0; i < indentations; i++) { 
                logMessage = indentCharacter + logMessage;
            }
            logMessage = '<pre>' + logMessage + '</pre>';
            nlapiLogExecution(LOG_LEVELS[logType], newLogTitle, logMessage);
        }
    };
    
    // Validates the log parameter before calling tha actual log function
    this.validateParamsThenLog = function(logType, newLogTitle, logMessage) {
        if (!logType) logType = EMERGENCY;                                      // default logType to EMERGENCY - minimal log messages
        if (logLevel > logType) return;                                         // current logLevel does not accomodate logType 
    
        if (newLogTitle && !logMessage) {                                       // If newLogTitle exist and logMessage is undefined, 
            logMessage  = newLogTitle;                                          // then the newLogTitle should be displayed as the logMessage
            newLogTitle = null;
        }
        
        if (!newLogTitle) newLogTitle = logTitle;
        this.log(logType, newLogTitle, logMessage);
    }; 

    // Convenience method to log a AUDIT, DEBUG, INFO, WARN, ERROR and EMERGENCY messages
    this.audit     = function(newLogTitle, logMessage) { this.validateParamsThenLog(AUDIT,     newLogTitle, logMessage); };
    this.debug     = function(newLogTitle, logMessage) { this.validateParamsThenLog(DEBUG,     newLogTitle, logMessage); };
    this.error     = function(newLogTitle, logMessage) { this.validateParamsThenLog(ERROR,     newLogTitle, logMessage); };
    this.emergency = function(newLogTitle, logMessage) { this.validateParamsThenLog(EMERGENCY, newLogTitle, logMessage); };
}; // end psa_ptm.serverlibrary.logger 

/**
 * JSON Fail Message
 */
psa_ptm.serverlibrary.getFailMessage = function (message) {
    var err = new Object();
    err.success = false;
    err.message= message;
    return JSON.stringify(err);
};

/**
 * Convert String to JSON
 */
psa_ptm.serverlibrary.toJson = function (json) {
    try {
        if (json) {
            return JSON.parse(json);    
        }
    }
    catch(ex) {
        return json;
    }
};

/**
 * Check if JSON
 */
psa_ptm.serverlibrary.isJson = function (json) {
    try {
        if (json) {
            JSON.parse(json);    
        }
        
        return true;
    }
    catch(ex) {
        return false;
    }
};

psa_ptm.serverlibrary.isFeatureEnabled = function(featureId) { 
    var context = nlapiGetContext();
    return context.getFeature(featureId);
};

psa_ptm.serverlibrary.getNSDateFormat = function() {
    // convert NS format into DateJS notation.
    var dateFormat = 'yyyy/M/d';
    var nsDateFormat = nlapiGetContext().getPreference('dateformat');
    
    switch (nsDateFormat) {
        case 'MM/DD/YYYY':
            dateFormat = 'M/d/yyyy';
            break;
        case 'DD/MM/YYYY':
            dateFormat = 'd/M/yyyy';
            break;
        case 'DD-Mon-YYYY':
            dateFormat = 'd-MMM-yyyy';
            break;
        case 'DD.MM.YYYY':
            dateFormat = 'd.M.yyyy';
            break;
        case 'DD-MONTH-YYYY':
            dateFormat = 'd-MMMM-yyyy';
            break;
        case 'DD MONTH, YYYY':
            dateFormat = 'd MMMM, yyyy';
            break;
        case 'YYYY/MM/DD':
            dateFormat = 'yyyy/M/d';
            break;
        case 'YYYY-MM-DD':
            dateFormat = 'yyyy-M-d';
            break;
        case 'YYYY MM DD': // chinese
            dateFormat = 'yyyy M d';
            break;
        case 'YYYY"年"MM"月"DD"日"': // chinese/ japanese
            dateFormat = 'yyyy年M月d日';
            break;
        case 'DD MONTH YYYY': // czech
        case 'DD MMMM YYYY': // french
            dateFormat = 'd MMMM yyyy';
            break;
        case 'DD de MMMM de YYYY': 
        case 'DD de MONTH de YYYY': // spanish
            dateFormat = 'd "de" MMMM "de" yyyy';
            break;
        case 'YYYY"년" MM"월" DD"일"': // spanish
            dateFormat = 'yyyy년 M월 d일'; // korean
            break;
        case 'DD. MMM YYYY':
        case 'DD. MON YYYY': // german
            dateFormat = 'd. MMM yyyy';
            break;
    }
    return dateFormat;
};

// make sure that the ptm_date_ss.js is included in the library with this library. ALWAYS
psa_ptm.serverlibrary.convertDateToFormat = function (dateString, toDateFormat, fromDateFormat) {
    var context    = nlapiGetContext(),
        language   = context.getPreference('LANGUAGE'),
        nsFormat   = psa_ptm.serverlibrary.getNSDateFormat(),
        fromFormat = (fromDateFormat) ? fromDateFormat : nsFormat,
        dateFormat = (toDateFormat) ? toDateFormat : nsFormat,
        newDateString = dateString,
        returnDate = null;
    
    switch (newDateString) {
        case '' :
        case null: 
            return '';
            break;
        case 'today' :
        case 'yesterday' :
        case 'tomorrow' :
        case 'thisweek' :
        case 'thismonth' :
        case 'thisyear' :
        case 'thisfiscalquarter' :
        case 'lastweek' :
        case 'lastmonth' :
        case 'lastfiscalquarter' :
        case 'nextweek' :
        case 'nextmonth' :
        case 'nextonemonth' :
        case 'nextfiscalquarter' :
            return newDateString;
            break;
        default : 
            break;
    }
    
    switch(language) {
        case 'cs_CZ' : 
            Date.CultureInfo={name:"cs-CZ",englishName:"Czech (Czech Republic)",nativeName:"čeština (Česká republika)",dayNames:["neděle","pondělí","úterý","středa","čtvrtek","pátek","sobota"],abbreviatedDayNames:["ne","po","út","st","čt","pá","so"],shortestDayNames:["ne","po","út","st","čt","pá","so"],firstLetterDayNames:["n","p","ú","s","č","p","s"],monthNames:["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"],abbreviatedMonthNames:["led","úno","bře","dub","kvě","čer","čvc","srp","zář","říj","lis","pro"],amDesignator:"dop.",pmDesignator:"odp.",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"d.M.yyyy",longDate:"d. MMMM yyyy",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"d. MMMM yyyy H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^leden/i,feb:/^únor/i,mar:/^březen/i,apr:/^duben/i,may:/^květen/i,jun:/^červen/i,jul:/^červenec/i,aug:/^srpen/i,sep:/^září/i,oct:/^říjen/i,nov:/^listopad/i,dec:/^prosinec/i,sun:/^neděle/i,mon:/^pondělí/i,tue:/^úterý/i,wed:/^středa/i,thu:/^čtvrtek/i,fri:/^pátek/i,sat:/^sobota/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'da_DK' : 
            Date.CultureInfo={name:"da-DK",englishName:"Danish (Denmark)",nativeName:"dansk (Danmark)",dayNames:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],abbreviatedDayNames:["sø","ma","ti","on","to","fr","lø"],shortestDayNames:["sø","ma","ti","on","to","fr","lø"],firstLetterDayNames:["s","m","t","o","t","f","l"],monthNames:["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"],abbreviatedMonthNames:["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd-MM-yyyy",longDate:"d. MMMM yyyy",shortTime:"HH:mm",longTime:"HH:mm:ss",fullDateTime:"d. MMMM yyyy HH:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"d. MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^jan(uar)?/i,feb:/^feb(ruar)?/i,mar:/^mar(ts)?/i,apr:/^apr(il)?/i,may:/^maj/i,jun:/^jun(i)?/i,jul:/^jul(i)?/i,aug:/^aug(ust)?/i,sep:/^sep(t(ember)?)?/i,oct:/^okt(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^søndag/i,mon:/^mandag/i,tue:/^tirsdag/i,wed:/^onsdag/i,thu:/^torsdag/i,fri:/^fredag/i,sat:/^lørdag/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'de_DE' : 
            Date.CultureInfo={name:"de-DE",englishName:"German (Germany)",nativeName:"Deutsch (Deutschland)",dayNames:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],abbreviatedDayNames:["So","Mo","Di","Mi","Do","Fr","Sa"],shortestDayNames:["So","Mo","Di","Mi","Do","Fr","Sa"],firstLetterDayNames:["S","M","D","M","D","F","S"],monthNames:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],abbreviatedMonthNames:["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd.MM.yyyy",longDate:"dddd, d. MMMM yyyy",shortTime:"HH:mm",longTime:"HH:mm:ss",fullDateTime:"dddd, d. MMMM yyyy HH:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^jan(uar)?/i,feb:/^feb(ruar)?/i,mar:/^märz/i,apr:/^apr(il)?/i,may:/^mai/i,jun:/^jun(i)?/i,jul:/^jul(i)?/i,aug:/^aug(ust)?/i,sep:/^sep(t(ember)?)?/i,oct:/^okt(ober)?/i,nov:/^nov(ember)?/i,dec:/^dez(ember)?/i,sun:/^sonntag/i,mon:/^montag/i,tue:/^dienstag/i,wed:/^mittwoch/i,thu:/^donnerstag/i,fri:/^freitag/i,sat:/^samstag/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'es_AR' : 
            Date.CultureInfo={name:"es-AR",englishName:"Spanish (Argentina)",nativeName:"Español (Argentina)",dayNames:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],abbreviatedDayNames:["dom","lun","mar","mié","jue","vie","sáb"],shortestDayNames:["do","lu","ma","mi","ju","vi","sá"],firstLetterDayNames:["d","l","m","m","j","v","s"],monthNames:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],abbreviatedMonthNames:["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],amDesignator:"a.m.",pmDesignator:"p.m.",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd/MM/yyyy",longDate:"dddd, dd' de 'MMMM' de 'yyyy",shortTime:"hh:mm tt",longTime:"hh:mm:ss tt",fullDateTime:"dddd, dd' de 'MMMM' de 'yyyy hh:mm:ss tt",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM' de 'yyyy"},regexPatterns:{jan:/^ene(ro)?/i,feb:/^feb(rero)?/i,mar:/^mar(zo)?/i,apr:/^abr(il)?/i,may:/^may(o)?/i,jun:/^jun(io)?/i,jul:/^jul(io)?/i,aug:/^ago(sto)?/i,sep:/^sep(tiembre)?/i,oct:/^oct(ubre)?/i,nov:/^nov(iembre)?/i,dec:/^dic(iembre)?/i,sun:/^do(m(ingo)?)?/i,mon:/^lu(n(es)?)?/i,tue:/^ma(r(tes)?)?/i,wed:/^mi(é(rcoles)?)?/i,thu:/^ju(e(ves)?)?/i,fri:/^vi(e(rnes)?)?/i,sat:/^sá(b(ado)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'es_ES' : 
            Date.CultureInfo={name:"es-ES",englishName:"Spanish (Spain)",nativeName:"español (España)",dayNames:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],abbreviatedDayNames:["dom","lun","mar","mié","jue","vie","sáb"],shortestDayNames:["do","lu","ma","mi","ju","vi","sá"],firstLetterDayNames:["d","l","m","m","j","v","s"],monthNames:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],abbreviatedMonthNames:["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd/MM/yyyy",longDate:"dddd, dd' de 'MMMM' de 'yyyy",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"dddd, dd' de 'MMMM' de 'yyyy H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM' de 'yyyy"},regexPatterns:{jan:/^ene(ro)?/i,feb:/^feb(rero)?/i,mar:/^mar(zo)?/i,apr:/^abr(il)?/i,may:/^may(o)?/i,jun:/^jun(io)?/i,jul:/^jul(io)?/i,aug:/^ago(sto)?/i,sep:/^sep(tiembre)?/i,oct:/^oct(ubre)?/i,nov:/^nov(iembre)?/i,dec:/^dic(iembre)?/i,sun:/^do(m(ingo)?)?/i,mon:/^lu(n(es)?)?/i,tue:/^ma(r(tes)?)?/i,wed:/^mi(é(rcoles)?)?/i,thu:/^ju(e(ves)?)?/i,fri:/^vi(e(rnes)?)?/i,sat:/^sá(b(ado)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'fr_CA' : 
            Date.CultureInfo={name:"fr-CA",englishName:"French (Canada)",nativeName:"français (Canada)",dayNames:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],abbreviatedDayNames:["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],shortestDayNames:["di","lu","ma","me","je","ve","sa"],firstLetterDayNames:["d","l","m","m","j","v","s"],monthNames:["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],abbreviatedMonthNames:["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],amDesignator:"",pmDesignator:"",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy-MM-dd",longDate:"d MMMM yyyy",shortTime:"HH:mm",longTime:"HH:mm:ss",fullDateTime:"d MMMM yyyy HH:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"d MMMM",yearMonth:"MMMM, yyyy"},regexPatterns:{jan:/^janv(.(ier)?)?/i,feb:/^févr(.(ier)?)?/i,mar:/^mars/i,apr:/^avr(.(il)?)?/i,may:/^mai/i,jun:/^juin/i,jul:/^juil(.(let)?)?/i,aug:/^août/i,sep:/^sept(.(embre)?)?/i,oct:/^oct(.(obre)?)?/i,nov:/^nov(.(embre)?)?/i,dec:/^déc(.(embre)?)?/i,sun:/^di(m(.(anche)?)?)?/i,mon:/^lu(n(.(di)?)?)?/i,tue:/^ma(r(.(di)?)?)?/i,wed:/^me(r(.(credi)?)?)?/i,thu:/^je(u(.(di)?)?)?/i,fri:/^ve(n(.(dredi)?)?)?/i,sat:/^sa(m(.(edi)?)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'fr_FT' : 
            Date.CultureInfo={name:"fr-FR",englishName:"French (France)",nativeName:"français (France)",dayNames:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],abbreviatedDayNames:["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],shortestDayNames:["di","lu","ma","me","je","ve","sa"],firstLetterDayNames:["d","l","m","m","j","v","s"],monthNames:["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],abbreviatedMonthNames:["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd/MM/yyyy",longDate:"dddd d MMMM yyyy",shortTime:"HH:mm",longTime:"HH:mm:ss",fullDateTime:"dddd d MMMM yyyy HH:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"d MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^janv(.(ier)?)?/i,feb:/^févr(.(ier)?)?/i,mar:/^mars/i,apr:/^avr(.(il)?)?/i,may:/^mai/i,jun:/^juin/i,jul:/^juil(.(let)?)?/i,aug:/^août/i,sep:/^sept(.(embre)?)?/i,oct:/^oct(.(obre)?)?/i,nov:/^nov(.(embre)?)?/i,dec:/^déc(.(embre)?)?/i,sun:/^di(m(.(anche)?)?)?/i,mon:/^lu(n(.(di)?)?)?/i,tue:/^ma(r(.(di)?)?)?/i,wed:/^me(r(.(credi)?)?)?/i,thu:/^je(u(.(di)?)?)?/i,fri:/^ve(n(.(dredi)?)?)?/i,sat:/^sa(m(.(edi)?)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'it_IT' : 
            Date.CultureInfo={name:"it-IT",englishName:"Italian (Italy)",nativeName:"italiano (Italia)",dayNames:["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],abbreviatedDayNames:["dom","lun","mar","mer","gio","ven","sab"],shortestDayNames:["do","lu","ma","me","gi","ve","sa"],firstLetterDayNames:["d","l","m","m","g","v","s"],monthNames:["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],abbreviatedMonthNames:["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd/MM/yyyy",longDate:"dddd d MMMM yyyy",shortTime:"H.mm",longTime:"H.mm.ss",fullDateTime:"dddd d MMMM yyyy H.mm.ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^gen(naio)?/i,feb:/^feb(braio)?/i,mar:/^mar(zo)?/i,apr:/^apr(ile)?/i,may:/^mag(gio)?/i,jun:/^giu(gno)?/i,jul:/^lug(lio)?/i,aug:/^ago(sto)?/i,sep:/^set(tembre)?/i,oct:/^ott(obre)?/i,nov:/^nov(embre)?/i,dec:/^dic(embre)?/i,sun:/^do(m(enica)?)?/i,mon:/^lu(n(edì)?)?/i,tue:/^ma(r(tedì)?)?/i,wed:/^me(r(coledì)?)?/i,thu:/^gi(o(vedì)?)?/i,fri:/^ve(n(erdì)?)?/i,sat:/^sa(b(ato)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'ja_JP' :
            Date.CultureInfo={name:"ja-JP",englishName:"Japanese (Japan)",nativeName:"日本語 (日本)",dayNames:["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],abbreviatedDayNames:["日","月","火","水","木","金","土"],shortestDayNames:["日","月","火","水","木","金","土"],firstLetterDayNames:["日","月","火","水","木","金","土"],monthNames:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],abbreviatedMonthNames:["1","2","3","4","5","6","7","8","9","10","11","12"],amDesignator:"午前",pmDesignator:"午後",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy/MM/dd",longDate:"yyyy'年'M'月'd'日'",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"yyyy'年'M'月'd'日' H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"M'月'd'日'",yearMonth:"yyyy'年'M'月'"},regexPatterns:{jan:/^1(月)?/i,feb:/^2(月)?/i,mar:/^3(月)?/i,apr:/^4(月)?/i,may:/^5(月)?/i,jun:/^6(月)?/i,jul:/^7(月)?/i,aug:/^8(月)?/i,sep:/^9(月)?/i,oct:/^10(月)?/i,nov:/^11(月)?/i,dec:/^12(月)?/i,sun:/^日曜日/i,mon:/^月曜日/i,tue:/^火曜日/i,wed:/^水曜日/i,thu:/^木曜日/i,fri:/^金曜日/i,sat:/^土曜日/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'ko_KR' : 
            Date.CultureInfo={name:"ko-KR",englishName:"Korean (Korea)",nativeName:"한국어 (대한민국)",dayNames:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],abbreviatedDayNames:["일","월","화","수","목","금","토"],shortestDayNames:["일","월","화","수","목","금","토"],firstLetterDayNames:["일","월","화","수","목","금","토"],monthNames:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],abbreviatedMonthNames:["1","2","3","4","5","6","7","8","9","10","11","12"],amDesignator:"오전",pmDesignator:"오후",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy-MM-dd",longDate:"yyyy'년' M'월' d'일' dddd",shortTime:"tt h:mm",longTime:"tt h:mm:ss",fullDateTime:"yyyy'년' M'월' d'일' dddd tt h:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"M'월' d'일'",yearMonth:"yyyy'년' M'월'"},regexPatterns:{jan:/^1(월)?/i,feb:/^2(월)?/i,mar:/^3(월)?/i,apr:/^4(월)?/i,may:/^5(월)?/i,jun:/^6(월)?/i,jul:/^7(월)?/i,aug:/^8(월)?/i,sep:/^9(월)?/i,oct:/^10(월)?/i,nov:/^11(월)?/i,dec:/^12(월)?/i,sun:/^일요일/i,mon:/^월요일/i,tue:/^화요일/i,wed:/^수요일/i,thu:/^목요일/i,fri:/^금요일/i,sat:/^토요일/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'nl_NL' : 
            Date.CultureInfo={name:"nl-NL",englishName:"Dutch (Netherlands)",nativeName:"Nederlands (Nederland)",dayNames:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],abbreviatedDayNames:["zo","ma","di","wo","do","vr","za"],shortestDayNames:["zo","ma","di","wo","do","vr","za"],firstLetterDayNames:["z","m","d","w","d","v","z"],monthNames:["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],abbreviatedMonthNames:["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"d-M-yyyy",longDate:"dddd d MMMM yyyy",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"dddd d MMMM yyyy H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^jan(uari)?/i,feb:/^feb(ruari)?/i,mar:/^maart/i,apr:/^apr(il)?/i,may:/^mei/i,jun:/^jun(i)?/i,jul:/^jul(i)?/i,aug:/^aug(ustus)?/i,sep:/^sep(t(ember)?)?/i,oct:/^okt(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^zondag/i,mon:/^maandag/i,tue:/^dinsdag/i,wed:/^woensdag/i,thu:/^donderdag/i,fri:/^vrijdag/i,sat:/^zaterdag/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'pt_BR' : 
            Date.CultureInfo={name:"pt-BR",englishName:"Portuguese (Brazil)",nativeName:"Português (Brasil)",dayNames:["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],abbreviatedDayNames:["dom","seg","ter","qua","qui","sex","sáb"],shortestDayNames:["dom","seg","ter","qua","qui","sex","sáb"],firstLetterDayNames:["d","s","t","q","q","s","s"],monthNames:["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],abbreviatedMonthNames:["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],amDesignator:"",pmDesignator:"",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"d/M/yyyy",longDate:"dddd, d' de 'MMMM' de 'yyyy",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"dddd, d' de 'MMMM' de 'yyyy H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd' de 'MMMM",yearMonth:"MMMM' de 'yyyy"},regexPatterns:{jan:/^jan(eiro)?/i,feb:/^fev(ereiro)?/i,mar:/^mar(ço)?/i,apr:/^abr(il)?/i,may:/^mai(o)?/i,jun:/^jun(ho)?/i,jul:/^jul(ho)?/i,aug:/^ago(sto)?/i,sep:/^set(embro)?/i,oct:/^out(ubro)?/i,nov:/^nov(embro)?/i,dec:/^dez(embro)?/i,sun:/^domingo/i,mon:/^segunda-feira/i,tue:/^terça-feira/i,wed:/^quarta-feira/i,thu:/^quinta-feira/i,fri:/^sexta-feira/i,sat:/^sábado/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'ru_RU' : 
            Date.CultureInfo={name:"ru-RU",englishName:"Russian (Russia)",nativeName:"русский (Россия)",dayNames:["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],abbreviatedDayNames:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],shortestDayNames:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],firstLetterDayNames:["В","П","В","С","Ч","П","С"],monthNames:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],abbreviatedMonthNames:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"dmy",formatPatterns:{shortDate:"dd.MM.yyyy",longDate:"d MMMM yyyy 'г.'",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"d MMMM yyyy 'г.' H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"MMMM dd",yearMonth:"MMMM yyyy 'г.'"},regexPatterns:{jan:/^янв(арь)?/i,feb:/^фев(раль)?/i,mar:/^мар(т)?/i,apr:/^апр(ель)?/i,may:/^май/i,jun:/^июн(ь)?/i,jul:/^июл(ь)?/i,aug:/^авг(уст)?/i,sep:/^сен(тябрь)?/i,oct:/^окт(ябрь)?/i,nov:/^ноя(брь)?/i,dec:/^дек(абрь)?/i,sun:/^воскресенье/i,mon:/^понедельник/i,tue:/^вторник/i,wed:/^среда/i,thu:/^четверг/i,fri:/^пятница/i,sat:/^суббота/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'sv_SE' : 
            Date.CultureInfo={name:"sv-SE",englishName:"Swedish (Sweden)",nativeName:"svenska (Sverige)",dayNames:["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],abbreviatedDayNames:["sö","må","ti","on","to","fr","lö"],shortestDayNames:["sö","må","ti","on","to","fr","lö"],firstLetterDayNames:["s","m","t","o","t","f","l"],monthNames:["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],abbreviatedMonthNames:["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],amDesignator:"",pmDesignator:"",firstDayOfWeek:1,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy-MM-dd",longDate:"'den 'd MMMM yyyy",shortTime:"HH:mm",longTime:"HH:mm:ss",fullDateTime:"'den 'd MMMM yyyy HH:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"'den 'd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^jan(uari)?/i,feb:/^feb(ruari)?/i,mar:/^mar(s)?/i,apr:/^apr(il)?/i,may:/^maj/i,jun:/^jun(i)?/i,jul:/^jul(i)?/i,aug:/^aug(usti)?/i,sep:/^sep(t(ember)?)?/i,oct:/^okt(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^söndag/i,mon:/^måndag/i,tue:/^tisdag/i,wed:/^onsdag/i,thu:/^torsdag/i,fri:/^fredag/i,sat:/^lördag/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'th_TH' : 
            Date.CultureInfo={name:"th-TH",englishName:"Thai (Thailand)",nativeName:"ไทย (ไทย)",dayNames:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],abbreviatedDayNames:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],shortestDayNames:["อ","จ","อ","พ","พ","ศ","ส"],firstLetterDayNames:["อ","จ","อ","พ","พ","ศ","ส"],monthNames:["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],abbreviatedMonthNames:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],amDesignator:"AM",pmDesignator:"PM",firstDayOfWeek:1,twoDigitYearMax:2572,dateElementOrder:"dmy",formatPatterns:{shortDate:"d/M/yyyy",longDate:"d MMMM yyyy",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"d MMMM yyyy H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"dd MMMM",yearMonth:"MMMM yyyy"},regexPatterns:{jan:/^ม(.(กราค)?)?/i,feb:/^ก(.(ุมภาพันธ์)?)?/i,mar:/^มี(.(นาคม)?)?/i,apr:/^เม(.(ษายน)?)?/i,may:/^พ(.(ฤษภาคม)?)?/i,jun:/^มิ(.(ถุนายน)?)?/i,jul:/^ก(.(รฎาคม)?)?/i,aug:/^ส(.(ิงหาคม)?)?/i,sep:/^ก(.(ันยายน)?)?/i,oct:/^ต(.(ุลาคม)?)?/i,nov:/^พ(.(ฤศจิกายน)?)?/i,dec:/^ธ(.(ันวาคม)?)?/i,sun:/^อ(า(.(ทิตย์)?)?)?/i,mon:/^จ((.(ันทร์)?)?)?/i,tue:/^อ((.(ังคาร)?)?)?/i,wed:/^พ((.(ุธ)?)?)?/i,thu:/^พ(ฤ(.(หัสบดี)?)?)?/i,fri:/^ศ((.(ุกร์)?)?)?/i,sat:/^ส((.(สาร์)?)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'zh_CN' :
            Date.CultureInfo={name:"zh-CN",englishName:"Chinese (People's Republic of China)",nativeName:"中文(中华人民共和国)",dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],abbreviatedDayNames:["日","一","二","三","四","五","六"],shortestDayNames:["日","一","二","三","四","五","六"],firstLetterDayNames:["日","一","二","三","四","五","六"],monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],abbreviatedMonthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],amDesignator:"上午",pmDesignator:"下午",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy/M/d",longDate:"yyyy'年'M'月'd'日'",shortTime:"H:mm",longTime:"H:mm:ss",fullDateTime:"yyyy'年'M'月'd'日' H:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"M'月'd'日'",yearMonth:"yyyy'年'M'月'"},regexPatterns:{jan:/^一月/i,feb:/^二月/i,mar:/^三月/i,apr:/^四月/i,may:/^五月/i,jun:/^六月/i,jul:/^七月/i,aug:/^八月/i,sep:/^九月/i,oct:/^十月/i,nov:/^十一月/i,dec:/^十二月/i,sun:/^星期日/i,mon:/^星期一/i,tue:/^星期二/i,wed:/^星期三/i,thu:/^星期四/i,fri:/^星期五/i,sat:/^星期六/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
        case 'zh_TW' :
            Date.CultureInfo={name:"zh-TW",englishName:"Chinese (Taiwan)",nativeName:"中文(台灣)",dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],abbreviatedDayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],shortestDayNames:["日","一","二","三","四","五","六"],firstLetterDayNames:["日","一","二","三","四","五","六"],monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],abbreviatedMonthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],amDesignator:"上午",pmDesignator:"下午",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"ymd",formatPatterns:{shortDate:"yyyy/M/d",longDate:"yyyy'年'M'月'd'日'",shortTime:"tt hh:mm",longTime:"tt hh:mm:ss",fullDateTime:"yyyy'年'M'月'd'日' tt hh:mm:ss",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"M'月'd'日'",yearMonth:"yyyy'年'M'月'"},regexPatterns:{jan:/^一月/i,feb:/^二月/i,mar:/^三月/i,apr:/^四月/i,may:/^五月/i,jun:/^六月/i,jul:/^七月/i,aug:/^八月/i,sep:/^九月/i,oct:/^十月/i,nov:/^十一月/i,dec:/^十二月/i,sun:/^星期日/i,mon:/^星期一/i,tue:/^星期二/i,wed:/^星期三/i,thu:/^星期四/i,fri:/^星期五/i,sat:/^星期六/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
            break;
    }
    var date = Date.parseExact(newDateString, fromFormat);
    
    if (psa_ptm.serverlibrary.isValidObject(newDateString) && psa_ptm.serverlibrary.isValidObject(date) && !isNaN(date)) {
        returnDate = date.toString(dateFormat);
    }
    else {
        returnDate = nlapiStringToDate(newDateString).toString(dateFormat);
    }
    
//    nlapiLogExecution('DEBUG', 'convertDateToFormat', 'nsFormat : ' + nsFormat + '; fromFormat : ' + fromFormat + '; toFormat : ' + dateFormat + '; inputString : ' + newDateString + '; returnDate : ' + returnDate + '; dateObj : ' + date);
    
    return returnDate;
};

psa_ptm.serverlibrary.getWorkCalendarPerResourceAsJson = function (workcalendarId, workCalendars) {
    
    if (workCalendars != null) {
        if (workCalendars.hasOwnProperty(workcalendarId)) {
            return workCalendars[workcalendarId];
        }
    }
    return null;
};

psa_ptm.serverlibrary.getWorkCalendars = function () {
    var searchFilter = [],
        searchColumn = [
                new nlobjSearchColumn('internalid').setSort(),
                new nlobjSearchColumn('name'),
                new nlobjSearchColumn('isdefault'),
                new nlobjSearchColumn('starthour'),
                new nlobjSearchColumn('workhoursperday'),
                new nlobjSearchColumn('sunday'),
                new nlobjSearchColumn('monday'),
                new nlobjSearchColumn('tuesday'),
                new nlobjSearchColumn('wednesday'),
                new nlobjSearchColumn('thursday'),
                new nlobjSearchColumn('friday'),
                new nlobjSearchColumn('saturday'),
                new nlobjSearchColumn('exceptiondate'),
                new nlobjSearchColumn('exceptiondescription')
            ];
    
    var search = nlapiCreateSearch('workcalendar', searchFilter, searchColumn);
    var results = search.runSearch();
    
    var cals = new Object();
    
    if (results) {
        var id;
        var prevId = -100; // random imposible id.
        
        var nonWork = new Array();
        var i = 0;
        results.forEachResult(function(searchResult) {
                
            id = searchResult.getValue('internalid');
            if (id != prevId) {
                if (i-1 >= 0) {
                    cals[prevId].nonWork = nonWork;
                    nonWork = new Array();
                }
                
                prevId = id;
                
                cals[id]             = {
                    id          : id,
                    name        : searchResult.getValue('name'),
                    isdefault   : searchResult.getValue('isdefault'),
                    starthour   : searchResult.getValue('starthour'),
                    hoursperday : searchResult.getValue('workhoursperday'),
                    sunday      : searchResult.getValue('sunday'),
                    monday      : searchResult.getValue('monday'),
                    tuesday     : searchResult.getValue('tuesday'),
                    wednesday   : searchResult.getValue('wednesday'),
                    thursday    : searchResult.getValue('thursday'),
                    friday      : searchResult.getValue('friday'),
                    saturday    : searchResult.getValue('saturday')
                };
            }
            
            if (searchResult.getValue('exceptiondate')) {
                nonWork.push({
                    'exceptiondate' : psa_ptm.serverlibrary.convertDateToFormat(searchResult.getValue('exceptiondate'), 'yyyy/MM/dd'),
                    'exceptiondescription' : searchResult.getValue('exceptiondescription')
                });    
            }
            
            i++;
            
            return true;
        });
        
        cals[id].nonWork = nonWork;
    }
    
    return cals;
};

psa_ptm.serverlibrary.isV3FiltersEmpty = function () {
    // validation : check if destination is empty
    try {
        var filters = nlapiSearchRecord('customrecord_ptm_chart_filters', null, null, [new nlobjSearchColumn('name')]);
        var settings = nlapiSearchRecord('customrecord_ptm_settings', null, null, [new nlobjSearchColumn('internalid')]);
        return (filters == null || filters.length <= 0) && (settings == null || settings.length <= 0);
    }
    catch(ex) {
        return false;
    }
};

psa_ptm.serverlibrary.migrateV2Filters = function () {
//    var context = nlapiGetContext();
//    var version = context.getVersion();
//    var major = parseInt(version.split('.')[0]);
//    var requiredMajor = '2014';
    
    var previousId = 0,
        record = null,
        CURRENT = '@CURRENT@',
        HIERARCHY = '@HIERARCHY@',
        searchFilters = [],
        searchColumns = [
                new nlobjSearchColumn('internalid').setSort(),
                new nlobjSearchColumn('owner'),
                new nlobjSearchColumn('name'),
                
                new nlobjSearchColumn('custrecord_rm_show_inactive'),
                new nlobjSearchColumn('custrecord_rm_public'),
                new nlobjSearchColumn('custrecord_rm_include_unassigned'),
                new nlobjSearchColumn('custrecord_rm_type'),
                
                new nlobjSearchColumn('custrecord_rm_name', 'custrecord_rm_parent'),
                new nlobjSearchColumn('custrecord_rm_join', 'custrecord_rm_parent'),
                new nlobjSearchColumn('custrecord_rm_operator', 'custrecord_rm_parent'),
                new nlobjSearchColumn('custrecord_rm_value1', 'custrecord_rm_parent'),
                new nlobjSearchColumn('custrecord_rm_value2', 'custrecord_rm_parent')
            ],
        search = nlapiCreateSearch('customrecord_rm_search', searchFilters, searchColumns),
        results = search.runSearch(),
        inactiveResources = psa_ptm.serverlibrary.getIntactivesAsArray('projectresource'),
        inactiveCustomers = psa_ptm.serverlibrary.getIntactivesAsArray('customer'),
        inactiveProjects = psa_ptm.serverlibrary.getIntactivesAsArray('job');
    
    results.forEachResult(function(searchResult) {
        try {
            var id = searchResult.getValue('internalid');
            var name = searchResult.getValue('name');
            var owner = searchResult.getValue('owner');
            
            if (previousId != id) {
                if (record != null) {
                    var newId = nlapiSubmitRecord(record);
                }
                
                record = nlapiCreateRecord('customrecord_ptm_chart_filters');
                
                record.setFieldValue('name', name);
                
                record.setFieldValue('custrecord_ptm_include_inactive', searchResult.getValue('custrecord_rm_show_inactive'));
                record.setFieldValue('custrecord_ptm_public', searchResult.getValue('custrecord_rm_public'));
                record.setFieldValue('custrecord_ptm_include_all_resources', searchResult.getValue('custrecord_rm_include_unassigned'));
                
                record.setFieldValue('owner', owner);
                
                previousId = id;
            }
            
            var fieldname = searchResult.getValue('custrecord_rm_name', 'custrecord_rm_parent');
            var join = searchResult.getValue('custrecord_rm_join', 'custrecord_rm_parent') || null;
            var operator = searchResult.getValue('custrecord_rm_operator', 'custrecord_rm_parent');
            var value1 = searchResult.getValue('custrecord_rm_value1', 'custrecord_rm_parent');
            var value2 = searchResult.getValue('custrecord_rm_value2', 'custrecord_rm_parent') || null;
            
            if (operator != null) { operator = operator.toLowerCase(); }
            
            if (fieldname != 'startDate') {
                value1 = value1.substring(1, value1.length-1); // removed the "[" and "]"
                value1 = value1.split(','); // convert into array
                if (fieldname == 'resource') {
                    record.setFieldValue('custrecord_ptm_assignees_mine', (value1.indexOf(CURRENT) > -1 ? 'T' : 'F'));
                    record.setFieldValue('custrecord_ptm_assignees_team', (value1.indexOf(HIERARCHY) > -1 ? 'T' : 'F'));
                    
                    value1 = value1.filter(function(element, index, array){
                        return (element != CURRENT) && (element != HIERARCHY) && inactiveResources.indexOf(element) < 0;
                    });
                    
                    record.setFieldValues('custrecord_ptm_assignees', value1);
                }
                else if (fieldname == 'customer') {
                    value1 = value1.filter(function(element, index, array){
                        return inactiveCustomers.indexOf(element) < 0;
                    });
                    
                    record.setFieldValues('custrecord_ptm_customers', value1);
                }
                else if (fieldname == 'parent') {
                    record.setFieldValues('custrecord_ptm_parent_tasks', value1);
                }
                else if (join == 'job') {
                    value1 = value1.filter(function(element, index, array){
                        return inactiveProjects.indexOf(element) < 0;
                    });
                    
                    record.setFieldValues('custrecord_ptm_projects', value1);
                }
                else {
                    record.setFieldValues('custrecord_ptm_project_tasks', value1);
                }
            }
            else {
                value1 = (value1) ? value1.toLowerCase() : value1;
                value1 = psa_ptm.serverlibrary.convertDateToFormat(value1, 'yyyy/MM/dd', 'MM/dd/yyyy'); // default format is 12/24/2014 MM/DD/YYYY
                value2 = psa_ptm.serverlibrary.convertDateToFormat(value2, 'yyyy/MM/dd', 'MM/dd/yyyy');
                
                if (join == 'projecttaskassignment') {
                    record.setFieldValue('custrecord_ptm_assign_date_operator', operator);
                    record.setFieldValue('custrecord_ptm_assign_date_value1', value1);
                    record.setFieldValue('custrecord_ptm_assign_date_value2', value2);
                }
                else {
                    record.setFieldValue('custrecord_ptm_task_date_operator', operator);
                    record.setFieldValue('custrecord_ptm_task_date_value1', value1);
                    record.setFieldValue('custrecord_ptm_task_date_value2', value2);
                }
            }
        }
        catch (ex) {
            if (ex instanceof nlobjError){
                nlapiLogExecution('ERROR','System Error', ex.getCode() + ': ' + ex.getDetails());
            }
            else {
                nlapiLogExecution('ERROR','Unexpected Error', ex);
            }
        }
        
        return true;
    });
    
    try {
        if (record != null) {
            nlapiSubmitRecord(record);
        }
    }
    catch (ex) {
        if (ex instanceof nlobjError){
            nlapiLogExecution('ERROR','System Error', ex.getCode() + ': ' + ex.getDetails());
        }
        else {
            nlapiLogExecution('ERROR','Unexpected Error', ex);
        }
    }
};

psa_ptm.serverlibrary.getIntactivesAsArray = function (searchType) {
    var results = nlapiSearchRecord(searchType, null, [new nlobjSearchFilter('isinactive', null, 'is', 'T')], [new nlobjSearchColumn('internalid')]),
        response = [];
    
    if (results != null) {
        for (var i = 0; i < results.length; i++) {
            response.push(results[i].getValue('internalid'));
        }
    }
    
    return response;
};

/**
 *  Search class
 *      - made to handle NS limitations such as governance limit and result set data limit of 1000
 *      - optimizations can be added here as well
 */
psa_ptm.serverlibrary.Search = function Search(record, filters, columns){
    /** 
     * constructor
     *  - check that required parameters are present
     *  - store parameters as class data members
     *  - ensure that filters and columns are stored as arrays if with values
     */
    this.record = record;
    this.filters = (filters && !filters.sort) ? [filters] : filters;
    this.columns = (columns && !columns.sort) ? [columns] : columns;
    if (!this.record){
        nlapiLogExecution('error', 'PTM_MISSING_PARAM_ERROR', 'Missing parameter (record) in psa_ptm.serverlibrary.search');
        throw nlapiCreateError('PTM_MISSING_PARAM_ERROR', 'Missing parameter (record) in psa_ptm.serverlibrary.search', true);
    }

    // -- PUBLIC -- //
    /** 
     * isGovernanceLimitReached
     *  - check if NS governance limit for script run is already reached
     *
     *  @returns {Boolean} - flag for passing governance limit
     */    
    this.isGovernanceLimitReached = function isGovernanceLimitReached(){
        // set the minimum governance before declaring governance limit reached
        var minGovernance = 100;
        
        // check if limit is reached
        var context = nlapiGetContext();
        var usageRemaining = context.getRemainingUsage();
        var isLimitReached = (usageRemaining < minGovernance) ? true : false;

        // log if limit is reached
        if (isLimitReached){
            nlapiLogExecution("error", "psa_ptm.serverlibrary.search", "Governance limit is already reached");
        }
        
        return isLimitReached;    
    };

    /** 
     * getResults
     *  - works like normal NS nlapiCreateSearch.getResults
     *
     * @returns {Array} - result objects     
     */    
    this.getResults = function getResults(start, end){
        this.startSearchTimer();
        
        // proceed with search
        var returnData = [];
        var search = nlapiCreateSearch(this.record, this.filters, this.columns);
        var results = search.runSearch();
        var returnData = results ? results.getResults(start, end) : [];
        
        this.stopSearchTimer('Search.getResults', returnData.length);
        
        return returnData;
    };
    
    /** 
     * getAllResults
     *  - get all search results with respect to remaining governance
     *  - choice of optimization is decided here
     *
     * @returns {Array} - result objects     
     */
    this.getAllResults = function getAllResults(){
        this.startSearchTimer();
        
        // select search method to use
        var returnData = [];
        try{
            if (this.isGoodForLimitFilters()){
                returnData = this.getAllResultsWithLimitFilters();
                this.stopSearchTimer('Search.getAllResultsWithLimitFilters', returnData.length);
            }
            else{
                returnData = this.getAllResultsWithNoOptimization();
                this.stopSearchTimer('Search.getAllResultsWithNoOptimization', returnData.length);
            }
        }
        catch(ex){
            if (ex && ex.getCode && ex.getDetails){
                nlapiLogExecution("error", "psa_ptm.serverlibrary.search.getAllResults", "ERROR: " +  ex.getCode() + "-" + ex.getDetails());
            }
            else{
                nlapiLogExecution("error", "psa_ptm.serverlibrary.search.getAllResults", "ERROR: " +  ex);
            }
            
            throw nlapiCreateError('PTM_SEARCH_ERROR', 'Error in psa_ptm.serverlibrary.search.getAllResults for record ' + this.record, true);
        }
        
        
        
        return returnData;
    };
    
    /** 
     * isGoodForLimitFilters
     *  - check if search conditions are good to use limit filters as search optimization
     *
     *  @returns {Boolean} - flag for passing limit filter pre-requisites
     */    
    this.isGoodForLimitFilters = function isGoodForLimitFilters(){
        // TODO: Find a way to work around these rules to still use limit filters optimization
        
        var isGood = true;
        
        // Rule 1: Column summary should not be used
        var isColumnSummaryUsed = false;
        if (this.columns){
            isColumnSummaryUsed = (this.columns[0].getSummary() != null);
        }
        
        // Rule 2: Internal id filter should not be used
        var isFilterAnyOfUsed = false;
        if (this.filters){
            for (var i = 0, ii = this.filters.length; i < ii; i++){
                var filter = this.filters[i];
                if (filter.getName() == 'internalid' && filter.getJoin() == null){
                    isFilterAnyOfUsed =  true;
                    break;
                }
            }
        }
        
        isGood = !isColumnSummaryUsed && !isFilterAnyOfUsed;
        
        return isGood;
    };
    
    /** 
     * getAllResultsWithLimitFilters
     *  - use limit filters as search optimization when getting all results
     *
     * @returns {Array} - result objects
     */      
    this.getAllResultsWithLimitFilters = function getAllResultsWithLimitFilters(){

        var returnData = [];
        
        // setup search markers
        var searchMarker = {
            lastIndex   : null,
            lastInternalId : null,
        };

        // perform batch data retrievals
        do {
            // set filter to exclude previously retrieved results
            var searchFilters = this.filters ? [].concat(this.filters) : [];
            if (searchMarker.lastInternalId) {
                searchFilters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto', searchMarker.lastInternalId));
                var formula = 'CASE WHEN {internalid} = ' + searchMarker.lastInternalId;
                formula += ' THEN 0 ELSE 1 END';
                searchFilters.push(new nlobjSearchFilter('formulanumeric', null, 'equalto', 1).setFormula(formula));
            }
            
            // set columns
            var searchColumns = this.columns || [];
            // remove possible duplicate column (internalid is used by limit filter optimization)
            searchColumns = searchColumns.filter(function(column){
                if (!(column.getName() == 'internalid' && column.getJoin() == null)){
                    return true;
                }
            });
            // add internal id (sorted) to be used by limit filters
            searchColumns.splice(0,0,new nlobjSearchColumn('internalid').setSort());

            // proceed with search
            var searchResults = nlapiSearchRecord(this.record, null, searchFilters, searchColumns);
            
            if (searchResults) {
                // update markers
                searchMarker.lastIndex = searchResults.length - 1;
                searchMarker.lastInternalId = searchResults[searchMarker.lastIndex].getId();            
                returnData = returnData.concat(searchResults);
            }
            else {
                searchMarker.lastIndex = 0;
            }
        }
        while (!this.isGovernanceLimitReached() && searchResults && searchResults.length > 0);

        // sort results since original sort was replaced by internalid sort used by the limit filters
        this.sortResults(returnData);

        return returnData;        
    };
    
    /** 
     * getAllResultsWithNoOptimization
     *  - use default (no optimization) search when getting all results
     *
     * @returns {Array} - result objects
     */
    this.getAllResultsWithNoOptimization = function getAllResultsWithNoOptimization(){

        var returnData = [];
        var search = nlapiCreateSearch(this.record, this.filters, this.columns);
        var results = search.runSearch();
        
        // perform batch data retrievals until all results are retrieved or until governance limit is already reached
        if (results){
            var start = 0;        
            var end = NS_LIMIT = 1000;
            do {            
                var searchResult = results.getResults(start, end) || [];
                returnData = returnData.concat(searchResult);
                var isLastSetRetrieved = searchResult.length < NS_LIMIT;
                start += NS_LIMIT;
                end += NS_LIMIT;
            }
            while (!this.isGovernanceLimitReached() && !isLastSetRetrieved);
        }

        return returnData;
    }

    /** 
     * sortResults
     *  - sort the results based on the saved column sort states
     *
     * @param results {Array}
     */
    this.sortResults = function sortResults(results){
        if (results && results.length > 0){
            var sortBy = this.buildSortArray();
            var sortFunction = this.buildSortFunction(sortBy);
            if (sortFunction){
                results.sort(sortFunction);
            }        
        }
    };
    
    /** 
     * buildSortArray
     *  - build sorting array by priority
     *
     * @returns {Array} - objects containing sort details (name, join, order)
     */    
    this.buildSortArray = function buildSortArray(){
        var sortBy = [];
        for (var i = 0, ii = this.columns.length; i < ii; i++){
            var column = this.columns[i];
            var sorting = column.getSort();
            if (sorting){
                sortBy.push({
                    name    : column.getName(),
                    join    : column.getJoin(),
                    order   : sorting   //can be 'ASC' or 'DESC'
                })
            }
        }
        return sortBy;
    };
    
    /** 
     * buildSortFunction
     *  - build sort function to be used by the array of results
     *
     * @returns {Object} - sort function to be used by result data array
     */    
    this.buildSortFunction = function buildSortFunction(sortBy){
        var sortFunction = null;
        if (sortBy.length > 0){
            sortFunction = function(resultA, resultB){
                var comparisonValues = [];
                for (var i = 0, ii = sortBy.length; i < ii; i++){
                    var valueA = resultA.getValue(sortBy[i].name, sortBy[i].join);
                    var valueB = resultB.getValue(sortBy[i].name, sortBy[i].join);                    
                    comparisonValues.push([valueA, valueB]);
                }
                for (var i = 0, ii = comparisonValues.length; i < ii; i++){
                    var origA = comparisonValues[i][0];
                    var origB = comparisonValues[i][1];
                    var valueA = origA.toLowerCase();
                    var valueB = origB.toLowerCase();
                    if (sortBy[i].order == 'ASC'){
                        if (valueA == valueB) return origA > origB;
                        if (valueA > valueB) return 1;
                        if (valueA < valueB) return -1;
                    }
                    else if (sortBy[i].order == 'DESC'){
                        if (valueA == valueB) return origA < origB;
                        if (valueA < valueB) return 1;
                        if (valueA > valueB) return -1;                    
                    }
                }
                return 0;            
            };
        }
        return sortFunction;
    };
    
    /** 
     * startSearchTimer
     *  - records the start date before running search
     */      
    this.searchStartTime = null;
    this.startSearchTimer = function startSearchTimer(){
        this.searchStartTime = new Date();
    };
    
    /** 
     * stopSearchTimer
     *  - calculates total search run time then logs it
     */          
    this.stopSearchTimer = function stopSearchTimer(title, dataLength){
        var runTime = (new Date()) - this.searchStartTime;

        // log run time
        nlapiLogExecution("debug", title, "Search time for " + title + " (" + dataLength + ") of " +  this.record + " is " + runTime + "ms");        
    }

};

psa_ptm.serverlibrary.searchFile = function searchFile(fileName) {
    var searchFilter = [
        new nlobjSearchFilter('name', null, 'is', fileName)
    ];
    var searchColumn = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('folder')
    ];
    var results = nlapiSearchRecord('file', null, searchFilter, searchColumn);
    
    return results;
};

psa_ptm.serverlibrary.searchFolder = function searchFolder(folderId) {
    var searchFilter = [
        new nlobjSearchFilter('internalid', null, 'is', folderId)
    ];
    var searchColumn = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('parent')
    ];
    var results = nlapiSearchRecord('folder', null, searchFilter, searchColumn);
    
    return results;
};

psa_ptm.serverlibrary.getFileHtmlCode = function getFileHtmlCode(fileName, bundleID) {
    var results = psa_ptm.serverlibrary.searchFile(fileName);
    /*
     * evaluate results
     * if null, throw an error
     * if exactly one, return the html code 
     * if more than one, find the correct file by making sure it is under the correct bundle folder, then return the html code
     */
    if (results == null) {
        throw 'No results; File: ' + fileName;
    } else {
        var fileIdx = 0;
        /*
         * correct the fileIdx if more than 1 result
         */
        if (results.length > 1) {
            nlapiLogExecution('DEBUG', 'Duplicate Filename', 'Found multiple files with name ' + fileName);
            var bundleFolder = 'Bundle ' + bundleID;
            for ( var i in results) {
                var result = results[i];
                var parentId = result.getValue('folder');
                var parentName = null;
                do {
                    var _result = psa_ptm.serverlibrary.searchFolder(parentId);
                    if (_result) {
                        parentName = _result[0].getValue('name');
                        if (parentName == bundleFolder) {
                            fileIdx = i;
                            parentId = '';
                            nlapiLogExecution('DEBUG', 'Duplicate Filename Resolved', 'Found file with correct parent folder "' + bundleFolder + '"');
                        } else {
                            parentId = _result[0].getValue('parent');
                        }
                    }
                } while (parentId != '');
            };
        }
        /*
         * resolve mediaitem URL
         */
        var fileId = results[fileIdx].getId();
        var url = nlapiResolveURL('mediaitem', fileId);
        /*
         * return corresponding html code
         */
        if (fileName.indexOf('.css') > -1) {
            return '<link type="text/css" rel="stylesheet" href="' + url + '" />';
        }
        if (fileName.indexOf('.js') > -1) {
            return '<script type="text/javascript" src="' + url + '"></script>';
        }
    }
};
