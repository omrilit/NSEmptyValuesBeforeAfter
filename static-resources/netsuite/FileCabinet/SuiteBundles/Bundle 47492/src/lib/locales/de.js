/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Translation = TAF.Translation || {};

TAF.Translation.de = TAF.Translation.de || {
    Culture: 'de',
    Strings: {
        FORM_TITLE: 'Prüfdateien',
        GENERATE: 'Generieren',
        RESET: 'Zurücksetzen',
        REPORT_FIELD_LABEL: 'Bericht',
        REPORT_FIELD_HELP: 'Wählen Sie das Exportformat für Steuerprüfdateien aus, das Sie generieren möchten.',
        SUB_FIELD_LABEL: 'Niederlassung',
        SUB_FIELD_HELP: 'Wählen Sie aus, welche Niederlassungsdaten in der generierten Steuerprüfdatei enthalten sein werden. Nur verfügbar in OneWorld.',
        GROUP_FIELD_LABEL: 'Gruppe',
        GROUP_FIELD_HELP: [
            'In manchen Ländern ist Gruppenberichterstattung oder die Möglichkeit, das Mutterunternehmen die Berichte für ihre',
            'Niederlassungen konsolidieren zu lassen, zulässig. Aktivieren Sie dieses Kästchen, um Gruppenberichterstellung zu',
            'aktivieren. Nur verfügbar in OneWorld.'
        ].join(' '),
        STARTPERIOD_FIELD_LABEL: 'Periode',
        STARTPERIOD_FIELD_HELP: 'Wählen Sie den Periodenbereich aus, der in den Datenexport eingeschlossen werden soll. Dies basiert auf Buchhaltungsperioden.',
        ENDPERIOD_FIELD_LABEL: 'Bis',
        ENDPERIOD_FIELD_HELP: 'Wählen Sie den Periodenbereich aus, der in den Datenexport eingeschlossen werden soll. Dies basiert auf Buchhaltungsperioden.',		ACCOUNTING_CONTEXT_FIELD_LABEL : 'Buchhaltungskontext',		ACCOUNTING_CONTEXT_FIELD_HELP : 'Wählen Sie den anwendbaren Buchhaltungskontext für den Bericht.',
        ACCOUNTING_BOOK_FIELD_LABEL: 'Geschäftsbuch',
		ACCOUNTING_BOOK_FIELD_HELP: 'Wählen Sie den anwendbaren Geschäftsbuchkontext für den Bericht.',
        POSTING_DATE_LABEL: 'Use Transaction Date',
        POSTING_DATE_FIELD_HELP: 'Check this box to use the Transaction Date as the Ecriture Date in the FEC file.',
        YES: 'Ja',
        NO: 'Nein',
        DELETED: 'Gelöscht',
        CANCELLED: 'Storniert',
        REMOVED: 'Entfernt',
        GENERATED: 'Generiert',
        DOWNLOADED: 'Generiert',
        
        // Audit Files tab
        JOB_SUBLIST_SUBTAB: 'Prüfdateien',
        JOB_SUBLIST_CREATEDATE: 'Erstellungsdatum',
        JOB_SUBLIST_CREATOR: 'Erstellt von',
        JOB_SUBLIST_REPORT: 'Bericht',
        JOB_SUBLIST_SUB: 'Niederlassung',
        JOB_SUBLIST_ISGROUPED: 'Gruppiert',
        JOB_SUBLIST_PERIOD: 'Periode',
        JOB_SUBLIST_DOWNLOAD: 'Herunterladen',
        JOB_SUBLIST_FAILED: 'Fehlgeschlagen',
        JOB_SUBLIST_DELETE: 'Löschen',
        JOB_SUBLIST_CANCEL: 'Abbrechen',
        JOB_SUBLIST_REMOVE: 'Entfernen',
        JOB_SUBLIST_GROUPED: 'gruppiert',
        JOB_SUBLIST_ACCOUNTING_BOOK: 'Geschäftsbuch',        JOB_SUBLIST_ACCOUNTING_CONTEXT: 'Buchhaltungskontext',
        
        // System Notes tab
        LOG_SUBLIST_SUBTAB: 'Systemanmerkungen',
        LOG_SUBLIST_DATE: 'Datum',
        LOG_SUBLIST_USER: 'Benutzer',
        LOG_SUBLIST_ACTION: 'Aktion',
        LOG_SUBLIST_FILENAME: 'Dateiname',
        
        // Form messages
        MSG_DISCLAIMER: [
            'Wichtig: Mit der Verwendung des Steuerprüfdateien-Bündels von NetSuite übernehmen Sie die volle Verantwortung dafür, sicherzustellen,',
            'dass die Daten, die Sie generieren und herunterladen, korrekt und für Ihre Zwecke ausreichend sind.  Sie übernehmen außerdem die volle',
            'Verantwortung für die Sicherheit jeglicher Daten, die Sie von NetSuite herunterladen und anschließend außerhalb des NetSuite-Systems speichern.'
        ].join(' '),
        MSG_ALERT_QUEUED_TITLE: 'Bestätigung ',
        MSG_ALERT_QUEUED: [
            'Ihre Anfrage wurde der Warteschlange hinzugefügt. Eine E-Mail-Nachricht wird an Ihr Konto gesendet, nachdem die',
            'angeforderte Datei erfolgreich generiert wurde.'
        ].join(' '),
        MSG_ALERT_BUSY_TITLE: 'Steuerprüfungsdatei konnte nicht generiert werden.',
        MSG_ALERT_BUSY: 'Zurzeit werden andere Steuerprüfungsdateien generiert. Bitte versuchen Sie es später erneut. ',
        MSG_NO_DATA: 'Keine Daten verfügbar ',
        MSG_CONFIRM_DELETE: 'Sind Sie sicher? ',
        MSG_PERIOD_NOT_CHRONOLOGICAL: 'Ende der Periode kann nicht vor dem Beginn der Periode liegen. ',
        
        // Email notification
        EMAIL_SUCCESS_SUBJECT: 'Exportbenachrichtigung für NetSuite Steuerprüfungsdatei [Erfolgreich] ',
        EMAIL_SUCCESS_BODY: [
            'Grüße von NetSuite! \n\nVielen Dank, dass Sie den Steuerprüfungsdateien-Generator verwenden. Hier ist der Status Ihres',
            'Datenexports:\n\nDatum und Zeit des Exports. {dateCreated}\nDatumsbereich des Datenexports: {dateRange}\nBericht:',
            '{reportName}\nDateiname: {filename}\n\nDie Audiodatei wurde erfolgreich generiert.\n\nDie Datei kann heruntergeladen',
            'werden unter:\n{reportUrl}\n\nSie finden den Datenexport auch auf der Seite "Bericht Steuerprüfungsdateien".\n\nMit',
            'freundlichen Grüßen\nDas NetSuite-Team\n\n\n***BITTE ANTWORTEN SIE NICHT AUF DIESE NACHRICHT***'
        ].join(' '),
        EMAIL_FAILED_SUBJECT: 'Exportbenachrichtigung für NetSuite-Steuerprüfungsdatei [Fehlgeschlagen]',
        EMAIL_FAILED_BODY: [
            'Grüße von NetSuite! \n\nVielen Dank, dass Sie den Steuerprüfungsdateien-Generator verwenden. Hier ist der Status Ihres Datenexports:',
            '\n\nDatum und Zeit des Exports. {dateCreated}\nDatumsbereich des Datenexports: {dateRange}\nBericht: {reportName}\n\nDer Export der',
            'Prüfungsdatei ist fehlgeschlagen:\n{errorMessage}\n\n1. Bitte wechseln Sie zur Berichtseite für Steuerprüfungsdateien und suchen Sie',
            'nach Ihrem Datenexport.\n2. Bitte überprüfen Sie die Parameter Ihres Datenexports wie etwa den Datenbereich, um sicherzustellen, dass',
            'sie korrekt sind.\n3. Wenn Sie weiterhin eine Fehlermeldung erhalten, kontaktieren Sie den Support über Ihre normalen Support-Kanäle,',
            'um weitere Informationen zum Beheben dieses Fehlers zu erhalten.\n4. Sie können auch die fehlgeschlagene Datenexportdatei löschen und',
            'aus der Liste entfernen.\n\nMit freundlichen Grüßen\nDas NetSuite-Team\n\n\n***BITTE ANTWORTEN SIE NICHT AUF DIESE NACHRICHT***'
        ].join(' '),
        
        // Audit Files generation: validation  error messages
        ERR_UNASSIGNED_PERIODS: [
		    'The report cannot be generated because either the selected period is unassigned or the subsidiary\'s fiscal calendar contains unassigned periods.\n',
			'To add unassigned periods to accounting period rollups:\n',
			'1.	On the Manage Accounting Periods page, select a fiscal calendar and check for unassigned periods.\n',
			'2.	Click an unassigned period to edit.\n',
			'3.	On the Edit Accounting Period page, assign the period to a sub-period for each fiscal calendar that exists.\n',
			'4.	Click Save.\n\n',
			'For more information, read the help topic, Using Fiscal Calendars at:\n',
			'{usingFiscalCalendarHelpUrl}\n'
		].join(' '),
		ERR_UNASSIGNED_PERIODS_URL: '/app/help/helpcenter.nl?fid=section_N1449211.html&_lang=de_DE',
        ERR_CURRENCY_CHECK: 'Mindestens eine Niederlassung weist eine andere Währung als die ausgewählte Niederlassung auf: {subsidiaries}. ',
        ERR_FR_SAFT_BLANK_GL_NO: 'Download fehlgeschlagen. Bitte führen Sie HB-Nummerierungssequenzen aus. ',
        ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF: [
            'Bitte aktivieren Sie das Merkmal "Nummerierung der HB-Prüfung" und führen Sie HB-Nummerierungssequenzen aus. Um "Nummerierung der',
            'HB-Prüfung" zu aktivieren, wechseln Sie zu "Installation" > "Firma" > "Merkmale aktivieren" und aktivieren Sie das Kontrollkästchen',
            '"Nummerierung der HB-Prüfung" auf dem untergeordneten Tab "Rechnungswesen".'
        ].join(' '),
        MX_DIOT_NO_CLEARED_TXNS: [
            'Nur verrechnete Transaktionen sind im DIOT-Bericht enthalten. Die von Ihnen ausgewählte Periode enthält keine verrechneten Perioden.',
            'Stimmen Sie Transaktionen ab, bevor Sie den DIOT-Bericht generieren.'
        ].join(' '),
        
        // Statutory Chart of Accounts
        SCOA_FORM_TITLE: 'Gesetzmäßige Kontenübersicht',
        SCOA_EDIT_BUTTON: 'Bearbeiten',
        SCOA_CANCEL_BUTTON: 'Abbrechen',
        SCOA_SUBSIDIARY_FILTER: 'Niederlassung',
        SCOA_SUBSIDIARY_FILTER_HELP: 'Wählen Sie die Niederlassung aus, für die Sie die die gesetzmäßige Kontenübersicht erstellen möchten.',
        SCOA_ACCOUNT_TYPE_FILTER: 'Kontenart',
        SCOA_ACCOUNT_TYPE_FILTER_HELP: 'Verwenden Sie dieses Datenfeld, um die Konten zu filtern, die auf dieser Seite erscheinen.',
        SCOA_ACCOUNT_TYPE_ALL: '- Alle -',
        SCOA_SUBLIST_NAME: 'Kontenübersicht',
        SCOA_ACCOUNT_COLUMN: 'Konto',
        SCOA_NUMBER_COLUMN: 'Kontonummer',
        SCOA_NAME_COLUMN: 'Kontoname',
        SCOA_CONFIRMATION: 'Bestätigung',
        SCOA_ERROR: 'Fehler',
        SCOA_RELOAD_WARNING_MESSAGE: 'Daten, die Sie auf dieser Seite eingegeben haben, wurden nicht gespeichert und gehen verloren. Klicken Sie auf "OK", um fortzufahren.',
        SCOA_SAVE_CONFIRMATION_MESSAGE: 'Die gesetzmäßige Kontenübersicht wurde erfolgreich gespeichert.',
        SCOA_SAVE_ERROR_MESSAGE: 'Einige Änderungen wurden nicht gespeichert. Bitte aktualisieren Sie die Seite.',		SCOA_DEPRECATION_MESSAGE: [   			'Notice: The Statutory Chart of Accounts feature in the Tax Audit Files SuiteApp will be deprecated in a future ',
			'version of NetSuite. Details of when this change takes effect will be communicated to you, when a definite release ',
			'date has been set. In preparation for this change, you must start using Accounting Contexts to define the ',
			'country-specific account names and numbers to include in the tax audit file. For more information, see '		].join(''),				SCOA_SETUP_ACCT_CONTEXT_LABEL: 'Setting Up Accounting Contexts',
        
        // TAF Mapper
        MAPPER_FORM_TITLE: 'Datenfeldzuordnung Steuerprüfungsdateien',
        MAPPER_EDIT_BUTTON: 'Bearbeiten',
        MAPPER_CANCEL_BUTTON: 'Abbrechen',
        MAPPER_SUBLIST_NAME: 'Zuordnung',
        MAPPER_CATEGORY_LABEL: 'Kategorie',
        MAPPER_TO_LABEL: 'Wert',
        MAPPER_SAVE_SUCCESSFUL: 'Erfolgreich gespeichert.',
        MAPPER_SAVE_ERROR: 'Einige Änderungen wurden nicht gespeichert. Bitte aktualisieren Sie die Seite.',
        MAPPER_SUCCESS: 'Bestätigung',
        MAPPER_ERROR: 'Fehler',
        MAPPER_RELOAD_WARNING_MESSAGE: 'Daten, die Sie auf dieser Seite eingegeben haben, wurden nicht gespeichert und gehen verloren. Klicken Sie auf "OK", um fortzufahren.',
        MAPPER_IMPORT_HELP_VIEWONLY_URL: 'DOC_section_4252635509',
        MAPPER_IMPORT_HELP_VIEWONLY_TXT: 'Click here for Field Mapping for Mexico help topic.',//TODO For translation
        
        // UI Field Labels
        TAF_MAPPING_BANK: 'Bank',//TODO For translation
        TAF_MAPPING_PAYMENT_METHOD: 'Payment Method',//TODO For translation
        TAF_MAPPING_ACCOUNT_TYPE: 'Kontenart',
        TAF_MAPPING_ACCOUNT: 'Konto',
        TAF_MAPPING_SUBSIDIARY: 'Niederlassung',
        TAF_MAPPING_TRANSACTION_TYPE: 'Transaction Type',//TODO For translation
        TAF_MAPPING_POLICY_TYPE: 'Policy',//TODO For translation
        
        //France SAFT
        GENERAL_LEDGER: 'General Ledger', //TODO For translation
        
        //Spain SII
        SII_RETROACTIVE_DESCRIPTION: 'Register from first half of year'
    }
};
