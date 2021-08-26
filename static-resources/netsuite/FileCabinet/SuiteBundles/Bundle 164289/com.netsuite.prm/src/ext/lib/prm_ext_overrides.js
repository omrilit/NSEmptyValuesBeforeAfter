/*
 * quick fix to a known EXTjs bug (reference https://www.sencha.com/forum/showthread.php?269116)
 */
Ext4.override(Ext4.view.Table, {
    getRowStyleTableEl: function(item) {
        var me = this;
        if (!item.tagName) {
            item = this.getNode(item);
        }
        return (me.isGrouping ? Ext4.fly(item) : this.el).down('table.' + Ext4.baseCSSPrefix + 'grid-table');
    }
});

/*
 * Override timeout to 2 minutes instead of the default 30 seconds
 */
Ext4.override(Ext4.data.proxy.Ajax, {
    timeout: 120000
});

/*
 * Fix issue when expanding project nodes would sometimes cause the grid to not finish rendering whenever the page or view is changed
 */
Ext4.override(Ext4.selection.CellModel, {
    onViewRefresh : function(view) {
        var me = this, pos = me.getCurrentPosition(), headerCt = view.headerCt, record, columnHeader;
        if (pos && pos.view === view) {
            record = pos.record;
            columnHeader = pos.columnHeader;
            if (!columnHeader.isDescendantOf(headerCt)) {
                columnHeader = headerCt.queryById(columnHeader.id) || headerCt.down('[text="' + columnHeader.text + '"]') || headerCt.down('[dataIndex="' + columnHeader.dataIndex + '"]');
            }
            /*
             * add checking if record is null before proceeding with this code block
             */
            if (columnHeader && record && (view.store.indexOfId(record.getId()) !== -1)) {
                me.setCurrentPosition({
                    row : record,
                    column : columnHeader,
                    view : view
                });
            }
        }
    }
});

Ext4.override(Ext4.layout.container.Editor, {
    calculate : function(ownerContext) {
        var me = this, owner = me.owner, autoSize = owner.autoSize, fieldWidth, fieldHeight;
        if (autoSize === true) {
            autoSize = me.autoSizeDefault;
        }
        if (autoSize) {
            fieldWidth = me.getDimension(owner, autoSize.width, 'getWidth', owner.width);
            fieldHeight = me.getDimension(owner, autoSize.height, 'getHeight', owner.height);
        }
        if (ownerContext.childItems[0]) {
            ownerContext.childItems[0].setSize(fieldWidth, fieldHeight);
        }
        ownerContext.setWidth(fieldWidth);
        ownerContext.setHeight(fieldHeight);
        ownerContext.setContentSize(fieldWidth || owner.field.getWidth(), fieldHeight || owner.field.getHeight());
    }
});

Ext4.override(Ext4.grid.plugin.CellEditing, {
    showEditor: function(ed, context, value) {
        var me = this,
            record = context.record,
            columnHeader = context.column,
            sm = me.grid.getSelectionModel(),
            selection = sm.getCurrentPosition(),
            otherView = selection && selection.view;

        me.setEditingContext(context);
        me.setActiveEditor(ed);
        me.setActiveRecord(record);
        me.setActiveColumn(columnHeader);
        
        if (sm.selectByPosition && (!selection || selection.column !== context.colIdx || selection.row !== context.rowIdx)) {
            sm.selectByPosition({
                row: context.rowIdx,
                column: context.colIdx,
                view: me.view
            });
        }

        ed.startEdit(me.getCell(record, columnHeader), value, context);
        me.editing = true;
        me.scroll = me.view.el.getScroll();
    }
});