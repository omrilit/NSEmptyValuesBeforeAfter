/*
Datejs MIT License
Copyright (c) 2006-2010, Coolite Inc. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

* Version: 1.0 Alpha-1 
* Build Date: 13-Nov-2007
* Copyright (c) 2006-2007, Coolite Inc. (http://www.coolite.com/). All rights reserved.
* License: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/. 
* Website: http://www.datejs.com/ or http://www.coolite.com/datejs/
*/

Date.CultureInfo_en = {
	/* Culture Name */
    name: "en-US",
    englishName: "English (United States)",
    nativeName: "English (United States)",
    
    /* Day Name Strings */
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    firstLetterDayNames: ["S", "M", "T", "W", "T", "F", "S"],
    
    /* Month Name Strings */
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

	/* AM/PM Designators */
    amDesignator: "AM",
    pmDesignator: "PM",

    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,

    dateElementOrder: "mdy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "M/d/yyyy",
        longDate: "dddd, MMMM dd, yyyy",
        shortTime: "h:mm tt",
        longTime: "h:mm:ss tt",
        fullDateTime: "dddd, MMMM dd, yyyy h:mm:ss tt",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "MMMM dd",
        yearMonth: "MMMM, yyyy"
    },

    regexPatterns: {
        jan: /^jan(uary)?/i,
        feb: /^feb(ruary)?/i,
        mar: /^mar(ch)?/i,
        apr: /^apr(il)?/i,
        may: /^may/i,
        jun: /^jun(e)?/i,
        jul: /^jul(y)?/i,
        aug: /^aug(ust)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^oct(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^su(n(day)?)?/i,
        mon: /^mo(n(day)?)?/i,
        tue: /^tu(e(s(day)?)?)?/i,
        wed: /^we(d(nesday)?)?/i,
        thu: /^th(u(r(s(day)?)?)?)?/i,
        fri: /^fr(i(day)?)?/i,
        sat: /^sa(t(urday)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }   
};

Date.CultureInfo_es = {
	/* Culture Name */
    name: "es-ES",
    englishName: "Spanish (Spain)",
    nativeName: "español (España)",
    
    /* Day Name Strings */
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    abbreviatedDayNames: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    shortestDayNames: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"],
    firstLetterDayNames: ["D", "L", "M", "M", "J", "V", "S"],
    
    /* Month Name Strings */
    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    abbreviatedMonthNames: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
  
    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "dd/MM/yyyy",
        longDate: "dddd, dd' de 'MMMM' de 'yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "dddd, dd' de 'MMMM' de 'yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM' de 'yyyy"
    },

    regexPatterns: {
        jan: /^ene(ro)?/i,
        feb: /^feb(rero)?/i,
        mar: /^mar(zo)?/i,
        apr: /^abr(il)?/i,
        may: /^may(o)?/i,
        jun: /^jun(io)?/i,
        jul: /^jul(io)?/i,
        aug: /^ago(sto)?/i,
        sep: /^sep(tiembre)?/i,
        oct: /^oct(ubre)?/i,
        nov: /^nov(iembre)?/i,
        dec: /^dic(iembre)?/i,

        sun: /^do(m(ingo)?)?/i,
        mon: /^lu(n(es)?)?/i,
        tue: /^ma(r(tes)?)?/i,
        wed: /^mi(é(rcoles)?)?/i,
        thu: /^ju(e(ves)?)?/i,
        fri: /^vi(e(rnes)?)?/i,
        sat: /^sá(b(ado)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_pt =  {
	/* Culture Name */
    name: "pt-PT",
    englishName: "Portuguese (Portugal)",
    nativeName: "português (Portugal)",
    
    /* Day Name Strings */
    dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    abbreviatedDayNames: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    shortestDayNames: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    firstLetterDayNames: ["D", "S", "T", "Q", "Q", "S", "S"],
    
    /* Month Name Strings */
    monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    abbreviatedMonthNames: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
  
    dateElementOrder: "dmy",
    
    formatPatterns: {
        shortDate: "dd-MM-yyyy",
        longDate: "dddd, d' de 'MMMM' de 'yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "dddd, d' de 'MMMM' de 'yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d/M",
        yearMonth: "MMMM' de 'yyyy"
    },

    regexPatterns: {
        jan: /^jan(eiro)?/i,
        feb: /^fev(ereiro)?/i,
        mar: /^mar(ço)?/i,
        apr: /^abr(il)?/i,
        may: /^mai(o)?/i,
        jun: /^jun(ho)?/i,
        jul: /^jul(ho)?/i,
        aug: /^ago(sto)?/i,
        sep: /^set(embro)?/i,
        oct: /^out(ubro)?/i,
        nov: /^nov(embro)?/i,
        dec: /^dez(embro)?/i,

        sun: /^domingo/i,
        mon: /^segunda-feira/i,
        tue: /^terça-feira/i,
        wed: /^quarta-feira/i,
        thu: /^quinta-feira/i,
        fri: /^sexta-feira/i,
        sat: /^sábado/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },
    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }   
};

Date.CultureInfo_fr = {
	/* Culture Name */
    name: "fr-FR",
    englishName: "French (France)",
    nativeName: "français (France)",
    
    /* Day Name Strings */
    dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    abbreviatedDayNames: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
    shortestDayNames: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    firstLetterDayNames: ["D", "L", "M", "M", "J", "V", "S"],
    
    /* Month Name Strings */
    monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    abbreviatedMonthNames: ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "dmy",
    
    formatPatterns: {
        shortDate: "dd/MM/yyyy",
        longDate: "dddd d MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "dddd d MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^janv(.(ier)?)?/i,
        feb: /^févr(.(ier)?)?/i,
        mar: /^mars/i,
        apr: /^avr(.(il)?)?/i,
        may: /^mai/i,
        jun: /^juin/i,
        jul: /^juil(.(let)?)?/i,
        aug: /^août/i,
        sep: /^sept(.(embre)?)?/i,
        oct: /^oct(.(obre)?)?/i,
        nov: /^nov(.(embre)?)?/i,
        dec: /^déc(.(embre)?)?/i,

        sun: /^di(m(.(anche)?)?)?/i,
        mon: /^lu(n(.(di)?)?)?/i,
        tue: /^ma(r(.(di)?)?)?/i,
        wed: /^me(r(.(credi)?)?)?/i,
        thu: /^je(u(.(di)?)?)?/i,
        fri: /^ve(n(.(dredi)?)?)?/i,
        sat: /^sa(m(.(edi)?)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_de = {
	/* Culture Name */
    name: "de-DE",
    englishName: "German (Germany)",
    nativeName: "Deutsch (Deutschland)",
    
    /* Day Name Strings */
    dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    abbreviatedDayNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    shortestDayNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    firstLetterDayNames: ["S", "M", "D", "M", "D", "F", "S"],
    
    /* Month Name Strings */
    monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    formatPatterns: {
        shortDate: "dd.MM.yyyy",
        longDate: "dddd, d. MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "dddd, d. MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uar)?/i,
        feb: /^feb(ruar)?/i,
        mar: /^märz/i,
        apr: /^apr(il)?/i,
        may: /^mai/i,
        jun: /^jun(i)?/i,
        jul: /^jul(i)?/i,
        aug: /^aug(ust)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dez(ember)?/i,

        sun: /^sonntag/i,
        mon: /^montag/i,
        tue: /^dienstag/i,
        wed: /^mittwoch/i,
        thu: /^donnerstag/i,
        fri: /^freitag/i,
        sat: /^samstag/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
};

Date.CultureInfo_du = {
	/* Culture Name */
    name: "nl-NL",
    englishName: "Dutch (Netherlands)",
    nativeName: "Nederlands (Nederland)",
    
    /* Day Name Strings */
    dayNames: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
    abbreviatedDayNames: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
    shortestDayNames: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
    firstLetterDayNames: ["Z", "M", "D", "W", "D", "V", "Z"],
    
    /* Month Name Strings */
    monthNames: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d-M-yyyy",
        longDate: "dddd d MMMM yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "dddd d MMMM yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uari)?/i,
        feb: /^feb(ruari)?/i,
        mar: /^maart/i,
        apr: /^apr(il)?/i,
        may: /^mei/i,
        jun: /^jun(i)?/i,
        jul: /^jul(i)?/i,
        aug: /^aug(ustus)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^zondag/i,
        mon: /^maandag/i,
        tue: /^dinsdag/i,
        wed: /^woensdag/i,
        thu: /^donderdag/i,
        fri: /^vrijdag/i,
        sat: /^zaterdag/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }  
};

Date.CultureInfo_da = {
	/* Culture Name */
    name: "da-DK",
    englishName: "Danish (Denmark)",
    nativeName: "dansk (Danmark)",
    
    /* Day Name Strings */
    dayNames: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"],
    abbreviatedDayNames: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"],
    shortestDayNames: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"],
    firstLetterDayNames: ["S", "M", "T", "O", "T", "F", "L"],
    
    /* Month Name Strings */
    monthNames: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "dd-MM-yyyy",
        longDate: "d. MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "d. MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d. MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uar)?/i,
        feb: /^feb(ruar)?/i,
        mar: /^mar(ts)?/i,
        apr: /^apr(il)?/i,
        may: /^maj/i,
        jun: /^jun(i)?/i,
        jul: /^jul(i)?/i,
        aug: /^aug(ust)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^søndag/i,
        mon: /^mandag/i,
        tue: /^tirsdag/i,
        wed: /^onsdag/i,
        thu: /^torsdag/i,
        fri: /^fredag/i,
        sat: /^lørdag/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
};

Date.CultureInfo_ro = {
	/* Culture Name */
    name: "ro-RO",
    englishName: "Romanian (Romania)",
    nativeName: "română (România)",
    
    /* Day Name Strings */
    dayNames: ["Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă"],
    abbreviatedDayNames: ["D", "L", "Ma", "Mi", "J", "V", "S"],
    shortestDayNames: ["D", "L", "Ma", "Mi", "J", "V", "S"],
    firstLetterDayNames: ["D", "L", "M", "M", "J", "V", "S"],
    
    /* Month Name Strings */
    monthNames: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"],
    abbreviatedMonthNames: ["Ian.", "Feb.", "Mar.", "Apr.", "Mai.", "Iun.", "Iul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "dd.MM.yyyy",
        longDate: "d MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "d MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^ian(.(uarie)?)?/i,
        feb: /^feb(.(ruarie)?)?/i,
        mar: /^mar(.(tie)?)?/i,
        apr: /^apr(.(ilie)?)?/i,
        may: /^mai(.()?)?/i,
        jun: /^iun(.(ie)?)?/i,
        jul: /^iul(.(ie)?)?/i,
        aug: /^aug(.(ust)?)?/i,
        sep: /^sep(.(tembrie)?)?/i,
        oct: /^oct(.(ombrie)?)?/i,
        nov: /^noiembrie/i,
        dec: /^dec(.(embrie)?)?/i,

        sun: /^duminică/i,
        mon: /^luni/i,
        tue: /^marţi/i,
        wed: /^miercuri/i,
        thu: /^joi/i,
        fri: /^vineri/i,
        sat: /^sâmbătă/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_bg = {
	/* Culture Name */
    name: "bg-BG",
    englishName: "Bulgarian (Bulgaria)",
    nativeName: "български (България)",
    
    /* Day Name Strings */
    dayNames: ["неделя", "понеделник", "вторник", "сряда", "четвъртък", "петък", "събота"],
    abbreviatedDayNames: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    shortestDayNames: ["не", "по", "вт", "ср", "че", "пе", "съ"],
    firstLetterDayNames: ["н", "п", "в", "с", "ч", "п", "с"],
    
    /* Month Name Strings */
    monthNames: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
    abbreviatedMonthNames: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "dd.M.yyyy 'г.'",
        longDate: "dd MMMM yyyy 'г.'",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "dd MMMM yyyy 'г.' HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy 'г.'"
    },

    regexPatterns: {
        jan: /^януари/i,
        feb: /^февруари/i,
        mar: /^март/i,
        apr: /^април/i,
        may: /^май/i,
        jun: /^юни/i,
        jul: /^юли/i,
        aug: /^август/i,
        sep: /^септември/i,
        oct: /^октомври/i,
        nov: /^ноември/i,
        dec: /^декември/i,

        sun: /^не((деля)?)?/i,
        mon: /^по((неделник)?)?/i,
        tue: /^вторник/i,
        wed: /^сряда/i,
        thu: /^че((твъртък)?)?/i,
        fri: /^пе((тък)?)?/i,
        sat: /^съ((бота)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_zh = {
	/* Culture Name */
    name: "zh-TW",
    englishName: "Chinese (Taiwan)",
    nativeName: "中文(台灣)",
    
    /* Day Name Strings */
    dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    abbreviatedDayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortestDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    firstLetterDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    
    /* Month Name Strings */
    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    abbreviatedMonthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],

	/* AM/PM Designators */
    amDesignator: "上午",
    pmDesignator: "下午",

    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,

    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy/M/d",
        longDate: "yyyy'年'M'月'd'日'",
        shortTime: "tt hh:mm",
        longTime: "tt hh:mm:ss",
        fullDateTime: "yyyy'年'M'月'd'日' tt hh:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "M'月'd'日'",
        yearMonth: "yyyy'年'M'月'"
    },
	
    regexPatterns: {
        jan: /^一月/i,
        feb: /^二月/i,
        mar: /^三月/i,
        apr: /^四月/i,
        may: /^五月/i,
        jun: /^六月/i,
        jul: /^七月/i,
        aug: /^八月/i,
        sep: /^九月/i,
        oct: /^十月/i,
        nov: /^十一月/i,
        dec: /^十二月/i,

        sun: /^星期日/i,
        mon: /^星期一/i,
        tue: /^星期二/i,
        wed: /^星期三/i,
        thu: /^星期四/i,
        fri: /^星期五/i,
        sat: /^星期六/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_cn = {
	/* Culture Name */
    name: "zh-CN",
    englishName: "Chinese (People's Republic of China)",
    nativeName: "中文(中华人民共和国)",
    
    /* Day Name Strings */
    dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    abbreviatedDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    shortestDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    firstLetterDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    
    /* Month Name Strings */
    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    abbreviatedMonthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],

	/* AM/PM Designators */
    amDesignator: "上午",
    pmDesignator: "下午",

    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,
    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy/M/d",
        longDate: "yyyy'年'M'月'd'日'",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "yyyy'年'M'月'd'日' H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "M'月'd'日'",
        yearMonth: "yyyy'年'M'月'"
    },

    regexPatterns: {
        jan: /^一月/i,
        feb: /^二月/i,
        mar: /^三月/i,
        apr: /^四月/i,
        may: /^五月/i,
        jun: /^六月/i,
        jul: /^七月/i,
        aug: /^八月/i,
        sep: /^九月/i,
        oct: /^十月/i,
        nov: /^十一月/i,
        dec: /^十二月/i,

        sun: /^星期日/i,
        mon: /^星期一/i,
        tue: /^星期二/i,
        wed: /^星期三/i,
        thu: /^星期四/i,
        fri: /^星期五/i,
        sat: /^星期六/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_cs = {
	/* Culture Name */
    name: "cs-CZ",
    englishName: "Czech (Czech Republic)",
    nativeName: "čeština (Česká republika)",
    
    /* Day Name Strings */
    dayNames: ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"],
    abbreviatedDayNames: ["ne", "po", "út", "st", "čt", "pá", "so"],
    shortestDayNames: ["ne", "po", "út", "st", "čt", "pá", "so"],
    firstLetterDayNames: ["n", "p", "ú", "s", "č", "p", "s"],
    
    /* Month Name Strings */
    monthNames: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
    abbreviatedMonthNames: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"],

	/* AM/PM Designators */
    amDesignator: "dop.",
    pmDesignator: "odp.",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d.M.yyyy",
        longDate: "d. MMMM yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "d. MMMM yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^leden/i,
        feb: /^únor/i,
        mar: /^březen/i,
        apr: /^duben/i,
        may: /^květen/i,
        jun: /^červen/i,
        jul: /^červenec/i,
        aug: /^srpen/i,
        sep: /^září/i,
        oct: /^říjen/i,
        nov: /^listopad/i,
        dec: /^prosinec/i,

        sun: /^neděle/i,
        mon: /^pondělí/i,
        tue: /^úterý/i,
        wed: /^středa/i,
        thu: /^čtvrtek/i,
        fri: /^pátek/i,
        sat: /^sobota/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_sv = {
	/* Culture Name */
    name: "sv-SE",
    englishName: "Swedish (Sweden)",
    nativeName: "svenska (Sverige)",
    
    /* Day Name Strings */
    dayNames: ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"],
    abbreviatedDayNames: ["sö", "må", "ti", "on", "to", "fr", "lö"],
    shortestDayNames: ["sö", "må", "ti", "on", "to", "fr", "lö"],
    firstLetterDayNames: ["s", "m", "t", "o", "t", "f", "l"],
    
    /* Month Name Strings */
    monthNames: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    abbreviatedMonthNames: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy-MM-dd",
        longDate: "'den 'd MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "'den 'd MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "'den 'd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uari)?/i,
        feb: /^feb(ruari)?/i,
        mar: /^mar(s)?/i,
        apr: /^apr(il)?/i,
        may: /^maj/i,
        jun: /^jun(i)?/i,
        jul: /^jul(i)?/i,
        aug: /^aug(usti)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^söndag/i,
        mon: /^måndag/i,
        tue: /^tisdag/i,
        wed: /^onsdag/i,
        thu: /^torsdag/i,
        fri: /^fredag/i,
        sat: /^lördag/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_th = {
	/* Culture Name */
    name: "th-TH",
    englishName: "Thai (Thailand)",
    nativeName: "ไทย (ไทย)",
    
    /* Day Name Strings */
    dayNames: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
    abbreviatedDayNames: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
    shortestDayNames: ["อ", "จ", "อ", "พ", "พ", "ศ", "ส"],
    firstLetterDayNames: ["อ", "จ", "อ", "พ", "พ", "ศ", "ส"],
    
    /* Month Name Strings */
    monthNames: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
    abbreviatedMonthNames: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],

	/* AM/PM Designators */
    amDesignator: "AM",
    pmDesignator: "PM",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2572,
 
    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d/M/yyyy",
        longDate: "d MMMM yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "d MMMM yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^ม(.(กราค)?)?/i,
        feb: /^ก(.(ุมภาพันธ์)?)?/i,
        mar: /^มี(.(นาคม)?)?/i,
        apr: /^เม(.(ษายน)?)?/i,
        may: /^พ(.(ฤษภาคม)?)?/i,
        jun: /^มิ(.(ถุนายน)?)?/i,
        jul: /^ก(.(รฎาคม)?)?/i,
        aug: /^ส(.(ิงหาคม)?)?/i,
        sep: /^ก(.(ันยายน)?)?/i,
        oct: /^ต(.(ุลาคม)?)?/i,
        nov: /^พ(.(ฤศจิกายน)?)?/i,
        dec: /^ธ(.(ันวาคม)?)?/i,

        sun: /^อ(า(.(ทิตย์)?)?)?/i,
        mon: /^จ((.(ันทร์)?)?)?/i,
        tue: /^อ((.(ังคาร)?)?)?/i,
        wed: /^พ((.(ุธ)?)?)?/i,
        thu: /^พ(ฤ(.(หัสบดี)?)?)?/i,
        fri: /^ศ((.(ุกร์)?)?)?/i,
        sat: /^ส((.(สาร์)?)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_sr = {
	/* Culture Name */
    name: "sr-Cyrl-CS",
    englishName: "Serbian (Cyrillic, Serbia)",
    nativeName: "српски (Србија)",
    
    /* Day Name Strings */
    dayNames: ["недеља", "понедељак", "уторак", "среда", "четвртак", "петак", "субота"],
    abbreviatedDayNames: ["нед", "пон", "уто", "сре", "чет", "пет", "суб"],
    shortestDayNames: ["не", "по", "ут", "ср", "че", "пе", "су"],
    firstLetterDayNames: ["н", "п", "у", "с", "ч", "п", "с"],
    
    /* Month Name Strings */
    monthNames: ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"],
    abbreviatedMonthNames: ["јан", "феб", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "нов", "дец"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d.M.yyyy",
        longDate: "d. MMMM yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "d. MMMM yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d. MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^јан(уар)?/i,
        feb: /^феб(руар)?/i,
        mar: /^мар(т)?/i,
        apr: /^апр(ил)?/i,
        may: /^мај/i,
        jun: /^јун/i,
        jul: /^јул/i,
        aug: /^авг(уст)?/i,
        sep: /^сеп(тембар)?/i,
        oct: /^окт(обар)?/i,
        nov: /^нов(ембар)?/i,
        dec: /^дец(ембар)?/i,

        sun: /^не(д(еља)?)?/i,
        mon: /^по(н(едељак)?)?/i,
        tue: /^ут(о(рак)?)?/i,
        wed: /^ср(е(да)?)?/i,
        thu: /^че(т(вртак)?)?/i,
        fri: /^пе(т(ак)?)?/i,
        sat: /^су(б(ота)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_sl = {
	/* Culture Name */
    name: "sl-SI",
    englishName: "Slovenian (Slovenia)",
    nativeName: "slovenski (Slovenija)",
    
    /* Day Name Strings */
    dayNames: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Cetrtek", "Petek", "Sobota"],
    abbreviatedDayNames: ["Ned", "Pon", "Tor", "Sre", "Cet", "Pet", "Sob"],
    shortestDayNames: ["Ne", "Po", "To", "Sr", "Ce", "Pe", "So"],
    firstLetterDayNames: ["N", "P", "T", "S", "C", "S", "S"],
    
    /* Month Name Strings */
    monthNames: ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d.M.yyyy",
        longDate: "d. MMMM yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "d. MMMM yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d. MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uar)?/i,
        feb: /^feb(ruar)?/i,
        mar: /^mar(ec)?/i,
        apr: /^apr(il)?/i,
        may: /^maj/i,
        jun: /^jun(ij)?/i,
        jul: /^jul(ij)?/i,
        aug: /^avg(ust)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^ne(d(elja)?)?/i,
        mon: /^po(n(edeljek)?)?/i,
        tue: /^to(r(ek)?)?/i,
        wed: /^sr(e(da)?)?/i,
        thu: /^ce(t(rtek)?)?/i,
        fri: /^pe(t(ek)?)?/i,
        sat: /^so(b(ota)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_pl = {
	/* Culture Name */
    name: "pl-PL",
    englishName: "Polish (Poland)",
    nativeName: "polski (Polska)",
    
    /* Day Name Strings */
    dayNames: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"],
    abbreviatedDayNames: ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
    shortestDayNames: ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
    firstLetterDayNames: ["N", "P", "W", "Ś", "C", "P", "S"],
    
    /* Month Name Strings */
    monthNames: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
    abbreviatedMonthNames: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy-MM-dd",
        longDate: "d MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "d MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^sty(czeń)?/i,
        feb: /^lut(y)?/i,
        mar: /^mar(zec)?/i,
        apr: /^kwi(ecień)?/i,
        may: /^maj/i,
        jun: /^cze(rwiec)?/i,
        jul: /^lip(iec)?/i,
        aug: /^sie(rpień)?/i,
        sep: /^wrz(esień)?/i,
        oct: /^paź(dziernik)?/i,
        nov: /^lis(topad)?/i,
        dec: /^gru(dzień)?/i,

        sun: /^niedziela/i,
        mon: /^poniedziałek/i,
        tue: /^wtorek/i,
        wed: /^środa/i,
        thu: /^czwartek/i,
        fri: /^piątek/i,
        sat: /^sobota/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_kr = {
	/* Culture Name */
    name: "ko-KR",
    englishName: "Korean (Korea)",
    nativeName: "한국어 (대한민국)",
    
    /* Day Name Strings */
    dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    abbreviatedDayNames: ["일", "월", "화", "수", "목", "금", "토"],
    shortestDayNames: ["일", "월", "화", "수", "목", "금", "토"],
    firstLetterDayNames: ["일", "월", "화", "수", "목", "금", "토"],
    
    /* Month Name Strings */
    monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    abbreviatedMonthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],

	/* AM/PM Designators */
    amDesignator: "오전",
    pmDesignator: "오후",

    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,

    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy-MM-dd",
        longDate: "yyyy'년' M'월' d'일' dddd",
        shortTime: "tt h:mm",
        longTime: "tt h:mm:ss",
        fullDateTime: "yyyy'년' M'월' d'일' dddd tt h:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "M'월' d'일'",
        yearMonth: "yyyy'년' M'월'"
    },

    regexPatterns: {
        jan: /^1(월)?/i,
        feb: /^2(월)?/i,
        mar: /^3(월)?/i,
        apr: /^4(월)?/i,
        may: /^5(월)?/i,
        jun: /^6(월)?/i,
        jul: /^7(월)?/i,
        aug: /^8(월)?/i,
        sep: /^9(월)?/i,
        oct: /^10(월)?/i,
        nov: /^11(월)?/i,
        dec: /^12(월)?/i,

        sun: /^일요일/i,
        mon: /^월요일/i,
        tue: /^화요일/i,
        wed: /^수요일/i,
        thu: /^목요일/i,
        fri: /^금요일/i,
        sat: /^토요일/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_el = {
	/* Culture Name */
    name: "el-GR",
    englishName: "Greek (Greece)",
    nativeName: "ελληνικά (Ελλάδα)",
    
    /* Day Name Strings */
    dayNames: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
    abbreviatedDayNames: ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"],
    shortestDayNames: ["Κυ", "Δε", "Τρ", "Τε", "Πε", "Πα", "Σά"],
    firstLetterDayNames: ["Κ", "Δ", "Τ", "Τ", "Π", "Π", "Σ"],
    
    /* Month Name Strings */
    monthNames: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    abbreviatedMonthNames: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαϊ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"],

	/* AM/PM Designators */
    amDesignator: "πμ",
    pmDesignator: "μμ",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d/M/yyyy",
        longDate: "dddd, d MMMM yyyy",
        shortTime: "h:mm tt",
        longTime: "h:mm:ss tt",
        fullDateTime: "dddd, d MMMM yyyy h:mm:ss tt",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^ιαν(ουάριος)?/i,
        feb: /^φεβ(ρουάριος)?/i,
        mar: /^μάρτιος/i,
        apr: /^απρ(ίλιος)?/i,
        may: /^μάιος/i,
        jun: /^ιούνιος/i,
        jul: /^ιούλιος/i,
        aug: /^αύγουστος/i,
        sep: /^σεπ(τέμβριος)?/i,
        oct: /^οκτ(ώβριος)?/i,
        nov: /^νοέμβριος/i,
        dec: /^δεκ(έμβριος)?/i,

        sun: /^κυ(ρ(ιακή)?)?/i,
        mon: /^δε(υ(τέρα)?)?/i,
        tue: /^τρ(ι(τη)?)?/i,
        wed: /^τε(τ(άρτη)?)?/i,
        thu: /^πε(μ(πτη)?)?/i,
        fri: /^πα(ρ(ασκευή)?)?/i,
        sat: /^σά(β(βατο)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_it = {
	/* Culture Name */
    name: "it-IT",
    englishName: "Italian (Italy)",
    nativeName: "italiano (Italia)",
    
    /* Day Name Strings */
     dayNames: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
    abbreviatedDayNames: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
    shortestDayNames: ["do", "lu", "ma", "me", "gi", "ve", "sa"],
    firstLetterDayNames: ["d", "l", "m", "m", "g", "v", "s"],
    
    /* Month Name Strings */
    monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    abbreviatedMonthNames: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "dd/MM/yyyy",
        longDate: "dddd d MMMM yyyy",
        shortTime: "H.mm",
        longTime: "H.mm.ss",
        fullDateTime: "dddd d MMMM yyyy H.mm.ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "dd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^gen(naio)?/i,
        feb: /^feb(braio)?/i,
        mar: /^mar(zo)?/i,
        apr: /^apr(ile)?/i,
        may: /^mag(gio)?/i,
        jun: /^giu(gno)?/i,
        jul: /^lug(lio)?/i,
        aug: /^ago(sto)?/i,
        sep: /^set(tembre)?/i,
        oct: /^ott(obre)?/i,
        nov: /^nov(embre)?/i,
        dec: /^dic(embre)?/i,

        sun: /^do(m(enica)?)?/i,
        mon: /^lu(n(edì)?)?/i,
        tue: /^ma(r(tedì)?)?/i,
        wed: /^me(r(coledì)?)?/i,
        thu: /^gi(o(vedì)?)?/i,
        fri: /^ve(n(erdì)?)?/i,
        sat: /^sa(b(ato)?)?/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_sv = {
	/* Culture Name */
    name: "sv-SE",
    englishName: "Swedish (Sweden)",
    nativeName: "svenska (Sverige)",
    
  /* Day Name Strings */
    dayNames: ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"],
    abbreviatedDayNames: ["sö", "må", "ti", "on", "to", "fr", "lö"],
    shortestDayNames: ["sö", "må", "ti", "on", "to", "fr", "lö"],
    firstLetterDayNames: ["s", "m", "t", "o", "t", "f", "l"],
    
    /* Month Name Strings */
    monthNames: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    abbreviatedMonthNames: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,
    
    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy-MM-dd",
        longDate: "'den 'd MMMM yyyy",
        shortTime: "HH:mm",
        longTime: "HH:mm:ss",
        fullDateTime: "'den 'd MMMM yyyy HH:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "'den 'd MMMM",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^jan(uari)?/i,
        feb: /^feb(ruari)?/i,
        mar: /^mar(s)?/i,
        apr: /^apr(il)?/i,
        may: /^maj/i,
        jun: /^jun(i)?/i,
        jul: /^jul(i)?/i,
        aug: /^aug(usti)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^okt(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,

        sun: /^söndag/i,
        mon: /^måndag/i,
        tue: /^tisdag/i,
        wed: /^onsdag/i,
        thu: /^torsdag/i,
        fri: /^fredag/i,
        sat: /^lördag/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_zh_tw = {
	/* Culture Name */
    name: "zh-TW",
    englishName: "Chinese (Taiwan)",
    nativeName: "中文(台灣)",
    
    /* Day Name Strings */
    dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    abbreviatedDayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortestDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    firstLetterDayNames: ["日", "一", "二", "三", "四", "五", "六"],
    
    /* Month Name Strings */
    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    abbreviatedMonthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],

	/* AM/PM Designators */
    amDesignator: "上午",
    pmDesignator: "下午",

    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,
 
    dateElementOrder: "ymd",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "yyyy/M/d",
        longDate: "yyyy'年'M'月'd'日'",
        shortTime: "tt hh:mm",
        longTime: "tt hh:mm:ss",
        fullDateTime: "yyyy'年'M'月'd'日' tt hh:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "M'月'd'日'",
        yearMonth: "yyyy'年'M'月'"
    },

    regexPatterns: {
        jan: /^一月/i,
        feb: /^二月/i,
        mar: /^三月/i,
        apr: /^四月/i,
        may: /^五月/i,
        jun: /^六月/i,
        jul: /^七月/i,
        aug: /^八月/i,
        sep: /^九月/i,
        oct: /^十月/i,
        nov: /^十一月/i,
        dec: /^十二月/i,

        sun: /^星期日/i,
        mon: /^星期一/i,
        tue: /^星期二/i,
        wed: /^星期三/i,
        thu: /^星期四/i,
        fri: /^星期五/i,
        sat: /^星期六/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};

Date.CultureInfo_fi = {
	/* Culture Name */
    name: "fi-FI",
    englishName: "Finnish (Finland)",
    nativeName: "suomi (Suomi)",
    
    /* Day Name Strings */
    dayNames: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"],
    abbreviatedDayNames: ["su", "ma", "ti", "ke", "to", "pe", "la"],
    shortestDayNames: ["su", "ma", "ti", "ke", "to", "pe", "la"],
    firstLetterDayNames: ["s", "m", "t", "k", "t", "p", "l"],
    
    /* Month Name Strings */
    monthNames: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"],
    abbreviatedMonthNames: ["Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä", "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"],

	/* AM/PM Designators */
    amDesignator: "",
    pmDesignator: "",

    firstDayOfWeek: 1,
    twoDigitYearMax: 2029,

    dateElementOrder: "dmy",
    
    /* Standard date and time format patterns */
    formatPatterns: {
        shortDate: "d.M.yyyy",
        longDate: "d. MMMM'ta 'yyyy",
        shortTime: "H:mm",
        longTime: "H:mm:ss",
        fullDateTime: "d. MMMM'ta 'yyyy H:mm:ss",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "d. MMMM'ta'",
        yearMonth: "MMMM yyyy"
    },

    regexPatterns: {
        jan: /^tammi(kuu)?/i,
        feb: /^helmi(kuu)?/i,
        mar: /^maalis(kuu)?/i,
        apr: /^huhti(kuu)?/i,
        may: /^touko(kuu)?/i,
        jun: /^kesä(kuu)?/i,
        jul: /^heinä(kuu)?/i,
        aug: /^elo(kuu)?/i,
        sep: /^syys(kuu)?/i,
        oct: /^loka(kuu)?/i,
        nov: /^marras(kuu)?/i,
        dec: /^joulu(kuu)?/i,

        sun: /^sunnuntai/i,
        mon: /^maanantai/i,
        tue: /^tiistai/i,
        wed: /^keskiviikko/i,
        thu: /^torstai/i,
        fri: /^perjantai/i,
        sat: /^lauantai/i,

        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
		
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },

    abbreviatedTimeZoneStandard: { GMT: "-000", EST: "-0400", CST: "-0500", MST: "-0600", PST: "-0700" },
    abbreviatedTimeZoneDST: { GMT: "-000", EDT: "-0500", CDT: "-0600", MDT: "-0700", PDT: "-0800" }
    
};