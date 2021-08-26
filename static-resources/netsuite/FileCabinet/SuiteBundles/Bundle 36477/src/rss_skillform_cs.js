/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Mar 2013     pbtan				Initial, onSave should not have duplicate level weight. max skill level of weight count (5)
 * 2.00		  14 Mar 2013	  pbtan				cleanup, category/skill name/skill level should be unique, skill and levels must not be empty, max level count = max weight.
 * 3.00		  15 Mar 2013	  pbtan				make uniqueness case INsensitive.
 * 4.00		  18 Mar 2013	  pbtan				temporarily remove checking for empty skills and levels
 * 5.00		  03 Apr 2013	  pbtan				used sublist's default implementation of unique fields
 * 6.00		  04 Apr 2013	  pbtan				removed instances of weight.
 * 7.00       06 May 2014     pbtan             applied translation for error message.
 * 8.00       30 May 2014     pbtan             applied translation for error message.
 * 9.00       26 Jun 2014     pbtan             removed unused code.
 * 
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord customrecord_rss_category  
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function rssSkillSaveRecord(){

//	var skillSublistId 	= 'custpage_rss_skill_sublist';
//	var levelSublistId 	= 'custpage_rss_skilllevel_sublist';
//	var maxCount 		= 0;
	var searchResults;
	var recordId 		= nlapiGetRecordId();
	
	// Category must be unique
	searchResults = getRecordList('customrecord_rss_category', recordId);
	if (searchResults) {
		for (var i = 0; i < searchResults.length; i++) {
			var searchResult = searchResults[i];
			
			if (searchResult.getValue('name').toLowerCase() == nlapiGetFieldValue('name').toLowerCase()) {
				alert(getErrMsg());
				return false;
			}
		}
	}
	
	/*
	// must not be empty
	if (nlapiGetLineItemCount(skillSublistId) == 0) {  
		alert('Skills must not be empty.');
		return false;
	}
	
	if (nlapiGetLineItemCount(levelSublistId) == 0) {
		alert('Skill Levels must not be empty');
		return false;
	}
	
	// levels must not be more than weight count
	searchResults = getRecordList('customlist_rss_skill_level_weight');
	if (searchResults) {
		maxCount = searchResults.length;

		if (nlapiGetLineItemCount(levelSublistId) > maxCount) {
			alert('Skill Levels should only have a maximum of '+maxCount+' levels.');
			return false;
		}
	}
	
	// must be unique
	if (!isSublistItemUnique(skillSublistId, 'rss_level_name')) {
		alert('Skill Names should be unique');
		return false;
	}
	
	if (!isSublistItemUnique(levelSublistId, 'rss_level_name')) {
		alert('Expertise should be unique');
		return false;
	}
	
	if (!isSublistItemUnique(levelSublistId, 'rss_level_weight')) {
		alert('Expertise should have a unique weight.');
		return false;
	}
	*/
    return true;
};

function getRecordList(recordType, recordId) {
	var filters = new Array();
	if  (recordId) {
		filters[0] = new nlobjSearchFilter('internalid', null, 'noneof', recordId);
	}
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('name');
	
	return nlapiSearchRecord(recordType, null, filters, columns); // 'customrecord_rss_category'
};

/*
function isSublistItemUnique(sublistId, fieldName) {
	var uniqueList = [];
	var listCount = nlapiGetLineItemCount(sublistId);
	
	for (var i = 0; i < listCount; i++) {
		var item = nlapiGetLineItemValue(sublistId, fieldName, i + 1);
		
		if (uniqueList.length == 0 || uniqueList.indexOf(item) < 0) {
			uniqueList.push(item);
		}
		else {
			return false;
		}
	}
	
	return true;
};
*/

function getErrMsg(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var errMsg = {
        'cs_CZ' : 'Kategorie již existuje. Zadejte jiný název kategorie.',
        'da_DK' : 'Kategorien findes allerede. Indtast et andet kategorinavn.',
        'de_DE' : 'Diese Kategorie existiert bereits. Geben Sie bitte einen anderen Kategoriennamen ein.',
        'en'    : 'Category already exists. Please enter a different Category name.',
        'en_US' : 'Category already exists. Please enter a different Category name.',
        'es_AR' : 'La categoría ya existe. Introduzca un nombre de categoría diferente.',
        'es_ES' : 'La categoría ya existe. Escriba un nombre de categoría diferente.',
        'fr_CA' : 'Cette catégorie existe déjà. Veuillez saisir un nom de catégorie différent.',
        'fr_FR' : 'Cette catégorie existe déjà. Veuillez saisir un nom de catégorie différent.',
        'it_IT' : 'La categoria esiste già. Inserire un nome di categoria differente.',
        'ja_JP' : 'カテゴリは既に存在します。 別のカテゴリ名を入力してください。',
        'ko_KR' : '범주가 이미 존재합니다. 다른 범주 이름을 입력하십시오.',
        'nl_NL' : 'Deze categorie bestaat al. Voer een andere categorienaam in.',
        'pt_BR' : 'Categoria já existente. Insira um nome de categoria diferente.',
        'ru_RU' : 'Эта категория уже существует. Введите другое имя категории.',
        'sv_SE' : 'Den här kategorin finns redan. Ange ett annat kategorinamn.',
        'th_TH' : 'มีหมวดหมู่นี้อยู่แล้ว โปรดกรอกชื่อหมวดหมู่อื่น',
        'zh_CN' : '类别已经存在。 请输入不同的类别名称。',
        'zh_TW' : '類別已存在。 請輸入別的類別名稱。'
    };
    return errMsg[lang] ? errMsg[lang] : 'Category already exists. Please enter a different Category name.';
}