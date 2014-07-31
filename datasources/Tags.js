function Tags(){
}

Tags.prototype.handleInsert = function(db, record, callback){
	if(record === undefined || record.Tag === undefined || typeof(record.Tag) !== "string" || record.Tag.length < 1 || isNaN(record.HideInGrids)){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("INSERT INTO Tags(Tag, HideInGrids, ProjectId) SELECT ?, ?, ? WHERE NOT EXISTS(SELECT Tag FROM Tags WHERE Tag = ? AND ProjectId = ?)", 
			[record.Tag, record.HideInGrids, this.args.ProjectId, record.Tag, this.args.ProjectId], function(res){
		callback({success:true});
	});
}

Tags.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.TagId === undefined || isNaN(oldRecord.TagId) || isNaN(newRecord.HideInGrids)){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	db.query("UPDATE Tags SET HideInGrids = ? WHERE TagId = ? AND ProjectId = ?", [newRecord.HideInGrids, oldRecord.TagId, this.args.ProjectId], function(res){
		callback({success:true});
	});
}

Tags.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("IF EXISTS (SELECT Id FROM dbo.getUserProjects(?) WHERE Id = ?) "
			+ "DELETE FROM Tags WHERE TagId = ? AND ProjectId = ?", [this.session.userId, this.args.ProjectId, record.TagId, this.args.ProjectId], function(res){
		callback({success:true});
	});
}

Tags.prototype.handleQuery = function(db, query, callback){
	if(typeof(query) === "string" && query.length > 0){
		db.query("SELECT * FROM getProjectTags(?, ?, ?) ORDER BY Tag ASC", [this.args.ProjectId, this.session.userId, query], function(res){
			callback(res);
		});
	} else {
		db.query("SELECT * FROM getProjectTags(?, ?, NULL) ORDER BY Tag ASC", [this.args.ProjectId, this.session.userId], function(res){
			callback(res);
		});
	}
}
		
exports = module.exports = Tags;