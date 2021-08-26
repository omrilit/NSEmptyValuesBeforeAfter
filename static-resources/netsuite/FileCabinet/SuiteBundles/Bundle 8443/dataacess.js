var ns;
if( !ns)
	ns = {};
ns.DataAccess = {};




//==============================================================================
ns.DataAccess.DataRow = function DataRow( row)
{
	var columns = row.getAllColumns();
	for( var i in columns)
	{
		var name = columns[i].getName();
		var join = columns[i].getJoin();
		var summary = columns[i].getSummary();
		
		var propertyName = (join != null && join.length > 0)? (join + "_" + name) : name;
							
		this[propertyName] = row.getValue( name, join, summary);
		
		var text = row.getText( name, join, summary);
		if( text)
			this[propertyName + "TEXT"] = text;
	}
	
	var m_Id = row.getId();
	this.GetId = function GetId() { return m_Id };
}
//==============================================================================