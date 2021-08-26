/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * Use these component to group/separate toolbar items.
 */
Ext4.define('PRM.Cmp.Separator', {
    extend : 'Ext4.Component',
    alias : 'widget.prm-separator',
    renderTpl : new Ext4.XTemplate('<div class="prm-separator"></div>')
});

Ext4.define('PRM.Cmp.Separator.Small', {
    extend : 'Ext4.Component',
    alias : 'widget.prm-separator-small',
    renderTpl : new Ext4.XTemplate('<div class="prm-separator prm-separator-small"></div>')
});

Ext4.define('PRM.Cmp.Toolbar.Form', {
    extend : 'Ext4.toolbar.Toolbar',
    alias : 'widget.prm-form-toolbar',
    dock : 'top',
    ui : 'footer',
    padding : '0 0 10 0',
    defaults : {
        margin : '0 15 0 0'
    }
});

Ext4.define('PRM.Cmp.Space', {
    extend : 'Ext4.Component',
    alias : 'widget.prm-space',
    height : 15,
    autoEl : 'div'
});
Ext4.define('PRM.Cmp.HSpace', {
    extend : 'Ext4.Component',
    alias : 'prm-hspace',
    width : 15,
    autoEl : 'div'
});

Ext4.define('PRM.Cmp.FormSpacer', {
    extend : 'Ext4.Component',
    height : 22,
    autoEl : 'div'
});

Ext4.define('PRM.Cmp.ToolTip', {
    extend : 'Ext4.tip.ToolTip',
    target : Ext4.getBody(),
    showDelay : 0,
    autoHide : true,
    hideDelay : 0,
    trackMouse : true,
    dismissDelay : 0,
    listeners : {
        beforeshow : function updateTipBody(tip) {
            tip.update('<div class="prm-tooltip">' + tip.text + '</div>');
        }
    }
});

Ext4.define('PRM.Cmp.SearchProject', {
    extend : 'Ext.form.field.Trigger',
    alias : 'widget.searchProjectTrigger',
    cls : 'prm-project-search',
    width : 350,
    triggerCls : 'prm-project-search-trigger',
    triggerWrapCls : 'prm-project-search-trigger',
    onTriggerClick : function() {
        PRM.Util.PerfLogs.start('GRID_LOAD');
        
        var searchString = Ext4.String.trim(this.getValue());
        if ((searchString.length < 3) && (searchString.length > 0)) {
            alert(PRM.Translation.getText('ALERT.MIN_CHAR_SEARCH'));
            return false;
        }
        PRM.App.Settings.projectSearch = searchString;
        PRM.App.Stores.pageList.loadWithFilters();
    },
    listeners : {
    	specialkey : function(field, e) {
            if (e.getKey() == e.ENTER) {
                field.triggerEl.elements[0].dom.click();
            }
        }
    }
});

Ext4.define('PRM.Cmp.FormMenu', {
    extend : 'Ext4.toolbar.Toolbar',
    alias : 'widget.prm-form-menu',
    dock : 'top',
    ui : 'footer',
    padding : '0 0 10 0',
    defaults : {
        margin : '0 15 0 0'
    }
});