/**
 * Overrides
 * 
 * Version  Date            Author      Remarks
 * 1.00     01/30/2014      pmiller     Initial version
 *                                      Interim -- decreased drag tolerance to -1 so that the slightest mouse drag will activate the drag event
 *                                      Interim -- removed condition for triggering dragend
 * 2.00     02/27/2014      pmiller     Added override for Sch.util.ScrollManager.unregister, w/c causes an error in resizing
 * 3.00     03/21/2014      pbtan       Added override for store call to restlet timeout. increased it to 1 minute
 * 4.00     04/29/2014      pmiller     Added override for Sch.data.TimeAxis.getAdjustedDates to fix issue in chart column count
 * 5.00     05/20/2014      pbtan       Override the Apply/Cancel button labels for translation
 * 6.00     05/20/2014      pbtan       Override day names for calendar days.
 * 
/*
 * ExtJS Overrides here
 */
Ext4.override(Ext4.dd.DragTracker, {
    tolerance : -1
});
Ext4.override(Ext4.dd.DragTracker, {
    endDrag: function(e) {
        var me = this,
            wasActive = me.active;

        Ext4.getDoc().un({
            mousemove: me.onMouseMove,
            mouseup: me.onMouseUp,
            selectstart: me.stopSelect,
            scope: me
        });
        me.clearStart();
        me.active = false;
        //console.debug('=============');
        //console.debug('wasActive: ' + wasActive);
        //console.debug('me.active: ' + me.active);
        //if (wasActive) {
            me.onEnd(e);
            me.fireEvent('dragend', me, e);
        //}
        
        
        me._constrainRegion = Ext4.EventObject.dragTracked = null;
    }
});
Ext4.override(Ext4.data.JsonStore, {
    isLoaded : false,
    listeners : {
        load : function(store, records, success) {
            if (success) store.isLoaded = true;
        }
    }
});
Ext4.override(Ext4.view.Table, {    
    onRowSelect : function(rowIdx) {
        var me = this;

//        console.log('rowIdx = ' + rowIdx); 
//        console.log('me.selectedItemCls = ' + me.selectedItemCls);
//        console.log('me.getRowStyleTableEl(rowIdx) = ' + me.getRowStyleTableEl(rowIdx));
//        console.log('me.isRowStyleFirst(rowIdx) = ' + me.isRowStyleFirst(rowIdx));
//        console.log('me.tableSelectedFirstCls = ' + me.tableSelectedFirstCls);
//        console.log('me.beforeSelectedItemCls = ' + me.beforeSelectedItemCls);
        
        me.addRowCls(rowIdx, me.selectedItemCls);
        if (me.isRowStyleFirst(rowIdx)) {
            if (me.getRowStyleTableEl(rowIdx)) me.getRowStyleTableEl(rowIdx).addCls(me.tableSelectedFirstCls);
        } else {
            me.addRowCls(rowIdx - 1, me.beforeSelectedItemCls);
        }
    },
    onRowDeselect : function(rowIdx) {
        var me = this;

//        console.log('onRowDeselect : rowIdx = ' + rowIdx); 
//        console.log('onRowDeselect : me.selectedItemCls = ' + me.selectedItemCls);
//        console.log('onRowDeselect : me.focusedItemCls = ' + me.focusedItemCls);
//        console.log('onRowDeselect : me.getRowStyleTableEl(rowIdx) = ' + me.getRowStyleTableEl(rowIdx));
//        console.log('onRowDeselect : me.isRowStyleFirst(rowIdx) = ' + me.isRowStyleFirst(rowIdx));
//        console.log('onRowDeselect : me.beforeFocusedItemCls = ' + me.beforeFocusedItemCls);
//        console.log('onRowDeselect : me.beforeSelectedItemCls = ' + me.beforeSelectedItemCls);
        
        me.removeRowCls(rowIdx, [me.selectedItemCls, me.focusedItemCls]);
        if (me.isRowStyleFirst(rowIdx)) {
            if (me.getRowStyleTableEl(rowIdx)) me.getRowStyleTableEl(rowIdx).removeCls([me.tableFocusedFirstCls, me.tableSelectedFirstCls]);
        } else {
            me.removeRowCls(rowIdx - 1, [me.beforeFocusedItemCls, me.beforeSelectedItemCls]);
        }
    },
    onRowFocus: function(rowIdx, highlight, supressFocus) {
        var me = this;

//        console.log('onRowFocus : rowIdx = ' + rowIdx);
//        console.log('onRowFocus : highlight = ' + highlight); 
//        console.log('onRowFocus : supressFocus = ' + supressFocus); 
//        console.log('onRowFocus : me.selectedItemCls = ' + me.selectedItemCls);
//        console.log('onRowFocus : me.focusedItemCls = ' + me.focusedItemCls);
//        console.log('onRowFocus : me.getRowStyleTableEl(rowIdx) = ' + me.getRowStyleTableEl(rowIdx));
//        console.log('onRowFocus : me.isRowStyleFirst(rowIdx) = ' + me.isRowStyleFirst(rowIdx));
//        console.log('onRowFocus : me.tableFocusedFirstCls = ' + me.tableFocusedFirstCls);
//        console.log('onRowFocus : me.beforeFocusedItemCls = ' + me.beforeFocusedItemClss);
        
        if (highlight) {
            me.addRowCls(rowIdx, me.focusedItemCls);
            if (me.isRowStyleFirst(rowIdx)) {
                if (me.getRowStyleTableEl(rowIdx)) me.getRowStyleTableEl(rowIdx).addCls(me.tableFocusedFirstCls);
            } else {
                me.addRowCls(rowIdx - 1, me.beforeFocusedItemCls);
            }
            if (!supressFocus) {
                me.focusRow(rowIdx);
            }
            
        } else {
            me.removeRowCls(rowIdx, me.focusedItemCls);
            if (me.isRowStyleFirst(rowIdx)) {
                if (me.getRowStyleTableEl(rowIdx)) me.getRowStyleTableEl(rowIdx).removeCls(me.tableFocusedFirstCls);
            } else {
                me.removeRowCls(rowIdx - 1, me.beforeFocusedItemCls);
            }
        }

        if ((Ext.isIE6 || Ext.isIE7) && !me.ownerCt.rowLines) {
            me.repaintRow(rowIdx);
        }
    }
});
/*
 * Bryntum Overrides here
 */
