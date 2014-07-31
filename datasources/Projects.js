function Projects(){
}

Projects.prototype.handleInsert = function(db, record, callback){
	if(record === undefined || record.Title === undefined || typeof(record.Title) !== "string" || record.Title.length < 1){
		callback({error: "Ingen record at indsætte"});
		return;
	}
	
	db.query("INSERT INTO Projects(Title, Owner) VALUES(?, ?)", [record.Title, this.session.userId], function(res){
		callback({success:true});
	});
}

Projects.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.Id === undefined || isNaN(oldRecord.Id)){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	db.query("UPDATE Projects SET Title = ? WHERE Id = ?", [newRecord.Title, oldRecord.Id], function(res){
		callback({success:true});
	});
}

Projects.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("DELETE FROM Projects WHERE Id = ? AND Owner = ?", [record.Id, this.session.userId], function(res){
		callback({success:true});
	});
}

Projects.prototype.handleCustom = function(db, custom, callback){
	
	if(typeof(custom) === "object"){
		switch(custom.action){
			case "GetUsers" :
				if(!isNaN(custom.ProjectId)){
					db.query("SELECT FirstName, LastName, Username, IsOwner = 0 FROM ProjectMembers INNER JOIN Users ON ProjectMembers.UserId = Users.Id INNER JOIN dbo.getUserProjects(?) AS UP ON ProjectMembers.ProjectId = UP.Id WHERE ProjectMembers.ProjectId = ?\
								UNION \
								SELECT FirstName = FirstName, LastName, Username, IsOwner = 1 FROM Users INNER JOIN Projects ON Users.Id = Projects.Owner INNER JOIN dbo.getUserProjects(?) AS UP ON Projects.Id = UP.Id WHERE Projects.id = ?", 
							[this.session.userId, custom.ProjectId, this.session.userId, custom.ProjectId], function(res){
						callback(res);
					});
				} else {
					callback({error: "Unknown project"});
				}
				break;
			
		}
	}
}

Projects.prototype.handleQuery = function(db, query, callback){
	if(!isNaN(query)){
		db.query("SELECT * FROM getUserProjects(?) WHERE Id = ? ORDER BY Title ASC", [this.session.userId, query], function(res){
			callback(res);
		});
	} else {
		db.query("SELECT * FROM getUserProjects(?) ORDER BY Title ASC", [this.session.userId], function(res){
			callback(res);
		});
	}
}
		
exports = module.exports = Projects;