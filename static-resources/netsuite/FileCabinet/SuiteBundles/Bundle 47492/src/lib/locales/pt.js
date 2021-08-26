/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Translation = TAF.Translation || {};
 
TAF.Translation.pt = TAF.Translation.pt || {
    Culture: 'pt',
    Strings: {
        FORM_TITLE: 'Arquivos de Auditoria',
        GENERATE: 'Gerar',
        RESET: 'Redefinir',
        REPORT_FIELD_LABEL: 'Relatório',
        REPORT_FIELD_HELP: 'Selecione o formato de exportação do arquivo de auditoria fiscal a ser gerado.',
        SUB_FIELD_LABEL: 'Subsidiária',
        SUB_FIELD_HELP: 'Selecione quais dados de subsidiária serão incluídos no arquivo de auditoria fiscal a ser gerado. Disponível apenas no OneWorld.',
        GROUP_FIELD_LABEL: 'grupo',
        GROUP_FIELD_HELP: [
            'Em alguns países, permite-se a geração de relatórios em grupo ou que a matriz consolide os relatórios para suas subsidiárias.',
			'Marque esta caixa para habilitar relatórios em grupo. Disponível apenas no OneWorld.'
        ].join(' '),
        STARTPERIOD_FIELD_LABEL: 'Período',
        STARTPERIOD_FIELD_HELP: 'Selecione o intervalo de períodos a ser incluído na exportação de dados. A seleção toma como base períodos contábeis.',
        ENDPERIOD_FIELD_LABEL: 'Para',
        ENDPERIOD_FIELD_HELP: 'Selecione o intervalo de períodos a ser incluído na exportação de dados. A seleção toma como base períodos contábeis.',		ACCOUNTING_CONTEXT_FIELD_LABEL : 'Contexto contábil',		ACCOUNTING_CONTEXT_FIELD_HELP : 'Selecione de contexto contábil aplicável para o relatório.',
        ACCOUNTING_BOOK_FIELD_LABEL: 'Livro diário',
		ACCOUNTING_BOOK_FIELD_HELP: 'Selecione o contexto de livro diário aplicável para o relatório.',
        POSTING_DATE_LABEL: 'Use Transaction Date',
        POSTING_DATE_FIELD_HELP: 'Check this box to use the Transaction Date as the Ecriture Date in the FEC file.',
        YES: 'Sim',
        NO: 'Não',
        DELETED: 'Excluído',
        CANCELLED: 'Cancelado',
        REMOVED: 'Removido',
        GENERATED: 'Gerado',
        DOWNLOADED: 'Gerado',

        // Audit Files tab
        JOB_SUBLIST_SUBTAB: 'Arquivos de Auditoria',
        JOB_SUBLIST_CREATEDATE: 'Data de Criação',
        JOB_SUBLIST_CREATOR: 'Criado por',
        JOB_SUBLIST_REPORT: 'Relatório',
        JOB_SUBLIST_SUB: 'Subsidiária',
        JOB_SUBLIST_ISGROUPED: 'Agrupado',
        JOB_SUBLIST_PERIOD: 'período',
        JOB_SUBLIST_DOWNLOAD: 'Fazer download',
        JOB_SUBLIST_FAILED: 'Malsucedido',
        JOB_SUBLIST_DELETE: 'Excluir',
        JOB_SUBLIST_CANCEL: 'Cancelar',
        JOB_SUBLIST_REMOVE: 'Remover',
        JOB_SUBLIST_GROUPED: 'Agrupado',
        JOB_SUBLIST_ACCOUNTING_BOOK: 'Livro diário',        JOB_SUBLIST_ACCOUNTING_CONTEXT: 'Contexto contábil',

        // System Notes tab
        LOG_SUBLIST_SUBTAB: 'Notas do Sistema',
        LOG_SUBLIST_DATE: 'Data',
        LOG_SUBLIST_USER: 'Usuário',
        LOG_SUBLIST_ACTION: 'Ação',
        LOG_SUBLIST_FILENAME: 'Nome do arquivo',

        // Form messages
        MSG_DISCLAIMER: [
		    'Importante: ao usar o Pacote de Arquivos de Auditoria Fiscal do NetSuite, você assume responsabilidade',
			'total por determinar se os dados gerados e baixados são precisos ou suficientes para suas finalidades. ',
			'Você também assume total responsabilidade pela segurança dos dados que baixa do NetSuite e, posteriormente,',
			'armazena fora do sistema NetSuite.'
        ].join(' '),
        MSG_ALERT_QUEUED_TITLE: 'Confirmação ',
        MSG_ALERT_QUEUED: [
		    'Sua solicitação foi adicionada à fila. Uma mensagem de e-mail será enviada à sua conta após a geração',
			'do arquivo solicitado.'
        ].join(' '),
        MSG_ALERT_BUSY_TITLE: 'Não é possível gerar um arquivo de auditoria ',
        MSG_ALERT_BUSY: 'Outros arquivos de auditoria estão sendo gerados no momento. Tente novamente mais tarde. ',
        MSG_NO_DATA: 'Nenhum dado disponível ',
        MSG_CONFIRM_DELETE: 'Tem certeza? ',
        MSG_PERIOD_NOT_CHRONOLOGICAL: 'O período final não pode ser anterior ao período inicial. ',

		// Email notification
        EMAIL_SUCCESS_SUBJECT: 'Notificação de Sucesso na Exportação de Arquivo de Auditoria Fiscal do NetSuite',
        EMAIL_SUCCESS_BODY: [
		    'Saudações do NetSuite!\n\nObrigado por usar o Gerador de Arquivos de Auditoria Fiscal.  Aqui está o status da',
			'sua exportação de dados:\n\nData e hora da exportação: {dateCreated}\nIntervalo de datas da exportação de dados:',
			'{dateRange}\nRelatório: {reportName}\nNome do arquivo: {filename}\n\nO arquivo de auditoria foi gerado com sucesso.\n\nO',
			'arquivo pode ser baixado em:\n{reportUrl}\n\nVocê também pode encontrar a exportação de dados na página de relatório',
			'Arquivos de Auditoria Fiscal.\n\nAtenciosamente,\nEquipe NetSuite\n\n\n***NÃO RESPONDA A ESTA MENSAGEM***'
        ].join(' '),
        EMAIL_FAILED_SUBJECT: 'Notificação de Falha na Exportação de Arquivo de Auditoria Fiscal do NetSuite',
        EMAIL_FAILED_BODY: [
		    'Saudações do NetSuite!\n\nObrigado por usar o Gerador de Arquivos de Auditoria Fiscal. Aqui está o status da sua',
			'exportação de dados:\n\nData e hora da exportação: {dateCreated}\nIntervalo de datas da exportação de dados:',
			'{dateRange}\nRelatório: {reportName}\n\nA exportação do Arquivo de Auditoria foi malsucedida:\n{errorMessage}\n\n1. ',
			'Acesse a página de relatório Arquivos de Auditoria Fiscal e procure sua exportação de dados.\n2.  Verifique se',
			'os parâmetros da exportação de dados, como o intervalo de datas, estão corretos.\n3.  Se o erro persistir, contate',
			'o suporte por meio dos canais normais para obter mais informações sobre como resolver o problema.\n4.  Você também',
			'pode excluir a exportação de dados malsucedida para removê-la da lista.\n\nAtenciosamente,\nEquipe NetSuite\n\n\n***NÃO RESPONDA A ESTA MENSAGEM***'
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
        ERR_CURRENCY_CHECK: 'Uma ou mais das subsidiárias subordinadas tem moeda diferente da utilizada na subsidiária selecionada: {subsidiaries}. ',
        ERR_FR_SAFT_BLANK_GL_NO: 'Falha no download. Execute as Sequências de Numeração do RG. ',
        ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF: [
		    'Habilite o recurso Numeração de Auditoria do RG e execute as Sequências de Numeração do RG. Para habilitar a',
			'Numeração de Auditoria do RG, acesse Configurar > Empresa > Habilitar Recursos e marque a caixa Numeração na subguia Contabilidade.'
        ].join(' '),
        MX_DIOT_NO_CLEARED_TXNS: [
		    'Apenas transações compensadas são incluídas no relatório DIOT. O período selecionado não possui transações compensadas.',
			'Assegure-se de reconciliar as transações antes de gerar o relatório DIOT.'
        ].join(' '),

        // Statutory Chart of Accounts
        SCOA_FORM_TITLE: 'Plano de Contas Estatutário',
        SCOA_EDIT_BUTTON: 'Editar',
        SCOA_CANCEL_BUTTON: 'Cancelar',
        SCOA_SUBSIDIARY_FILTER: 'Subsidiária',
        SCOA_SUBSIDIARY_FILTER_HELP: 'Selecione a subsidiária para a qual deseja criar o plano de contas estatutário.',
        SCOA_ACCOUNT_TYPE_FILTER: 'tipo da conta',
        SCOA_ACCOUNT_TYPE_FILTER_HELP: 'Use este campo para filtrar as contas que aparecerão nesta página.',
        SCOA_ACCOUNT_TYPE_ALL: '- Todas -',
        SCOA_SUBLIST_NAME: 'Plano de Contas',
        SCOA_ACCOUNT_COLUMN: 'conta',
        SCOA_NUMBER_COLUMN: 'Número da Conta',
        SCOA_NAME_COLUMN: 'nome da conta',
        SCOA_CONFIRMATION: 'Confirmação',
        SCOA_ERROR: 'erro',
        SCOA_RELOAD_WARNING_MESSAGE: 'Os dados inseridos nesta página não foram salvos e serão perdidos. Pressione OK para continuar.',
        SCOA_SAVE_CONFIRMATION_MESSAGE: 'Plano de Contas Estatutário salvo com sucesso.',
        SCOA_SAVE_ERROR_MESSAGE: 'Algumas alterações não foram salvas. Atualize a página.',		SCOA_DEPRECATION_MESSAGE: [				'Notice: The Statutory Chart of Accounts feature in the Tax Audit Files SuiteApp will be deprecated in a future ',				'version of NetSuite. Details of when this change takes effect will be communicated to you, when a definite release ',				'date has been set. In preparation for this change, you must start using Accounting Contexts to define the ',
				'country-specific account names and numbers to include in the tax audit file. For more information, see '		].join(''),				SCOA_SETUP_ACCT_CONTEXT_LABEL: 'Setting Up Accounting Contexts',
		
		// TAF Mapper
        MAPPER_FORM_TITLE: 'Mapeamento de Campos dos Arquivos de Auditoria',
        MAPPER_EDIT_BUTTON: 'Editar',
        MAPPER_CANCEL_BUTTON: 'Cancelar',
        MAPPER_SUBLIST_NAME: 'mapeamento',
        MAPPER_CATEGORY_LABEL: 'categoria',
        MAPPER_TO_LABEL: 'Valor',
        MAPPER_SAVE_SUCCESSFUL: 'Salvo com sucesso.',
        MAPPER_SAVE_ERROR: 'Algumas alterações não foram salvas. Atualize a página.',
        MAPPER_SUCCESS: 'Confirmação',
        MAPPER_ERROR: 'erro',
        MAPPER_RELOAD_WARNING_MESSAGE: 'Os dados inseridos nesta página não foram salvos e serão perdidos. Pressione OK para continuar.',
        MAPPER_IMPORT_HELP_VIEWONLY_URL: 'DOC_section_4252635509',
        MAPPER_IMPORT_HELP_VIEWONLY_TXT: 'Click here for Field Mapping for Mexico help topic.',
        
        // UI Field Labels
        TAF_MAPPING_BANK: 'Bank',
        TAF_MAPPING_PAYMENT_METHOD: 'Payment Method',
        TAF_MAPPING_ACCOUNT_TYPE: 'Tipo da conta',
        TAF_MAPPING_ACCOUNT: 'Conta',
        TAF_MAPPING_SUBSIDIARY: 'Subsidiária',
        TAF_MAPPING_TRANSACTION_TYPE: 'Tipo da transação',
		TAF_MAPPING_POLICY_TYPE: 'Política',
		
		//France SAFT
		GENERAL_LEDGER: 'General Ledger',
        
        //Spain SII
        SII_RETROACTIVE_DESCRIPTION: 'Register from first half of year'
    }
};
