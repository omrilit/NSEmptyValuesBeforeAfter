/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Translation = TAF.Translation || {};
 
TAF.Translation.fr = TAF.Translation.fr || {
    Culture: 'fr',
    Strings: {
        FORM_TITLE: 'Fichiers d\'audit',
        GENERATE: 'Générer',
        RESET: 'Réinitialiser',
        REPORT_FIELD_LABEL: 'Rapport',
        REPORT_FIELD_HELP: 'Sélectionnez le format d\'exportation du fichier d\'audit fiscal à générer.',
        SUB_FIELD_LABEL: 'Filiale',
        SUB_FIELD_HELP: [
            'Sélectionnez les données de filiales à inclure dans le fichier d\'audit fiscal à générer. Disponible uniquement',
            'dans OneWorld.'
        ].join(' '),
        GROUP_FIELD_LABEL: 'Regrouper',
        GROUP_FIELD_HELP: [
            'Dans certains pays, l\'établissement de rapports groupés ou la consolidation de rapports par un parent',
            'pour ses filiales sont autorisés. Cochez cette case pour activer l\'établissement de rapports groupés.',
            'Disponible uniquement dans OneWorld.'
        ].join(' '),
        STARTPERIOD_FIELD_LABEL: 'Période',
        STARTPERIOD_FIELD_HELP: [
            'Sélectionnez la plage de périodes à inclure dans l\'exportation des données. Celle-ci est basée sur les',
            'exercices comptables.'
        ].join(' '),
        ENDPERIOD_FIELD_LABEL: 'De',
        ENDPERIOD_FIELD_HELP: [
            'Sélectionnez la plage de périodes à inclure dans l\'exportation des données. Celle-ci est basée sur les',
            'exercices comptables.'
        ].join(' '),		ACCOUNTING_CONTEXT_FIELD_LABEL : 'Contexte de comptabilité',		ACCOUNTING_CONTEXT_FIELD_HELP : 'Sélectionnez le contexte de comptabilité pour le rapport.',
        ACCOUNTING_BOOK_FIELD_LABEL: 'Livre comptable',
		ACCOUNTING_BOOK_FIELD_HELP: 'Sélectionnez le contexte relatif au livre comptable pour le rapport.',
        POSTING_DATE_LABEL: 'Utiliser la date de transaction',
        POSTING_DATE_FIELD_HELP: 'Cochez cette case pour utiliser la date de transaction comme date d’écritures dans le fichier FEC.',
        YES: 'Oui',
        NO: 'Non',
        DELETED: 'Supprimé',
        CANCELLED: 'Annulé',
        REMOVED: 'Retiré',
        GENERATED: 'Généré',
        DOWNLOADED: 'Généré',
        
        // Audit Files tab
        JOB_SUBLIST_SUBTAB: 'Fichiers d\'audit',
        JOB_SUBLIST_CREATEDATE: 'Date de création',
        JOB_SUBLIST_CREATOR: 'Créé par',
        JOB_SUBLIST_REPORT: 'Rapport',
        JOB_SUBLIST_SUB: 'Filiale',
        JOB_SUBLIST_ISGROUPED: 'Groupé',
        JOB_SUBLIST_PERIOD: 'Période',
        JOB_SUBLIST_DOWNLOAD: 'Télécharger',
        JOB_SUBLIST_FAILED: 'En échec',
        JOB_SUBLIST_DELETE: 'Supprimer',
        JOB_SUBLIST_CANCEL: 'Annuler',
        JOB_SUBLIST_REMOVE: 'Retirer',
        JOB_SUBLIST_GROUPED: 'groupé',
        JOB_SUBLIST_ACCOUNTING_BOOK: 'Livre comptable',        JOB_SUBLIST_ACCOUNTING_CONTEXT: 'Contexte de comptabilité',
        
        // System Notes tab
        LOG_SUBLIST_SUBTAB: 'Notes système',
        LOG_SUBLIST_DATE: 'Date',
        LOG_SUBLIST_USER: 'Utilisateur',
        LOG_SUBLIST_ACTION: 'Action',
        LOG_SUBLIST_FILENAME: 'Nom de fichier',
        
        // Form messages
        MSG_DISCLAIMER: [
            'Important : lorsque vous utilisez le groupe de fichiers d\'audit fiscal de NetSuite,',
            'vous êtes tenu de vérifier que les données générées et téléchargées sont exactes ou répondent à vos besoins.',
            'Vous assumez également l\'entière responsabilité de la sécurité des données que vous',
            'téléchargez depuis NetSuite pour les stocker par la suite en dehors du système NetSuite.'
        ].join(' '),
        MSG_ALERT_QUEUED_TITLE: 'Confirmation',
        MSG_ALERT_QUEUED: [
            'Votre demande a été ajoutée à la file d\'attente.',
            'Un e-mail sera envoyé à votre compte après la génération avec succès du fichier demandé.',
        ].join(' '),
        MSG_ALERT_BUSY_TITLE: 'Impossible de générer un fichier d\'audit',
        MSG_ALERT_BUSY: 'D\'autres fichiers d\'audit sont actuellement en cours de génération. Veuillez réessayer plus tard.',
        MSG_NO_DATA: 'Aucune donnée disponible',
        MSG_CONFIRM_DELETE: 'Êtes-vous certain ?',
        MSG_PERIOD_NOT_CHRONOLOGICAL: 'La période de fin ne peut être antérieure à la période de début.',
        
        // Email notification
        EMAIL_SUCCESS_SUBJECT: 'Notification d\'exportation du fichier d\'audit fiscal NetSuite réussie ',
        EMAIL_SUCCESS_BODY: [
            'Salutations de NetSuite !\n\nMerci d\'avoir utilisé le générateur de fichiers d\'audit fiscal.',
            'Voici le statut de votre exportation de données :\n\nDate et heure de l\'exportation : {dateCreated}',
            '\nPlage de dates de l\'exportation des données : {dateRange}\nRapport : {reportName}\nNom de fichier :',
            '{filename}\n\nLe fichier d\'audit a été généré avec succès.\n\nLe fichier peut être téléchargé à partir de',
            ':\n{reportUrl}\n\nVous trouverez également l\'exportation des données sur la page de rapports de fichiers',
            'd\'audit fiscal.\n\nCordialement,\nLe personnel de NetSuite\n\n\n***NE PAS RÉPONDRE À CE MESSAGE***'
        ].join(' '),
        EMAIL_FAILED_SUBJECT: 'Échec de la notification d\'exportation du fichier d\'audit fiscal NetSuite',
        EMAIL_FAILED_BODY: [
            'Salutations de NetSuite !\n\nMerci d\'avoir utilisé le générateur de fichiers d\'audit fiscal.',
            'Voici le statut de votre exportation de données :\n\nDate et heure de l\'exportation : {dateCreated}',
            '\nPlage de dates de l\'exportation des données : {dateRange}\nRapport : {reportName}\n\nÉchec de',
            'l\'exportation du fichier d\'audit :\n{errorMessage}\n\n1.  Veuillez vous rendre sur la page de rapports de',
            'fichiers d\'audit fiscal et localiser votre exportation de données.\n2.  Veuillez vérifier les paramètres de',
            'votre exportation de données, comme la plage de dates, pour vous assurer qu\'ils sont corrects.\n3.',
            'Si vous continuez de recevoir une erreur, veuillez contacter l\'assistance via les moyens de communication',
            'habituels pour obtenir plus d\'informations sur la résolution de cette erreur.\n4.  Vous pouvez également',
            'supprimer le fichier en échec de l\'exportation des données pour le retirer de la liste.\n\nCordialement,',
            '\nLe personnel de NetSuite\n\n\n***NE PAS RÉPONDRE À CE MESSAGE***'
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
		ERR_UNASSIGNED_PERIODS_URL: '/app/help/helpcenter.nl?fid=section_N1449211.html',
        ERR_CURRENCY_CHECK: 'Une ou plusieurs filiales enfant possèdent une devise différente de celle de la filiale sélectionnée : {subsidiaries}.',
        ERR_FR_SAFT_BLANK_GL_NO: 'Échec du téléchargement. Veuillez exécuter des séquences de numérotation GL.',
        ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF: [
            'Veuillez activer la fonction de numérotation d\'audit GL et exécuter des séquences de numérotation GL.',
            'Pour activer la numérotation d\'audit GL, allez à Configuration > Entreprise > Activer les fonctions,',
            'et cochez la case Numérotation d\'audit GL sous le sous-onglet Comptabilité'
        ].join(' '),
        MX_DIOT_NO_CLEARED_TXNS: [
            'Seules les transactions approuvées sont incluses dans le rapport DIOT.',
            'La période que vous avez sélectionnée ne contient aucune transaction approuvée.',
            'Assurez-vous de rapprocher les transactions avant de générer le rapport DIOT.'
        ].join(' '),
        
        // Statutory Chart of Accounts
        SCOA_FORM_TITLE: 'Plan comptable statutaire',
        SCOA_EDIT_BUTTON: 'Modifier',
        SCOA_CANCEL_BUTTON: 'Annuler',
        SCOA_SUBSIDIARY_FILTER: 'Filiale',
        SCOA_SUBSIDIARY_FILTER_HELP: 'Sélectionnez la filiale pour laquelle vous souhaitez créer le plan comptable statutaire.',
        SCOA_ACCOUNT_TYPE_FILTER: 'Type de compte',
        SCOA_ACCOUNT_TYPE_FILTER_HELP: 'Utilisez ce champ pour filtrer les comptes qui apparaîtront sur cette page.',
        SCOA_ACCOUNT_TYPE_ALL: '- Tous -',
        SCOA_SUBLIST_NAME: 'Plan comptable',
        SCOA_ACCOUNT_COLUMN: 'Compte',
        SCOA_NUMBER_COLUMN: 'Numéro de compte',
        SCOA_NAME_COLUMN: 'Nom de compte',
        SCOA_CONFIRMATION: 'Confirmation',
        SCOA_ERROR: 'Erreur',
        SCOA_RELOAD_WARNING_MESSAGE: [
            'Les données que vous avez saisies sur cette page n\'ont pas été sauvegardées et vont être perdues.',
            'Appuyez sur OK pour continuer.',
        ].join(' '),
        SCOA_SAVE_CONFIRMATION_MESSAGE: 'Plan comptable statutaire sauvegardé avec succès.',
        SCOA_SAVE_ERROR_MESSAGE: 'Certaines modifications n&apos;ont pas été sauvegardées. Veuillez actualiser la page.',		SCOA_DEPRECATION_MESSAGE: [			'Notice: The Statutory Chart of Accounts feature in the Tax Audit Files SuiteApp will be deprecated in a future ',
			'version of NetSuite. Details of when this change takes effect will be communicated to you, when a definite release ',
			'date has been set. In preparation for this change, you must start using Accounting Contexts to define the ',
			'country-specific account names and numbers to include in the tax audit file. For more information, see '		].join(''),				SCOA_SETUP_ACCT_CONTEXT_LABEL: 'Setting Up Accounting Contexts',
        
        // TAF Mapper
        MAPPER_FORM_TITLE: 'Mappage des champs des fichiers d\'audit.',
        MAPPER_EDIT_BUTTON: 'Modifier',
        MAPPER_CANCEL_BUTTON: 'Annuler',
        MAPPER_SUBLIST_NAME: 'Mappage',
        MAPPER_CATEGORY_LABEL: 'Catégorie',
        MAPPER_TO_LABEL: 'Valeur',
        MAPPER_SAVE_SUCCESSFUL: 'Enregistré.',
        MAPPER_SAVE_ERROR: 'Certaines modifications n\'ont pas été sauvegardées. Veuillez actualiser la page.',
        MAPPER_SUCCESS: 'Confirmation',
        MAPPER_ERROR: 'Erreur',
        MAPPER_RELOAD_WARNING_MESSAGE: 'Les données que vous avez saisies sur cette page n\'ont pas été sauvegardées et vont être perdues. Appuyez sur OK pour continuer.',
        MAPPER_IMPORT_HELP_VIEWONLY_URL: 'DOC_section_4252635509',
        MAPPER_IMPORT_HELP_VIEWONLY_TXT: 'Click here for Field Mapping for Mexico help topic.',
        
        // UI Field Labels
        TAF_MAPPING_BANK: 'Bank',
        TAF_MAPPING_PAYMENT_METHOD: 'Mode de paiement',
        TAF_MAPPING_ACCOUNT_TYPE: 'Type de compte',
        TAF_MAPPING_ACCOUNT: 'Compte',
        TAF_MAPPING_SUBSIDIARY: 'Filiale',
        TAF_MAPPING_TRANSACTION_TYPE: 'Transaction Type', //TODO for translation
        TAF_MAPPING_POLICY_TYPE: 'Policy', //TODO for translation
        
        //France SAFT
        GENERAL_LEDGER:  'Grand livre général',
        
        //Spain SII
        SII_RETROACTIVE_DESCRIPTION: 'Register from first half of year'
    }
};
