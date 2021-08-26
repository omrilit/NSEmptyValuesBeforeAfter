/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Mar 2013     pbtan            Initial, added validate field function for employee years of experience, moved upload link here.
 * 2.00       30 Apr 2013     rwong            Change resume to portfolio. 
 * 3.00		  15 May 2013	  pbtan			   Added handling for Vendor implementation by adding the recordtype
 * 4.00		  01 Jun 2013	  pbtan			   Refresh portfolio sublist only instead of whole page.
 * 5.00       06 May 2014     pbtan            applied translation for some error messages and window title.
 * 6.00       30 May 2014     pbtan            applied translation for some error messages and window title.
 * 7.00       26 Jun 2014     pbtan            remove unused code.
 * 
 */

var onServerLog = false;

var psa_rss;
if (!psa_rss) { psa_rss = {}; }
if (!psa_rss.clientlibrary) { psa_rss.clientlibrary = {}; }

psa_rss.clientlibrary.isValidObject = function(objectToTest) {
	var isValidObject = false;
	isValidObject = (objectToTest!=null && objectToTest!='' && objectToTest!=undefined) ? true : false;
	return isValidObject;	
}; 

/**
 * Trim leading and lagging white spaces.
 */
psa_rss.clientlibrary.trim = function (stringToTrim) { 
	stringToTrim += '';
	if (onServerLog) {
		nlapiLogExecution('DEBUG', 'trim : ', 'stringToTrim: \n'+stringToTrim);
	}
	
   if(stringToTrim != null && stringToTrim!=undefined && stringToTrim!='') {
   		return stringToTrim.replace(/^\s+|\s+$/g,"");
   } else {
   		return ''+stringToTrim; 
   }	
}; // end psa_rss.serverlibrary.trim

psa_rss.clientlibrary.rssEmployeeValidateField = function(type, name, linenum) {
	var value;
	if (name == 'custpage_rss_yoe') {
		value = nlapiGetFieldValue('custpage_rss_yoe');
		
		if (psa_rss.clientlibrary.isValidObject(value)) {
		
			if (value > 100 || value < 0) {
				alert(getYoeLimitErrorMsg());
				return false;
			}
			
			var index = String(value).search(/^(?:100(?:.0(?:0)?)?|\d{1,2}(?:.\d{1,2})?)$/);
			
			if (index < 0) {
				alert(getYoePrecisionErrorMsg());
				return false;
			}
		}
	}
	
    return true;
};

psa_rss.clientlibrary.upload = function (recordId, recordType){
    try {
        var url = nlapiResolveURL("SUITELET", "customscript_rss_sl_upload", "customdeploy_rss_sl_upload", false);
        url += "&custpage_rss_entity=" + recordId+"&custpage_rss_entity_type=" + recordType;
        nlExtOpenWindow(url, 'thepopup', 400, 240, 0, 0, getUploadPortfolioTitle(), null);
        
        var win = Ext.getCmp('thepopup');
        win.addListener( 'close', refreshPortfolio);
        win.doLayout();
    }
    catch(ex){
        var subject_message = 'upload';
        var body_message = '';

        if (ex instanceof nlobjError){
            body_message = 'System Error: '+ex.getCode() + ': ' + ex.getDetails();
            nlapiLogExecution('ERROR', subject_message, body_message);
        }else {
            body_message = 'Unexpected Error: '+ex;
            nlapiLogExecution('ERROR', subject_message, body_message);
        }
    }
};


function refreshPortfolio(){
	nlapiRefreshLineItems('custpage_portfolio_sublist');
}

function getUploadPortfolioTitle(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var windowTitle = {
        'cs_CZ' : 'Nahrát portfolio',
        'da_DK' : 'Overfør portefølje',
        'de_DE' : 'Portfolio hochladen',
        'en'    : 'Upload Portfolio',
        'en_US' : 'Upload Portfolio',
        'es_AR' : 'Cargar cartera',
        'es_ES' : 'Cargar cartera',
        'fr_CA' : 'Charger le portefeuille',
        'fr_FR' : 'Charger le portefeuille',
        'it_IT' : 'Carica portfolio',
        'ja_JP' : 'ポートフォリオをアップロード',
        'ko_KR' : '포트폴리오 업로드',
        'nl_NL' : 'Portfolio uploaden',
        'pt_BR' : 'Carregar portfólio',
        'ru_RU' : 'Загрузить портфель',
        'sv_SE' : 'Överför portfölj',
        'th_TH' : 'อัพโหลดพอร์ตโฟลิโอ',
        'zh_CN' : '上传组合',
        'zh_TW' : '上載組合'
    };
    return windowTitle[lang] ? windowTitle[lang] : 'Upload Portfolio';
}

