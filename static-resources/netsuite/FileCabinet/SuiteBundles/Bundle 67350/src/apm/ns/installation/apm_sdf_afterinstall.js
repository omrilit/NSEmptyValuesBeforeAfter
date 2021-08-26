/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       05 Sep 2020     earepollo        Initial. Translation for center links
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType SDFInstallationScript
 */
define([
    'N/record',
    'N/search'
], function(
    record,
    search
) {
    var SCRIPTID = {
        AH : "CUSTOMDEPLOY_APM_AH_SL_MAIN",
        RPM : "CUSTOMDEPLOY_APM_RPM_SL_MAIN",
        PTS : "CUSTOMDEPLOY_APM_PTS_SL_MAIN",
        PTD : "CUSTOMDEPLOY_APM_PTD_SL_MAIN",
        SSA : "CUSTOMDEPLOY_APM_SSA_SL_MAIN",
        SCPM : "CUSTOMDEPLOY_APM_SCPM_SL_MAIN",
        SPJD : "CUSTOMDEPLOY_APM_SPJD_SL_MAIN",
        WSA : "CUSTOMDEPLOY_APM_WSA_SL_MAIN",
        CM : "CUSTOMDEPLOY_APM_CM_SL_MAIN",
        SPA : "CUSTOMDEPLOY_APM_SPA_SL_MAIN",
        SPD : "CUSTOMDEPLOY_APM_SPD_SL_MAIN",
        SETUP : "CUSTOMDEPLOY_APM_SETUP_SL_MAIN"
    };

    var TRANSLATEDSTRINGS = {
        "CUSTOMDEPLOY_APM_AH_SL_MAIN" : {
            "en_us": "Performance Health Dashboard",
            "zh_cn": "性能运行状况仪表盘",
            "zh_tw": "效能狀況儀表板",
            "cs_cz": "Panel stavu výkonu",
            "da_dk": "Præstationshelbred (instrumentbræt)",
            "nl_nl": "Dashboard voor prestatiestatus",
            "fi_fi": "Suorituskyvyn tilan koontinäyttö",
            "fr_ca": "Tableau de bord d'état des performances",
            "fr_fr": "Tableau de bord d'état des performances",
            "de_de": "Leistungszustands-Dashboard",
            "id_id": "Dasbor Kondisi Kinerja",
            "it_it": "Dashboard stato prestazioni",
            "ja_jp": "パフォーマンスの健全性ダッシュボード",
            "ko_kr": "성능 상태 대시보드",
            "es_ar": "Panel de control de estado del rendimiento",
            "no_no": "Dashbord for ytelsestilstand",
            "pt_br": "Painel da integridade de desempenho",
            "ru_ru": "Панель мониторинга состояния производительности",
            "es_es": "Panel de control de estado del rendimiento",
            "sv_se": "Infopanel för prestandans hälsotillstånd",
            "th_th": "แดชบอร์ดสถานะประสิทธิภาพ",
            "tr_tr": "Performans Durumu Kumanda Tablosu",
            "vi_vn": "Bảng điều khiển tình trạng hiệu suất"
        },
        "CUSTOMDEPLOY_APM_RPM_SL_MAIN" : {
            "en_us": "Record Pages Monitor",
            "zh_cn": "记录页面监视器",
            "zh_tw": "記錄頁面監控",
            "cs_cz": "Monitorování stránek záznamů",
            "da_dk": "Overvågning af recordsider",
            "nl_nl": "Recordpagina's controleren",
            "fi_fi": "Tietueen sivujen seuranta",
            "fr_ca": "Surveillance des pages de dossier",
            "fr_fr": "Surveillance des pages de dossier",
            "de_de": "Datensatzseitenüberwachung",
            "id_id": "Montor Halaman Data",
            "it_it": "Monitoraggio pagine record",
            "ja_jp": "レコード・ページ・モニター",
            "ko_kr": "레코드 페이지 모니터",
            "es_ar": "Supervisión de páginas de registro",
            "no_no": "Overvåking av oppføringssider",
            "pt_br": "Monitor de páginas de registro",
            "ru_ru": "Мониторинг страниц записей",
            "es_es": "Supervisión de páginas de registro",
            "sv_se": "Övervakning av postsidor",
            "th_th": "การตรวจสอบหน้าเร็กคอร์ด",
            "tr_tr": "Kayıt Sayfaları İzleyici",
            "vi_vn": "Theo dõi Trang dữ liệu"
        },
        "CUSTOMDEPLOY_APM_PTS_SL_MAIN" : {
            "en_us": "Page Time Summary",
            "zh_cn": "页面时间汇总",
            "zh_tw": "頁面時間摘要",
            "cs_cz": "Souhrn času stránky",
            "da_dk": "Opsummering af sidetid",
            "nl_nl": "Overzicht paginatijd",
            "fi_fi": "Sivun aikayhteenveto",
            "fr_ca": "Page de résumé de temps",
            "fr_fr": "Page de résumé de temps",
            "de_de": "Seitenzeitübersicht",
            "id_id": "Ringkasan Waktu Halaman",
            "it_it": "Sintetico ora pagina",
            "ja_jp": "ページ時間概要",
            "ko_kr": "페이지 시간 요약",
            "es_ar": "Resumen del tiempo de página",
            "no_no": "Tidssammendrag for side",
            "pt_br": "Resumo do tempo da página",
            "ru_ru": "Сводка времени страницы",
            "es_es": "Resumen del tiempo de página",
            "sv_se": "Sidtidsöversikt",
            "th_th": "สรุปเวลาของหน้า",
            "tr_tr": "Sayfa Süresi Özeti",
            "vi_vn": "Tổng hợp thời gian của trang"
        },
        "CUSTOMDEPLOY_APM_PTD_SL_MAIN" : {
            "en_us": "Page Time Details",
            "zh_cn": "页面时间详细信息",
            "zh_tw": "頁面時間明細",
            "cs_cz": "Detaily času stránky",
            "da_dk": "Detaljer om sidetid",
            "nl_nl": "Details paginatijd",
            "fi_fi": "Sivun aikatiedot",
            "fr_ca": "Page de détails de temps",
            "fr_fr": "Page de détails de temps",
            "de_de": "Seitenzeitdetails",
            "id_id": "Detail Waktu Halaman",
            "it_it": "Dettagli ora pagina",
            "ja_jp": "ページ時間詳細",
            "ko_kr": "페이지 시간 세부정보",
            "es_ar": "Detalles del tiempo de página",
            "no_no": "Tidsdetaljer for side",
            "pt_br": "Detalhes de tempo da página",
            "ru_ru": "Данные времени страницы",
            "es_es": "Detalles del tiempo de página",
            "sv_se": "Tidsdetaljer för sida",
            "th_th": "รายละเอียดเวลาของหน้า",
            "tr_tr": "Sayfa Süresi Ayrıntıları",
            "vi_vn": "Chi tiết thời gian của trang"
        },
        "CUSTOMDEPLOY_APM_SSA_SL_MAIN" : {
            "en_us": "SuiteScript Analysis",
            "zh_cn": "SuiteScript 分析",
            "zh_tw": "SuiteScript 分析",
            "cs_cz": "Analýza skriptu SuiteScript",
            "da_dk": "SuiteScript-analyse",
            "nl_nl": "SuiteScript analyse",
            "fi_fi": "SuiteScript-analyysi",
            "fr_ca": "Analyse SuiteScript",
            "fr_fr": "Analyse SuiteScript",
            "de_de": "SuiteScript-Analyse",
            "id_id": "Analisis SuiteScript",
            "it_it": "Analisi di SuiteScript",
            "ja_jp": "SuiteScript分析",
            "ko_kr": "SuiteScript 분석",
            "es_ar": "Análisis de SuiteScript",
            "no_no": "SuiteScript-analyse",
            "pt_br": "Análise do SuiteScript",
            "ru_ru": "Анализ SuiteScript",
            "es_es": "Análisis de SuiteScript",
            "sv_se": "SuiteScript-analys",
            "th_th": "การวิเคราะห์ SuiteScript",
            "tr_tr": "SuiteScript Analizi",
            "vi_vn": "Phân tích SuiteScript"
        },
        "CUSTOMDEPLOY_APM_SCPM_SL_MAIN" : {
            "en_us": "SuiteCloud Processors Monitor",
            "zh_cn": "SuiteCloud 处理器监视器",
            "zh_tw": "SuiteCloud 處理器監控",
            "cs_cz": "Monitor procesorů služby SuiteCloud",
            "da_dk": "Overvågning af SuiteCloud-processorer",
            "nl_nl": "SuiteCloud processors controleren",
            "fi_fi": "SuiteCloud-prosessoreiden seuranta",
            "fr_ca": "Surveillance des processeurs SuiteCloud",
            "fr_fr": "Surveillance des processeurs SuiteCloud",
            "de_de": "SuiteCloud-Prozessorenüberwachung",
            "id_id": "Monitor Prosesor SuiteCloud",
            "it_it": "Monitoraggio processori SuiteCloud",
            "ja_jp": "SuiteCloudプロセッサ・モニター",
            "ko_kr": "SuiteCloud 프로세서 모니터",
            "es_ar": "Supervisión de procesadores de SuiteCloud",
            "no_no": "Monitor for SuiteCloud-prosessorer",
            "pt_br": "Monitor dos processadores do SuiteCloud",
            "ru_ru": "Монитор процессоров SuiteCloud",
            "es_es": "Supervisión de procesadores de SuiteCloud",
            "sv_se": "SuiteCloud-processorövervakare",
            "th_th": "การตรวจสอบตัวประมวลผล SuiteCloud",
            "tr_tr": "SuiteCloud İşlemcileri İzleme",
            "vi_vn": "Theo dõi bộ xử lý SuiteCloud"
        },
        "CUSTOMDEPLOY_APM_SPJD_SL_MAIN" : {
            "en_us": "SuiteCloud Processors Job Details",
            "zh_cn": "SuiteCloud 处理器作业详细信息",
            "zh_tw": "SuiteCloud 處理器工作明細",
            "cs_cz": "Detaily úlohy procesorů SuiteCloud",
            "da_dk": "Jobdetaljer i SuiteCloud-processorer",
            "nl_nl": "Opdrachtdetails SuiteCloud processors",
            "fi_fi": "SuiteCloud-prosessorien työn tiedot",
            "fr_ca": "Détails des travaux des processeurs SuiteCloud",
            "fr_fr": "Détails des travaux des processeurs SuiteCloud",
            "de_de": "SuiteCloud-Prozessoren Projektdetails",
            "id_id": "Detail Pekerjaan Prosesor SuiteCloud",
            "it_it": "Dettagli processo processori SuiteCloud",
            "ja_jp": "SuiteCloudプロセッサのジョブ詳細",
            "ko_kr": "SuiteCloud 프로세서 작업 세부정보",
            "es_ar": "Detalles del trabajo de los procesadores de SuiteCloud",
            "no_no": "Jobbdetaljer for SuiteCloud-prosessorer",
            "pt_br": "Detalhes da tarefa dos processadores do SuiteCloud",
            "ru_ru": "Данные заданий процессоров SuiteCloud",
            "es_es": "Detalles del trabajo de los procesadores de SuiteCloud",
            "sv_se": "Jobbdetaljer om SuiteCloud-processorer",
            "th_th": "รายละเอียดงานตัวประมวลผล SuiteCloud",
            "tr_tr": "SuiteCloud İşlemcileri İş Ayrıntıları",
            "vi_vn": "Chi tiết công việc của bộ xử lý SuiteCloud"
        },
        "CUSTOMDEPLOY_APM_WSA_SL_MAIN" : {
            "en_us": "Web Services Analysis",
            "zh_cn": "Web 服务分析",
            "zh_tw": "網路服務分析",
            "cs_cz": "Analýza webových služeb",
            "da_dk": "Analyse af webtjenester",
            "nl_nl": "Analyse webservices",
            "fi_fi": "Verkkopalveluiden analyysi",
            "fr_ca": "Analyse des services Web",
            "fr_fr": "Analyse des services Web",
            "de_de": "Webservice-Analyse",
            "id_id": "Analisis Layanan Web",
            "it_it": "Analisi servizi Web",
            "ja_jp": "Webサービス分析",
            "ko_kr": "웹 서비스 분석",
            "es_ar": "Análisis de servicios web",
            "no_no": "Analyse av nettjenester",
            "pt_br": "Análise de serviços da Web",
            "ru_ru": "Анализ веб-сервисов",
            "es_es": "Análisis de servicios web",
            "sv_se": "Webbtjänstanalys",
            "th_th": "การวิเคราะห์เว็บเซอร์วิส",
            "tr_tr": "Web Hizmetleri Analizi",
            "vi_vn": "Phân tích dịch vụ web"
        },
        "CUSTOMDEPLOY_APM_CM_SL_MAIN" : {
            "en_us": "Concurrency Monitor",
            "zh_cn": "并发监视器",
            "zh_tw": "並行監控",
            "cs_cz": "Monitor souběžnosti",
            "da_dk": "Overvågning af samtidighed",
            "nl_nl": "Gelijktijdigheidsmonitor",
            "fi_fi": "Samanaikaisuuden seuranta",
            "fr_ca": "Surveillance de la concomitance",
            "fr_fr": "Surveillance de la concomitance",
            "de_de": "Nebenläufigkeitsüberwachung",
            "id_id": "Monitor Konkurensi",
            "it_it": "Monitoraggio concorrenza",
            "ja_jp": "同時実行モニター",
            "ko_kr": "동시실행 모니터",
            "es_ar": "Supervisión de simultaneidad",
            "no_no": "Samtidighetsovervåking",
            "pt_br": "Monitor de simultaneidade",
            "ru_ru": "Мониторинг параллельной обработки",
            "es_es": "Supervisión de simultaneidad",
            "sv_se": "Samtidighetsövervakning",
            "th_th": "การตรวจสอบการทำงานพร้อมกัน",
            "tr_tr": "Eş Zamanlılık İzleme",
            "vi_vn": "Theo dõi Xử lý đồng thời"
        },
        "CUSTOMDEPLOY_APM_SPA_SL_MAIN" : {
            "en_us": "Search Performance Analysis",
            "zh_cn": "搜索性能分析",
            "zh_tw": "搜尋效能分析",
            "cs_cz": "Analýza výkonu vyhledávání",
            "da_dk": "Analyse af søgepræstation",
            "nl_nl": "Zoekprestatieanalyse",
            "fi_fi": "Haun suorituskykyanalyysi",
            "fr_ca": "Analyse de performance des recherches",
            "fr_fr": "Analyse de performance des recherches",
            "de_de": "Leistungsanalyse suchen",
            "id_id": "Cari Analisis Kinerja",
            "it_it": "Analisi delle prestazioni di ricerca",
            "ja_jp": "検索パフォーマンスの分析",
            "ko_kr": "검색 성능 분석",
            "es_ar": "Análisis de rendimiento de búsquedas",
            "no_no": "Analyse av søkeytelse",
            "pt_br": "Buscar análise de desempenho",
            "ru_ru": "Анализ производительности поиска",
            "es_es": "Análisis de rendimiento de búsquedas",
            "sv_se": "Analys av sökprestanda",
            "th_th": "ค้นหาการวิเคราะห์ประสิทธิภาพ",
            "tr_tr": "Arama Performansı Analizi",
            "vi_vn": "Phân tích hiệu suất tìm kiếm"
        },
        "CUSTOMDEPLOY_APM_SPD_SL_MAIN" : {
            "en_us": "Search Performance Details",
            "zh_cn": "搜索性能详细信息",
            "zh_tw": "搜尋效能明細",
            "cs_cz": "Detaily výkonu vyhledávání",
            "da_dk": "Detaljer om søgepræstation",
            "nl_nl": "Details zoekprestaties",
            "fi_fi": "Haun suorituskykytiedot",
            "fr_ca": "Détails de performance des recherches",
            "fr_fr": "Détails de performance des recherches",
            "de_de": "Details Suchleistung",
            "id_id": "Cari Detail Kinerja",
            "it_it": "Dettagli delle prestazioni di ricerca",
            "ja_jp": "検索パフォーマンス詳細",
            "ko_kr": "검색 성능 세부정보",
            "es_ar": "Detalles de rendimiento de búsquedas",
            "no_no": "Detaljer om søkeytelse",
            "pt_br": "Buscar detalhes de desempenho",
            "ru_ru": "Данные производительности поиска",
            "es_es": "Detalles de rendimiento de búsquedas",
            "sv_se": "Sökprestandadetaljer",
            "th_th": "ค้นหารายละเอียดประสิทธิภาพ",
            "tr_tr": "Arama Performansı Ayrıntıları",
            "vi_vn": "Chi tiết hiệu suất tìm kiếm"
        },
        "CUSTOMDEPLOY_APM_SETUP_SL_MAIN" : {
            "en_us": "APM Setup",
            "zh_cn": "APM 设置",
            "zh_tw": "APM 設定",
            "cs_cz": "Nastavení aplikace APM",
            "da_dk": "APM-opsætning",
            "nl_nl": "Instellingen APM",
            "fi_fi": "APM-asetukset",
            "fr_ca": "Configuration APM",
            "fr_fr": "Configuration APM",
            "de_de": "APM-Setup",
            "id_id": "Penyiapan APM",
            "it_it": "Impostazione APM",
            "ja_jp": "APMの設定",
            "ko_kr": "APM 설정",
            "es_ar": "Configuración de APM",
            "no_no": "APM-oppsett",
            "pt_br": "Configuração de APM",
            "ru_ru": "Настройка APM",
            "es_es": "Configuración de APM",
            "sv_se": "APM: Inställningar",
            "th_th": "การตั้งค่า APM",
            "tr_tr": "Uygulama Performansı Yönetimi Ayarları",
            "vi_vn": "Cài đặt APM"
        }
    };

    function run(context) {
        //Localization for center links
        setLinkTranslations();
    }

    function setLinkTranslations() {
        var deploymentIds = getDeploymentIds();

        if (deploymentIds && (deploymentIds.length <= Object.keys(SCRIPTID).length)) {
            for (var i in deploymentIds) {
                var rec = record.load({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: deploymentIds[i].id
                });

                var localizedStrings = TRANSLATEDSTRINGS[deploymentIds[i].scriptid];
                for (var locale in localizedStrings) {
                    if (localizedStrings.hasOwnProperty(locale)) {
                        rec.setSublistValue({
                            sublistId: 'links',
                            fieldId: 'linklabel_' + locale,
                            line: 0,
                            value: localizedStrings[locale]
                        });
                    }
                }

                rec.save();
            }
        }
    }

    function getDeploymentIds() {
        var sf = [
            ['scriptid', 'is', SCRIPTID.AH]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.RPM]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.PTS]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.PTD]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SSA]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SCPM]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SPJD]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.WSA]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.CM]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SPA]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SPD]
            , 'or'
            , ['scriptid', 'is', SCRIPTID.SETUP]
        ];
        var sc = ['scriptid'];
        var deployments = new Array();

        var deploymentSearch = search.create({
            type: search.Type.SCRIPT_DEPLOYMENT,
            filters: sf,
            columns: sc
        }).run();

        deploymentSearch.each(function(result) {
            deployments.push({
                id: result.id,
                scriptid: result.getValue({name: 'scriptid'})
            });

            return true;
        });

        return deployments;
    }

    return {
        run: run
    };
});
