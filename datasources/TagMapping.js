function TagMapping(){
}

TagMapping.prototype.handleInsert = function(db, record, callback){
	if(record === undefined){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("EXEC dbo.TagsAssign ?, ?, ?, ?, ?", [this.args.ProjectId, this.session.userId, record.Type, record.RefId, record.Tag], function(res){
		callback({success:true});
	});
}

TagMapping.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Tag === undefined || isNaN(record.Type) || record.RefId === undefined){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("EXEC dbo.TagsUnassign ?, ?, ?, ?", [this.args.ProjectId, record.Type, record.RefId, record.Tag], function(res){
		callback({success:true});
	});
}

TagMapping.prototype.handleCustom = function(db, customAction, callback){
}

TagMapping.prototype.handleQuery = function(db, query, callback){

}
		
exports = module.exports = TagMapping;