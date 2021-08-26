/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @param {Number} toversion
 * @returns {Void}
 */
function beforeInstall(toversion) {
    beforeUpdate(null, toversion);
}

/**
 * @param {Number} fromversion
 * @param {Number} toversion
 * @returns {Void}
 */
function beforeUpdate(fromversion, toversion) {
    var context = nlapiGetContext();
    
    var raFeature = context.getFeature('resourceallocations');
    var customRecords = context.getFeature('customrecords');
    var clientScript = context.getFeature('customcode');
    var serverScript = context.getFeature('serversidescripting');
    
    if ( !(raFeature 
            && customRecords
            && clientScript
            && serverScript) ) {
        throw new nlobjError('INSTALLATION_ERROR', getfeatureDisabledErrorMessage());
    }
    
}

function getfeatureDisabledErrorMessage(){
    var lang = nlapiGetContext().getPreference('LANGUAGE');
    var featureDisabledErrorMessage = {
        'cs_CZ' : 'Funkce [Přidělení zdrojů], [Vlastní záznamy], [Klientský SuiteScript] a [Serverový SuiteScript] musí být zapnuté. Zapněte tyto funkce a zkuste to znovu.',
        'da_DK' : 'Funktion [Ressourceallokeringer], [Tilpassede poster], [Klient-SuiteScript] og [Server-SuiteScript] skal være aktiveret. Aktiver funktionerne, og prøv igen.',
        'de_DE' : 'Die Merkmale [Ressourcenzuordnungen], [Benutzerdefinierte Datensätze], [Suitescript für Kunden] und [Server SuiteScript] müssen aktiviert sein. Bitte aktivieren Sie die Merkmale und versuchen Sie es erneut.',
        'en'    : 'Feature [Resource Allocations], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'en_US' : 'Feature [Resource Allocations], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.',
        'es_AR' : 'Las funciones [Resource Allocations], [Custom Records], [Client SuiteScript] y [Server SuiteScript] se deben habilitar. Habilite las funciones y vuelva a intentarlo.',
        'es_ES' : 'Las funciones [Resource Allocations], [Custom Records], [Client SuiteScript] y [Server SuiteScript] se deben habilitar. Habilite las funciones y vuelva a intentarlo.',
        'fr_CA' : 'Les fonctions [Affectations des ressources], [Enregistrements personnalisés], [SuiteScript Client], et [SuiteScript Serveur] doit être activées. Veuillez activer les fonctions et réessayer.',
        'fr_FR' : 'Les fonctions [Affectations des ressources], [Enregistrements personnalisés], [SuiteScript Client] et [SuiteScript Serveur] doit être activées. Veuillez activer les fonctions et réessayer.',
        'it_IT' : 'Le funzioni [Allocazioni Risorse], [Record personalizzati], [Client SuiteScript] e [SuiteScript Server] devono essere Attivati. Abilita la funzione e riprova.',
        'ja_JP' : '[リソース割当]、[カスタムレコード]、[クライアントSuiteScript]、および[サーバSuiteScript] の各機能を有効にする必要があります。 機能を有効にしてもう一度お試しください。',
        'ko_KR' : '기능 [자원 할당], [사용자 정의 레코드], [클라이언트 SuiteScript] 및 [서버 SuiteScript]를 활성화해야 합니다. 이 기능을 활성화한 후 다시 시도하십시오.',
        'nl_NL' : 'De functies [Toewijzingen hulpbronnen]], [Aangepaste records]], [Client SuiteScript]], en [Server SuiteScript]] moeten zijn ingeschakeld. Schakel de functies in en probeer het opnieuw.',
        'pt_BR' : 'Os recursos [Alocações de recurso], [Registros personalizados], [Cliente SuiteScript] e [Servidor SuiteScript] devem estar habilitados. Habilite os recursos e tente novamente.',
        'ru_RU' : 'Необходимо включить функция [Распределение ресурсов], [Пользовательские записи], [Клиентский сценарий] и [Серверный сценарий]. Включите эти функции и повторите попытку.',
        'sv_SE' : 'Funktionerna [Resursallokering], [Anpassade poster], [SuiteScript för klient], och [Server SuiteScript] måste vara aktiverade Var god aktivera funktionerna och försök igen.',
        'th_TH' : 'ต้องเปิดใช้คุณลักษณะ [การจัดสรรทรัพยากร] [เร็กคอร์ดที่สร้างเอง][Client SuiteScript] และ [Server SuiteScript] โปรดเปิดใช้งานคุณลักษณะและลองอีกครั้ง',
        'zh_CN' : '功能 [资源分配]、[自定义记录]、[客户端 SuiteScript] 和 [服务器 SuiteScript] 必须启用。 请启用这些功能并重试。',
        'zh_TW' : '必須啟用 [資源分配]、[自訂記錄]、[用戸端 SuiteScript] 和 [伺服器 SuiteScript] 功能 。 請啟用這些功能並重試。'
    };
    return featureDisabledErrorMessage[lang] ? featureDisabledErrorMessage[lang] : 'Feature [Resource Allocations], [Custom Records], [Client SuiteScript], and [Server SuiteScript] must be enabled. Please enable the features and re-try.';
}


function afterUpdate() {
    nlapiScheduleScript('customscript_racg_filter_migration', 'customdeploy_racg_filter_migration');
    nlapiScheduleScript('customscript_racg_setting_update', 'customdeploy_racg_setting_update');
}