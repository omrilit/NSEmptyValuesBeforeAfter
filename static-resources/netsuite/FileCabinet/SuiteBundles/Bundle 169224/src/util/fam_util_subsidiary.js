define([
    '../adapter/fam_adapter_record', 
    '../adapter/fam_adapter_search'],
function(record, search) {
    var Subsidiary = {};
    
    /**
     * Guaranteed on CDL only. Use on other standard NS recs at your own risk
     */
    Subsidiary.isValidRecSubCombo = function (recName, recId, subId) {
        var filters = [['isinactive', search.getOperator('IS'), 'F'], 'and',
                       ['subsidiary', search.getOperator('ANYOF'), [subId]], 'and',
                       ['internalid', search.getOperator('ANYOF'), [recId]]];
        
        var columnObj = { name: 'internalid',
                          summary: search.getSummary('COUNT') };
        var columns = [search.createColumn(columnObj)]

        var searchObj = search.create({
            type: recName,
            filters: filters,
            columns: columns
        });
        
        var searchRes = searchObj.run().getRange({ start : 0, end : 1 });
        var recCount = searchRes[0].getValue(columnObj);
        
        return (recCount > 0);
    };
    
    /**
     * @deprecated
     * this will only be called for tax methods
     */
    Subsidiary.compareCDLSubsidiary = function (cdlName, cdlId, subsidiary) {
        var cdlRec, arrParent, includeChildren, cdlSubsidiary;

        subsidiary += '';

        if (subsidiary === '') {
            return true;
        }

        // TODO: for editing
        cdlRec = record.load({ type: cdlName, id: cdlId });
        cdlSubsidiary = cdlRec.getFieldValues('subsidiary') === null ?
            cdlRec.getFieldValue('subsidiary') : cdlRec.getFieldValues('subsidiary');
        arrParent = [].concat(cdlSubsidiary);
        includeChildren = cdlRec.getFieldValue('includechildren') === 'T';

        if (arrParent.indexOf(subsidiary) === -1 && (!includeChildren || (includeChildren &&
            !this.isSubChildOf(arrParent, subsidiary)))) {

            return false;
        }

        return true;
    };
    
    Subsidiary.isSubChildOf = function (arrParent, child) {
        var i, arrChildren;

        for (i = 0; i < arrParent.length; i++) {
            arrChildren = [];
            this.getSubsidiaryChildren(arrParent[i], arrChildren);

            if (arrChildren.indexOf(child) !== -1) {
                return true;
            }
        }

        return false;
    };
    
    Subsidiary.getSubsidiaryHierarchy = function() {
        var id, name, arrNames, parentName, parentId, res, nameIds = {}, children = { 0 : [] };

        var searchObj = search.create({
            type: 'subsidiary',
            filters: [search.createFilter({ name: 'isinactive', operator: 'is', types: 'F'})],
            columns: [search.createColumn({ name: 'name', sort: search.getSort().ASC })] 
        });
            
        searchObj.run().each(function(res) {
            id = res.id;
            name = res.getValue('name');

            nameIds[name] = id;
            arrNames = name.split(' : ');

            if (arrNames.length > 1) {
                arrNames.splice(arrNames.length - 1, 1);
                parentName = arrNames.join(' : ');
                parentId = nameIds[parentName];

                if (typeof children[parentId] === 'undefined') {
                    children[parentId] = [];
                }

                children[parentId].push(id);
            }
            else {
                children[0].push(id);
            }
            return true;
        });

        return { children : children };
    };
    
    Subsidiary.getSubsidiaryChildren = function(subsidiaryId, arrChildren) {
        if (!this.subsidiaryHierarchy) {
            this.subsidiaryHierarchy = this.getSubsidiaryHierarchy();
        }
        var arrHierarchy = this.subsidiaryHierarchy.children[subsidiaryId];
        if (arrHierarchy) {
            for (var i=0; i<arrHierarchy.length; i++) {
                var childId = arrHierarchy[i];
                if (this.subsidiaryHierarchy.children[childId]) {
                    this.getSubsidiaryChildren(childId, arrChildren);
                }
                arrChildren.push(childId);
            }
        }
    };

    /**
     * @returns
     *  { <bookId> : [<subId>...] }
     */
    Subsidiary.getSubsByBook = function() { 
        var filters = [['isprimary', search.getOperator('IS'), 'F'], 'and',
                       ['status', search.getOperator('IS'), 'ACTIVE']],
            columns = [search.createColumn({ name: 'subsidiary', sort: search.getSort('ASC') })];
        
        var searchObj = search.create({
            type: 'accountingbook',
            filters: filters,
            columns: columns
        });
        
        var subsByBookMap = {};
        pagedData = searchObj.runPaged({ pageSize : 1000 });
        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index : pageRange.index });
            page.data.forEach(function(searchRes) {
                if (subsByBookMap[searchRes.id]) {
                    subsByBookMap[searchRes.id].push(searchRes.getValue({name:'subsidiary'}));
                }
                else {
                    subsByBookMap[searchRes.id] = [searchRes.getValue({name:'subsidiary'})];
                }
            });
        });
        
        return subsByBookMap;
    }
    
    return Subsidiary;
});