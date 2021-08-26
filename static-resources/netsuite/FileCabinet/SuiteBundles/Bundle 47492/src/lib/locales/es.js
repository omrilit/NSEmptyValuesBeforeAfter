/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Translation = TAF.Translation || {};
 
TAF.Translation.es = TAF.Translation.es || {
    Culture: 'es',
    Strings: {
        FORM_TITLE: 'Archivos de auditoría',
        GENERATE: 'Generar',
        RESET: 'Restablecer',
        REPORT_FIELD_LABEL: 'Informe',
        REPORT_FIELD_HELP: 'Seleccione el formato de exportación del archivo de auditoría impositiva que se generará.',
        SUB_FIELD_LABEL: 'Subsidiaria',
        SUB_FIELD_HELP: [
            'Seleccione los datos de la subsidiaria que se incluirán en el archivo de auditoría impositiva que se generará.',
            'Disponible solo en OneWorld.',
        ].join(' '),
        GROUP_FIELD_LABEL: 'Agrupar',
        GROUP_FIELD_HELP: [
            'En algunos países, se permite que la compañía controlante consolide los informes de sus subsidiarias.',
            'Tilde esta casilla para permitir que la controlante reporte por todo el grupo. Solo disponible en OneWorld.'
        ].join(' '),
        STARTPERIOD_FIELD_LABEL: 'Período',
        STARTPERIOD_FIELD_HELP: 'Seleccione el rango del período que se incluirá en la exportación de datos. Se basa en los ejercicios contables.',
        ENDPERIOD_FIELD_LABEL: 'Hasta',
        ENDPERIOD_FIELD_HELP: 'Seleccione el rango del período que se incluirá en la exportación de datos. Se basa en los ejercicios contables.',		ACCOUNTING_CONTEXT_FIELD_LABEL : 'Contexto de contabilidad',		ACCOUNTING_CONTEXT_FIELD_HELP : 'Seleccione el contexto de contabilidad correspondiente para el informe.',
        ACCOUNTING_BOOK_FIELD_LABEL: 'Libro de contabilidad',
		ACCOUNTING_BOOK_FIELD_HELP: 'Seleccione el contexto del libro de contabilidad correspondiente para el informe.',
        POSTING_DATE_LABEL: 'Use Transaction Date',
        POSTING_DATE_FIELD_HELP: 'Check this box to use the Transaction Date as the Ecriture Date in the FEC file.',
        YES: 'Sí',
        NO: 'No',
        DELETED: 'Eliminado',
        CANCELLED: 'Cancelado',
        REMOVED: 'Quitado',
        GENERATED: 'Generado',
        DOWNLOADED: 'Generado',
        
        // Audit Files tab
        JOB_SUBLIST_SUBTAB: 'Archivos de auditoría',
        JOB_SUBLIST_CREATEDATE: 'Fecha de creación',
        JOB_SUBLIST_CREATOR: 'Creado por',
        JOB_SUBLIST_REPORT: 'Informe',
        JOB_SUBLIST_SUB: 'Subsidiaria',
        JOB_SUBLIST_ISGROUPED: 'Agrupado',
        JOB_SUBLIST_PERIOD: 'Período',
        JOB_SUBLIST_DOWNLOAD: 'Descargar',
        JOB_SUBLIST_FAILED: 'Falló',
        JOB_SUBLIST_DELETE: 'Eliminar',
        JOB_SUBLIST_CANCEL: 'Cancelar',
        JOB_SUBLIST_REMOVE: 'Quitar',
        JOB_SUBLIST_GROUPED: 'agrupado',
        JOB_SUBLIST_ACCOUNTING_BOOK: 'Libro de contabilidad',        JOB_SUBLIST_ACCOUNTING_CONTEXT: 'Contexto de contabilidad',
        
        // System Notes tab
        LOG_SUBLIST_SUBTAB: 'Notas del sistema',
        LOG_SUBLIST_DATE: 'Fecha',
        LOG_SUBLIST_USER: 'Usuario',
        LOG_SUBLIST_ACTION: 'Acción',
        LOG_SUBLIST_FILENAME: 'Nombre del archivo',
        
        // Form messages
        MSG_DISCLAIMER: [
            'Importante: Al usar el paquete de archivos de auditoría impositiva NetSuite,',
            'usted asume toda responsabilidad para determinar si los datos que genera y descarga son precisos o suficientes para los fines pertinentes.',
            'Usted también asume toda responsabilidad sobre la seguridad de todos los datos que descargue de NetSuite y luego guarde fuera del sistema de NetSuite.'
        ].join(' '),
        MSG_ALERT_QUEUED_TITLE: 'Confirmación',
        MSG_ALERT_QUEUED: [
            'Su solicitud se agregó a la cola. Recibirá un correo en su cuenta luego de que se haya generado el archivo que solicitó.'
        ].join(' '),
        MSG_ALERT_BUSY_TITLE: 'No se puede generar un archivo de auditoría.',
        MSG_ALERT_BUSY: 'Se están generando otros archivos de auditoría. Vuelva a intentarlo más tarde. ',
        MSG_NO_DATA: 'No hay datos disponibles.',
        MSG_CONFIRM_DELETE: '¿Está seguro?',
        MSG_PERIOD_NOT_CHRONOLOGICAL: 'El período de finalización no puede ser anterior al período de inicio.',
        
        // Email notification
        EMAIL_SUCCESS_SUBJECT: 'Notificación de la exportación del archivo de auditoría impositiva de NetSuite: Se generó con éxito. ',
        EMAIL_SUCCESS_BODY: [
            '¡Saludos de NetSuite!\n\n Gracias por usar el generador de archivos de auditoría impositiva.',
            'Este es el estado de la exportación de sus datos: \n\n Fecha y hora de exportación: {dateCreated}',
            '\nRango de fechas de exportación de los datos: {dateRange}\nInforme: {reportName}\nNombre del archivo:',
            '{filename}\n\nEl archivo de auditoría se generó correctamente.\n\nSe puede descargar el archivo en:',
            '\n{reportUrl}\n\nTambién puede encontrar la exportación de datos en la página del informe de archivos de auditoría impositiva.',
            '\n\nCordialmente,\nEl equipo de NetSuite\n\n\n***NO RESPONDA A ESTE MENSAJE***'
        ].join(' '),
        EMAIL_FAILED_SUBJECT: 'Notificación de la exportación del archivo de auditoría impositiva de NetSuite: Falló la exportación.',
        EMAIL_FAILED_BODY: [
            '¡Saludos de NetSuite!\n\n Gracias por usar el generador de archivos de auditoría impositiva.',
            'Este es el estado de la exportación de sus datos:\n\nFecha y hora de exportación: {dateCreated}',
            '\nRango de fechas de exportación de los datos: {dateRange}\nInforme: {reportName}',
            '\n\nFalló la exportación del archivo de auditoría:\n{errorMessage}',
            '\n\n1.  Diríjase a la página de informes de los archivos de auditoría impositiva y busque la exportación de sus datos.',
            '\n2.  Verifique los parámetros de la exportación de sus datos, por ejemplo, el rango de fechas,',
            'para asegurarse de que sean correctos.',
            '\n3.  Si sigue obteniendo un error, contáctese con el servicio de ayuda a través de los canales',
            'de ayuda habituales para obtener más información sobre cómo resolver el error.',
            '\n4.  También, puede optar por borrar la exportación que falló para quitarla de la lista.',
            '\n\nCordialmente,\nEl equipo de NetSuite \n\n\n*** NO RESPONDA A ESTE MENSAJE***'
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
        ERR_CURRENCY_CHECK: 'Una o más subsidiarias tienen una moneda diferente de la subsidiaria seleccionada: {subsidiaries}. ',
        ERR_FR_SAFT_BLANK_GL_NO: 'Falló la descarga. Realice las secuencias de numeración del libro mayor. ',
        ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF: [
            'Habilite la opción numeración de auditoría del libro mayor y realice las secuencias de numeración del libro mayor.',
            'Para habilitar la numeración de la auditoría del libro mayor, vaya a Configurar > Compañía > Habilitar',
            'opciones y tilde la casilla Numeración de la auditoría del libro mayor en la subpestaña Contabilidad.'
        ].join(' '),
        MX_DIOT_NO_CLEARED_TXNS: [
            'El informe de la DIOT solo incluye las transacciones confirmadas.',
            'El período que seleccionó no tiene transacciones confirmadas.',
            'Asegúrese de conciliar las transacciones antes de generar el informe de la DIOT.'
        ].join(' '),
        
        // Statutory Chart of Accounts
        SCOA_FORM_TITLE: 'Plan contable legal',
        SCOA_EDIT_BUTTON: 'Editar',
        SCOA_CANCEL_BUTTON: 'Cancelar',
        SCOA_SUBSIDIARY_FILTER: 'Subsidiaria',
        SCOA_SUBSIDIARY_FILTER_HELP: 'Seleccione la subsidiaria para la cual quiera crear el plan contable legal.',
        SCOA_ACCOUNT_TYPE_FILTER: 'Tipo de cuenta',
        SCOA_ACCOUNT_TYPE_FILTER_HELP: 'Use este campo para filtrar las cuentas que aparecerán en esta página.',
        SCOA_ACCOUNT_TYPE_ALL: '- Todas -',
        SCOA_SUBLIST_NAME: 'Plan contable',
        SCOA_ACCOUNT_COLUMN: 'Cuenta',
        SCOA_NUMBER_COLUMN: 'Número de cuenta',
        SCOA_NAME_COLUMN: 'Nombre de cuenta',
        SCOA_CONFIRMATION: 'Confirmación',
        SCOA_ERROR: 'Error',
        SCOA_RELOAD_WARNING_MESSAGE: 'Los datos que ingresó en esta página no se guardaron y se perderán. Presione OK para seguir.',
        SCOA_SAVE_CONFIRMATION_MESSAGE: 'Se guardó el plan contable legal.',
        SCOA_SAVE_ERROR_MESSAGE: 'Algunos cambios no se guardaron. Vuelva a cargar la página.',		SCOA_DEPRECATION_MESSAGE: [			'Notice: The Statutory Chart of Accounts feature in the Tax Audit Files SuiteApp will be deprecated in a future ',
			'version of NetSuite. Details of when this change takes effect will be communicated to you, when a definite release ',
			'date has been set. In preparation for this change, you must start using Accounting Contexts to define the ',
			'country-specific account names and numbers to include in the tax audit file. For more information, see '		].join(''),				SCOA_SETUP_ACCT_CONTEXT_LABEL: 'Setting Up Accounting Contexts',
        
        //TAF Mapper
        MAPPER_FORM_TITLE: 'Asignación de campos de archivos de auditoría',
        MAPPER_EDIT_BUTTON: 'Editar',
        MAPPER_CANCEL_BUTTON: 'Cancelar',
        MAPPER_SUBLIST_NAME: 'Asignación',
        MAPPER_CATEGORY_LABEL: 'Categoría',
        MAPPER_TO_LABEL: 'Valor',
        MAPPER_SAVE_SUCCESSFUL: 'Se guardó correctamente.',
        MAPPER_SAVE_ERROR: 'Algunos cambios no se guardaron. Vuelva a cargar la página.',
        MAPPER_SUCCESS: 'Confirmación',
        MAPPER_ERROR: 'Error',
        MAPPER_RELOAD_WARNING_MESSAGE: 'Los datos que ingresó en esta página no se guardaron y se perderán. Presione OK para seguir.',
        MAPPER_IMPORT_HELP_VIEWONLY_URL: 'DOC_section_4252635509',
        MAPPER_IMPORT_HELP_VIEWONLY_TXT: 'Haga clic aquí para ver el tema de ayuda Asignación de campos para México.',
        
        // UI Field Labels
        TAF_MAPPING_BANK: 'Banco',
        TAF_MAPPING_PAYMENT_METHOD: 'Forma de pago',
        TAF_MAPPING_ACCOUNT_TYPE: 'Tipo de cuenta',
        TAF_MAPPING_ACCOUNT: 'Cuenta',
        TAF_MAPPING_SUBSIDIARY: 'Subsidiaria',
        TAF_MAPPING_TRANSACTION_TYPE: 'Tipo de transacción',
        TAF_MAPPING_POLICY_TYPE: 'Política',
		
        //France SAFT
        GENERAL_LEDGER: 'General Ledger', //TODO for translation
            
        //Spain SII
        SII_RETROACTIVE_DESCRIPTION: 'Registro del primer semestre'
    }
};
