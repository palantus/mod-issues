function UserSavedQueries(){
}

UserSavedQueries.prototype.handleInsert = function(db, record, callback){
	if(record === undefined){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("INSERT INTO UserSavedQueries(ProjectId, UserId, Title, Query, Context) VALUES(?, ?, ?, ?, ?)", 
						[record.ProjectId === undefined ? null : record.ProjectId, this.session.userId, record.Title, record.Query, record.Context !== undefined ? record.Context : null], function(res){
		callback({success:true});
	});
}

UserSavedQueries.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.Id === undefined || isNaN(oldRecord.Id)){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	db.query("UPDATE UserSavedQueries SET ProjectId = ?, Title = ?, Query = ? WHERE Id = ? AND UserId = ?", [newRecord.ProjectId === undefined ? null : newRecord.ProjectId, newRecord.Title, newRecord.Query, oldRecord.Id, this.session.userId], function(res){
		callback({success:true});
	});
}

UserSavedQueries.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("DELETE FROM UserSavedQueries WHERE Id = ? AND UserId = ?", [record.Id, this.session.userId], function(res){
		callback({success:true});
	});
}

UserSavedQueries.prototype.handleCustom = function(db, customAction, callback){
}

UserSavedQueries.prototype.handleQuery = function(db, query, callback){
	db.query("SELECT Id, Title, Query, ProjectId, ProjectIndependent = CASE WHEN ProjectId IS NULL THEN 1 ELSE 0 END FROM UserSavedQueries WHERE UserId = ? AND (Context IS NULL OR Context = ?) AND (ProjectId IS NULL OR ProjectId = ?) ORDER BY Title", 
							[this.session.userId, query, this.args.ProjectId], function(res){
		callback(res);
	});
}
		
exports = module.exports = UserSavedQueries;