Ext4.override(Sch.util.ScrollManager, {
    unregister : function (el) {
        this.clearScrollInterval();

        if(this.activeEl) this.activeEl.un('mousemove', this.onMouseMove, this);
        this.activeEl = this.scrollElRegion = null;
    }
});
Ext4.override(Sch.feature.DragCreator, {
    dragTolerance : -1
});
Ext4.override(Sch.plugin.ResourceZones, {
    renderZones : function(resource) {
        var store = this.store, scheduler = this.scheduler, viewStart = scheduler.timeAxis.getStart(), viewEnd = scheduler.timeAxis.getEnd(), data = [], spanStartDate, spanEndDate;
        store.each(function(record) {
            spanStartDate = record.getStartDate();
            spanEndDate = record.getEndDate();
            // Make sure resource exists in resourceStore (filtering etc)
            if (record.getResource() === resource && spanStartDate && spanEndDate &&
            // Make sure this zone is inside current view
            Sch.util.Date.intersectSpans(spanStartDate, spanEndDate, viewStart, viewEnd)) {
                var renderData = scheduler.getSchedulingView()[scheduler.getOrientation()].getEventRenderData(record);
                var start, width;
                if (scheduler.getOrientation() === 'horizontal') {
                    start = scheduler.rtl ? renderData.right : renderData.left;
                    width = renderData.width;
                } else {
                    start = renderData.top;
                    width = renderData.height;
                }
                data[data.length] = Ext4.apply({
                    id : record.internalId,
                    start : start,
                    width : width + 1,
                    Cls : record.getCls()
                }, record.data);
            }
        });
        return this.template.apply(data);
    }
});
/*
 * Override Sch.view.Horizontal.getScheduleRegion
 * Since we need to differentiate reassign & resize events, we will add an optional parameter: isResize
 * If isResize does not evaluate to false, then it means that the callee is triggered by a resize event
 */
Ext4.override(Sch.view.Horizontal, {
    getScheduleRegion : function (resourceRecord, eventRecord, isResize) {
        var getRegionFn     = Ext4.Element.prototype.getRegion ? 'getRegion' : 'getPageBox',
            view            = this.view,
            region          = resourceRecord ? Ext4.fly(view.getRowNode(resourceRecord))[getRegionFn]() : view.getTableRegion(),
            taStart         = view.timeAxis.getStart(),
            taEnd           = view.timeAxis.getEnd(),
            dateConstraints = view.getDateConstraints(resourceRecord, eventRecord, isResize) || { start: taStart, end: taEnd },
            startX          = this.translateToPageCoordinate(view.getXFromDate(dateConstraints.start)),
            endX            = this.translateToPageCoordinate(view.getXFromDate(dateConstraints.end)),
            top             = region.top + view.barMargin,
            bottom          = region.bottom - view.barMargin - view.eventBorderWidth;

        return new Ext4.util.Region(top, Math.max(startX, endX), bottom, Math.min(startX, endX));
    }
});
/*
 * Override Sch.view.SchedulerGridView.getScheduleRegion
 * Added optional parameter isResize to pass to Sch.view.Horizontal.getScheduleRegion
 */
