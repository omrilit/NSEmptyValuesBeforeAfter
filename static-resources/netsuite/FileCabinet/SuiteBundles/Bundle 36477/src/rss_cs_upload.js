/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Mar 2013     pbtan            Initial. Close popup on upload resume success, warn on saving.
 * 2.00       30 Apr 2013     rwong            Change resume to portfolio. Added check for duplicate files in same folder.
 * 3.00       15 May 2013     pbtan            Added handling for Vendor implementation
 * 4.00       31 May 2013     rwong            Moved checking to a suitelet to have it work for roles with no access to employee record.
 * 5.00       01 Jun 2013     pbtan            Removed refresh of parent page.
 * 6.00       04 Jun 2013     rwong            Fixed error in the prompting of the confirm.
 * 7.00       06 May 2014     pbtan            applied translation for error message.
 * 8.00       02 Jun 2014     pbtan            applied translation for error message.
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function rssUploadPageInit(type){
    if (nlapiGetFieldValue("custpage_rss_success") === "T") {
        closeThisPopup();
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function rssUploadSaveRecord(){
    var entityId    = nlapiGetFieldValue('custpage_rss_entity');
    var entityType  = nlapiGetFieldValue('custpage_rss_entity_type');
    var fileName    = nlapiGetFieldValue('custpage_rss_cvfile');
    var fileType    = nlapiGetFieldText('custpage_rss_type');

    nlapiSetFieldValue('custpage_rss_folder', fileType);    

    var url = nlapiResolveURL("SUITELET", 'customscript_rss_sl_duplicate_file_check', 'customdeploy_rss_sl_duplicate_file_check');
    url += "&entityId=" + entityId + "&entityType=" + entityType + "&fileName=" + fileName + "&fileType=" +  fileType;
    var response = nlapiRequestURL(url);

    if(response.getBody() == "true"){
        return confirm(getFileExistsErrMsg());
    }

    return true;
}

function closeThisPopup(){
//  parent.setWindowChanged(parent.window, false);
//  parent.document.location.reload(true);
    closePopup();
}

function getFileExistsErrMsg(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var errMsg = {
        'cs_CZ' : 'Ve vybrané složce již existuje soubor se stejným názvem. Kliknutím na tlačítko OK existující soubor přepíšete.',
        'da_DK' : 'En fil med det samme navn findes allerede i den valgte mappe. Klik på OK for at overskrive den eksisterende fil..',
        'de_DE' : 'Im ausgewählten Ordner ist bereits eine Datei mit diesem Namen vorhanden. Klicken Sie auf OK, um die bestehende Datei zu überschreiben.',
        'en'    : 'A file with the same name already exists in the selected folder. Click OK to overwrite the existing file.',
        'en_US' : 'A file with the same name already exists in the selected folder. Click OK to overwrite the existing file.',
        'es_AR' : 'Ya existe un archivo con el mismo nombre en la carpeta seleccionada. Haga clic en Aceptar para sobrescribir el archivo existente.',
        'es_ES' : 'Ya existe un archivo con el mismo nombre en la carpeta seleccionada. Haga clic en Aceptar para sobrescribir el archivo existente.',
        'fr_CA' : 'Un fichier avec le même nom existe déjà dans le dossier sélectionné. Cliquez sur OK pour remplacer le fichier existant.',
        'fr_FR' : 'Un fichier avec le même nom existe déjà dans le dossier sélectionné. Cliquez sur OK pour remplacer le fichier existant.',
        'it_IT' : 'Esiste già un file con lo stesso nome nella cartella selezionata. Fare clic su OK per sovrascrivere il file esistente.',
        'ja_JP' : '選択したフォルダには同名のファイルが既に存在します。 「OK」をクリックして既存のファイルを上書きします。',
        'ko_KR' : '같은 이름의 파일이 선택한 폴더에 이미 존재합니다. 기존 파일을 덮어쓰려면 확인을 클릭하십시오.',
        'nl_NL' : 'Er bestaat al een bestand met dezelfde naam in de geselecteerde map. Klik om het bestaande bestand te overschrijven.',
        'pt_BR' : 'Um arquivo com o mesmo nome já existe na pasta selecionada.Clique em OK para sobrescrever o arquivo existente.',
        'ru_RU' : 'В выбранной папке уже существует файл с таким именем. Нажмите ОК, чтобы переписать существующий файл.',
        'sv_SE' : 'Det finns redan en fil med det namnet i den valda mappen. Klicka på OK om du vill skriva över den befintliga filen.',
        'th_TH' : 'มีไฟล์ชื่อเดียวกันนี้อยู่แล้วในโฟลเดอร์ที่เลือกไว้ คลิก ตกลง เพื่อเขียนทับไฟล์ที่มีอยู่',
        'zh_CN' : '在所选文件夹中已存在相同名称的文件。 单击“确定”覆盖现有文件。',
        'zh_TW' : '在所選資料夾中已有同名稱的檔案。 按一下「確定」覆寫現存檔案。'
    };
    return errMsg[lang] ? errMsg[lang] : 'A file with the same name already exists in the selected folder. Click OK to overwrite the existing file.';
}