function getYoeLimitErrorMsg(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var errMsg = {
        'cs_CZ' : 'Roky praxe musí mít hodnotu od 0 do 100.',
        'da_DK' : 'Års erfaring skal være mellem 0 og 100 år.',
        'de_DE' : 'Erfahrung in Jahren muss zwischen 0 und 100 Jahren liegen.',
        'en'    : 'Years of experience must be between 0 and 100 years.',
        'en_US' : 'Years of experience must be between 0 and 100 years.',
        'es_AR' : 'Los años de experiencia deben estar incluidos en el rango 0 a 100.',
        'es_ES' : 'Los años de experiencia deben estar incluidos en el rango 0 a 100.',
        'fr_CA' : 'Les années d\'expérience doivent être comprises entre 0 et 100 années.',
        'fr_FR' : 'Les années d\'expérience doivent être comprises entre 0 et 100 années.',
        'it_IT' : 'Gli anni di esperienza devono essere tra 0 e 100.',
        'ja_JP' : '経験年数は0～100年までで入力してください。',
        'ko_KR' : '경력 년수는 0 - 100년 사이여야 합니다.',
        'nl_NL' : 'Het aantal jaar ervaring moet tussen 0 en 100 zijn.',
        'pt_BR' : 'Anos de experiência devem estar entre 0 e 100 anos.',
        'ru_RU' : 'Количество лет опыта должно быть от 0 до 100.',
        'sv_SE' : 'Års erfarenhet måste vara mellan 0 och 100 år.',
        'th_TH' : 'จำนวนปีที่มีประสบการณ์จะต้องอยู่ระหว่าง 0 ถึง 100 ปี',
        'zh_CN' : '经验年限必须介于 0 至 100 年之间。',
        'zh_TW' : '年資必須在 0 和 100 年之間。'
    };
    return errMsg[lang] ? errMsg[lang] : 'Years of experience must be between 0 and 100 years.';
}

function getYoePrecisionErrorMsg(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var errMsg = {
        'cs_CZ' : 'Hodnota roků praxe může mít maximálně dvě desetinná místa.',
        'da_DK' : 'Års erfaring kan maksimalt have 2 decimaler.',
        'de_DE' : 'Erfahrung in Jahren darf nicht mehr als 2 Dezimalstellen haben.',
        'en'    : 'Years of experience can only have upto 2 decimal places.',
        'en_US' : 'Years of experience can only have upto 2 decimal places.',
        'es_AR' : 'Los años de experiencia pueden tener hasta dos decimales.',
        'es_ES' : 'Los años de experiencia pueden tener hasta dos decimales.',
        'fr_CA' : 'Les années d\'expérience ne peuvent pas avoir plus de 2 décimales.',
        'fr_FR' : 'Les années d\'expérience ne peuvent pas avoir plus de 2 décimales.',
        'it_IT' : 'Gli anni di esperienza possono avere solo fino a 2 decimali.',
        'ja_JP' : '経験年数に設定できる値は小数点以下2桁までです。',
        'ko_KR' : '경력 년수에는 소수 둘째 자리까지만 허용됩니다.',
        'nl_NL' : 'Het aantal jaar ervaring mag maar twee cijfers achter de komma hebben.',
        'pt_BR' : 'Anos de experiência somente podem ter até 2 casas decimais.',
        'ru_RU' : 'Годы опыта могут быть только двузначным числом.',
        'sv_SE' : 'Års erfarenhet kan ha högst 2 decimaler.',
        'th_TH' : 'จำนวนปีที่มีประสบการณ์สามารถมีจุดทศนิยมได้สูงสุด 2 หลัก',
        'zh_CN' : '>经验年限最多只能有两个小数位。',
        'zh_TW' : '年資最多只能是 2 位數。'
    };
    return errMsg[lang] ? errMsg[lang] : 'Years of experience can only have upto 2 decimal places.';
}