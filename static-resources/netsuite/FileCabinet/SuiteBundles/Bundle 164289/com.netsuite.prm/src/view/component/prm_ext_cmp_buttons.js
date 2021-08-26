/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * Use this component for all text type buttons.
 */
Ext4.define('PRM.Cmp.Button.Link', {
    extend : 'Ext4.Component',
    alias : 'widget.prm-button-link',
    renderTpl : new Ext4.XTemplate('<a id="{id}-a" href="#" role="link" class="prm-button-link-a">', '<span id="{id}-span" class="prm-button-link-span">', '{text}', '</span>', '</a>'),
    renderSelectors : {
        linkEl : 'a'
    },
    initComponent : function() {
        this.callParent(arguments);
        this.renderData = {
            text : this.text
        };
    },
    listeners : {
        render : function(c) {
            c.el.on('click', c.handler);
        }
    },
    handler : function() {
        console.log('You forgot to define your custom handler function...');
    }
});

/*
 * Do not instantiate this class. This is only intended for extension (therefore the lack of an alias).
 * When extending, override toggleGroup with the array of ID's belonging to every instance of your new class.
 */
Ext4.define('PRM.Cmp.Button.Link.Toggle', {
    extend : 'PRM.Cmp.Button.Link',
    pressedCls : 'prm-btn-link-toggle-pressed',
    initComponent : function() {
        this.callParent(arguments);
        this.renderData = {
            text : this.text
        };
        if(this.pressed) this.addCls(this.pressedCls);
    },
    listeners : {
        render : function(c) {
            c.el.on('click', function() {
                c.toggle(c);
                c.handler();
            });
        }
    },
    toggle : function(c) {
        c.switchOn();
        for(var i = 0; i < this.toggleGroup.length; i++) {
            if(this.toggleGroup[i] != this.id) Ext4.getCmp(this.toggleGroup[i]).switchOff();
        }
    },
    toggleGroup : [],
    switchOn : function() {
        this.addCls(this.pressedCls);
    },
    switchOff : function() {
        this.removeCls(this.pressedCls);
    }
});

Ext4.define('PRM.Cmp.ToggleFilter', {
    extend : 'PRM.Cmp.Button.Link.Toggle',
    alias : 'widget.prm-button-toggle-filter',
    text : 'Filters'.toUpperCase(), // translatedStrings.getText('HEADER.FILTERS')
    margin : '0 50 0 0',
    renderTpl : new Ext4.XTemplate('<tpl>', '<a id="{id}-linkEl" href="#" role="link" class="filter-toggle-link">', '{text}', '</a>', '</tpl>'),
    initComponent : function() {
        this.callParent(arguments);
        this.renderData = {
            text : this.text
        };
    },
    handler : function(e) {
        var filterBody = Ext4.getCmp('prm-pnl-filter-body');
        if (filterBody.isHidden()) {
            Ext4.getCmp(this.id).removeCls('prm-filter-hidden');
            filterBody.show();
        } else {
            Ext4.getCmp(this.id).addCls('prm-filter-hidden');
            filterBody.hide();
        }
        PRM.App.Grid.autofit();
    }
});

/*
 * Preset class extended from PRM.Cmp.Button.Link.Toggle
 */
Ext4.define('PRM.Cmp.Button.Preset', {
    extend : 'PRM.Cmp.Button.Link.Toggle',
    alias : 'widget.prm-button-preset',
    toggleGroup : ['prm-btn-daily', 'prm-btn-weekly', 'prm-btn-monthly'],
    handler : function() {
        PRM.Util.PerfLogs.start('PRESET');
        switch (this.id) {
            case 'prm-btn-daily':
                PRM.App.Grid.updatePreset('Daily');
                break;
            case 'prm-btn-weekly':
                PRM.App.Grid.updatePreset('Weekly');
                break;
            case 'prm-btn-monthly':
                PRM.App.Grid.updatePreset('Monthly');
                break;
        }
    }
});

/*
 * Use this component for all icon type buttons.
 * Modify background-size in CSS (e.g. prm-icon-settings) to adjust image size and fit button dimensions.
 */
Ext4.define('PRM.Cmp.Button.Icon', {
    extend : 'Ext4.button.Button',
    alias : 'widget.prm-button-icon',
    cls : 'prm-button-icon prm-unselectable',
    scale : 'medium',
    width : 16,
    height : 24
});

/*
 * Use this component for all arrow type button pairs.
 * Indicate direction (left/right) in instantiation config.
 */
Ext4.define('PRM.Cmp.Button.Arrow', {
    extend : 'Ext4.button.Button',
    alias : 'widget.prm-button-arrow',
    cls : 'prm-button-arrow prm-unselectable',
    initComponent : function(args) {
        if(this.direction == 'left') this.iconCls = 'prm-icon-pan-left';
        else if(this.direction == 'right') this.iconCls = 'prm-icon-pan-right';
        this.callParent(arguments);
    }
});

/*
 * Panning Buttons
 */
Ext4.define('PRM.Cmp.Button.Panning', {
    extend : 'PRM.Cmp.Button.Arrow',
    alias : 'widget.prm-button-panning',
    handler : function() {
        PRM.Util.PerfLogs.start('PAN');
        PRM.App.Grid.pan(this.direction);
        PRM.Util.PerfLogs.stop('PAN');
    }
});

/*
 * Paging Buttons
 */
Ext4.define('PRM.Cmp.Button.Paging', {
    extend : 'PRM.Cmp.Button.Arrow',
    alias : 'widget.prm-button-paging',
    handler : function() {
        PRM.App.Grid.shiftPage(this.direction);
    }
});

/*
 * etc
 */

Ext4.define('PRM.Cmp.RectButton', {
    extend : 'Ext4.button.Button',
    cls : 'prm-rect-btn'
});

Ext4.define('PRM.Cmp.GrayButton', {
    extend : 'PRM.Cmp.RectButton',
    alias : 'widget.prm-btn-gray',
    cls : 'prm-rect-btn prm-rect-btn-gray'
});

Ext4.define('PRM.Cmp.BlueButton', {
    extend : 'PRM.Cmp.RectButton',
    alias : 'widget.prm-btn-blue',
    cls : 'prm-rect-btn prm-rect-btn-blue'
});

Ext4.define('PRM.Cmp.MoreButton', {
    extend: 'Ext4.button.Button',
    alias : 'widget.prm-more-button',
    iconCls: 'prm-large-data-icon',
    cls: 'prm-large-data-btn',
});

Ext4.define('PRM.Cmp.LargeDataSearchButton', {
	alias : 'widget.prm-resource-search-btn',
    extend: 'Ext4.button.Button',
    iconCls: 'prm-search-icon',
    cls: 'prm-search-btn',
    tooltip: PRM.Translation.getText('TOOLTIP.RESOURCE_SEARCH'),
    margin: '20 0 0 5',
    flex: 1,
    isMax: null,
    windowType: null
});