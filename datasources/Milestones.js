function Milestones(){
}

Milestones.prototype.handleInsert = function(db, record, callback){
	if(record === undefined || typeof(record.Name) !== "string" || record.Name.length < 1){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("IF EXISTS (SELECT Id FROM dbo.getUserProjects(?) WHERE Id = ?) "
			+ "INSERT INTO Milestones(ProjectId, Name, Description) VALUES(?, ?, ?)", [this.session.userId, this.args.ProjectId, this.args.ProjectId, record.Name, record.Description], function(res){
		callback({success:true});
	});
}

Milestones.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.Id === undefined || isNaN(oldRecord.Id)){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	db.query("IF EXISTS (SELECT Id FROM dbo.getUserProjects(?) WHERE Id = ?) "
			+ "UPDATE Milestones SET Name = ?, Description = ? WHERE Id = ? AND ProjectId = ?", [this.session.userId, this.args.ProjectId, newRecord.Name, newRecord.Description, oldRecord.Id, this.args.ProjectId], function(res){
		callback({success:true});
	});
}

Milestones.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("IF EXISTS (SELECT Id FROM dbo.getUserProjects(?) WHERE Id = ?) "
			+ "DELETE FROM Milestones WHERE Id = ? AND ProjectId = ?", [this.session.userId, this.args.ProjectId, record.Id, this.args.ProjectId], function(res){
		callback({success:true});
	});
}

Milestones.prototype.handleQuery = function(db, query, callback){
	if(!isNaN(query)){
		db.query("SELECT Milestones.* FROM Milestones INNER JOIN dbo.getUserProjects(?) AS UP ON Milestones.ProjectId = UP.Id WHERE ProjectId = ? AND Name = ? ORDER BY Title ASC", 
								[this.session.userId, this.args.ProjectId, query], function(res){
			callback(res);
		});
	} else {
		db.query("SELECT Milestones.* FROM Milestones INNER JOIN dbo.getUserProjects(?) AS UP ON Milestones.ProjectId = UP.Id WHERE ProjectId = ? ORDER BY Title ASC", 
								[this.session.userId, this.args.ProjectId], function(res){
			callback(res);
		});
	}
}
		
exports = module.exports = Milestones;