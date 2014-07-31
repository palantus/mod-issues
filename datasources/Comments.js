function Comments(){
}

Comments.prototype.handleInsert = function(db, record, callback){
	if(record === undefined){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("IF EXISTS (SELECT Id FROM dbo.getUserProjects(?) WHERE Id = ?) "
			+ "INSERT INTO Comments(ProjectId, ContentType, RefId, Comment, UserId) VALUES(?, ?, ?, ?, ?)", 
					[this.session.userId, this.args.ProjectId, this.args.ProjectId, record.ContentType, record.RefId, record.Comment, this.session.userId], function(res){
		callback({success:true});
	});
}

Comments.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("DELETE FROM Comments WHERE Id = ? AND UserId = ?", [record.Id, this.session.userId], function(res){
		callback({success:true});
	});
}

Comments.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.Id === undefined || isNaN(oldRecord.Id)){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	db.query("UPDATE Comments SET Comment = ? WHERE Id = ? AND UserId = ?", [newRecord.Comment, oldRecord.Id, this.session.userId], function(res){
		callback({success:true});
	});
}

Comments.prototype.handleCustom = function(db, customAction, callback){
}

Comments.prototype.handleQuery = function(db, query, callback){
	if(typeof(query) === "object" && query.ContentType !== undefined && query.RefId !== undefined){
		db.query("SELECT *, CONVERT(VARCHAR, PostedDateTime, 106) AS Timestamp FROM Comments INNER JOIN dbo.getUserProjects(?) AS UP ON Comments.ProjectId = UP.Id WHERE ContentType = ? AND RefId = ? ORDER BY PostedDateTime DESC", 
						[this.session.userId, query.ContentType, query.RefId], function(res){
			callback(res);
		});
	} else {
		callback({error: "Invalid query"});
	}
}
		
exports = module.exports = Comments;