Ext4.override(Sch.view.SchedulerGridView, {
    getScheduleRegion: function (resourceRecord, eventRecord, isResize) {
        return this[this.orientation].getScheduleRegion(resourceRecord, eventRecord, isResize);
    }
});
/*
 * Override Sch.feature.ResizeZone.createResizer
 * Passed isResize=true to specify that this process belongs to a resize event
 */
Ext4.override(Sch.feature.ResizeZone, {
    createResizer : function (el, eventRecord, handlePos) {
        var s                   = this.schedulerView,
            resourceRecord      = s.resolveResource(el),
            increment           = s.getSnapPixelAmount();
            constrainRegion     = s.getScheduleRegion(resourceRecord, eventRecord, true);
            dateConstraints     = s.getDateConstraints(resourceRecord, eventRecord, true);
            height              = el.getHeight,
            isStart             = (s.rtl && handlePos[0] === 'e') || (!s.rtl && handlePos[0] === 'w') || handlePos[0] === 'n',

            resizerCfg          = {
                target          : el,
                isStart         : isStart,
                dateConstraints : dateConstraints,
                resourceRecord  : resourceRecord,
                eventRecord     : eventRecord,
                handles         : handlePos[0],
                minHeight       : height,
                constrainTo     : constrainRegion,

                listeners       : {
                    resizedrag  : this.partialResize,
                    resize      : this.afterResize,
                    scope       : this
                }
            };

        // HACK, make it unique to prevent Ext JS from getting the wrong one if multiple events with same Id exist.
        // Remove this when scheduler has assignment store awareness
        var prevId          = el.id;
        var newId           = '_' + prevId;
            
        el.id               = el.dom.id = newId;
        
        // duplicate the cache entry for this element, so Ext4.get(newId) or Ext4.get(el) will reference the same entry 
        Ext4.cache[ newId ]  = Ext4.cache[ prevId ];
        // EOF HACK

        // Apply orientation specific configs
        if (s.getOrientation() === 'vertical') {
            if (increment > 0) {
                var w = el.getWidth();

                Ext4.apply(resizerCfg, {
                    minHeight       : increment,
                    // To avoid SHIFT causing a ratio preserve
                    minWidth        : w,
                    maxWidth        : w,
                    heightIncrement : increment
                });
            }
        } else {
            if (increment > 0) {

                Ext4.apply(resizerCfg, {
                    minWidth        : increment,
                    // To avoid SHIFT causing a ratio preserve
                    maxHeight       : height,
                    widthIncrement  : increment
                });
            }
        }

        var resizer = Ext4.create('Ext4.resizer.Resizer', resizerCfg);

        if (resizer.resizeTracker && Ext4.isWebKit) {
            // Ignore resizing action if dragging outside the scheduler
            // Fixes WebKit issue https://www.assembla.com/spaces/bryntum/tickets/994#/activity/ticket:
            var old = resizer.resizeTracker.updateDimensions;

            resizer.resizeTracker.updateDimensions = function(e) {
                if (e.getTarget('.sch-timelineview')) {
                    old.apply(this, arguments);
                }
            };
        }
        // Make sure the resizing event is on top of other events
        el.setStyle('z-index', parseInt(el.getStyle('z-index'), 10)+1);
        return resizer;
    }
});

Ext4.override(Ext4.data.proxy.Ajax, { timeout: 60000 }); // default is 30seconds

/*
 * Override Sch.data.TimeAxis.getAdjustedDates
 * Initial value of end will now be based on the updated start value.
 * Default implementation adjusts both start and end simultaneously, causing an erroneous increment to end (by 1 tick).
 */
Ext4.override(Sch.data.TimeAxis, {
    getAdjustedDates : function(start, end) {
        start = start || this.getStart();
        if (this.autoAdjust) {
            start = this.floorDate(start, false);
        }
        end = end || Sch.util.Date.add(start, this.mainUnit, this.defaultSpan);
        if (this.autoAdjust) {
            end = this.ceilDate(end, false)
        }
        return {
            start : start,
            end : end
        };
    }
});

Ext4.override(Ext4.date.RangePicker.strings, { 
    strApply : translatedStrings.getText('BUTTON.APPLY'),
    strCancel : translatedStrings.getText('BUTTON.CANCEL')
}); 

Ext4.onReady(function() {
    Ext4.apply(Ext4.picker.Date.prototype, {
        dayNames        : Ext4.Date.dayNames
    });
});