function AssignmentTable(){
}

AssignmentTable.prototype.handleInsert = function(db, record, callback){
	if(record === undefined || isNaN(record.Type)){
		callback({error: "Ingen record at indsætte"});
		return;
	}

	if(isNaN(this.args.ProjectId)){
		callback({error: "No active project"});
		return;
	}
	
	db.query("EXEC dbo.IssueCreate @ownerId = ?, @projectId = ?, @type = ?, @title = ?, @priority = ?, @status = ?, @milestoneId = ?, @description = ?", 
				[this.session.userId, !isNaN(record.ProjectId) ? record.ProjectId : this.args.ProjectId, record.Type, record.Title, record.Priority, record.Status, (!isNaN(record.MilestoneId) && record.MilestoneId > 0) ? record.MilestoneId : null, record.Description], function(res){
		if(res !== undefined && res.error === undefined)
			callback({success:true, AssignmentNum: res[0].AssignmentNum});
		else
			callback({success:false});
	});
}

AssignmentTable.prototype.handleUpdate = function(db, oldRecord, newRecord, callback){
	if(oldRecord === undefined || newRecord === undefined || oldRecord.AssignmentNum === undefined){
		callback({error: "Ingen record at opdatere"});
		return;
	}
	
	// Dette burde fungere, men enum felterne (specielt status30 m.fl.) får i min query en strengværdi ("til test"), mens denne forventer et tal!
	/*
	db.query("UPDATE AssignmentTable SET Title = ?, Description = ?, Priority = ?, Status30 = ?, Status40 = ?, Status50 = ?, Status60 = ?,  Hotfix = ?, Status = ? \
				WHERE AssignmentNum = ? AND (Personal = 0 OR Owner = dbo.getUserId())"
				, [newRecord.Title, newRecord.Description, newRecord.Priority, newRecord.Status30, newRecord.Status40, newRecord.Status50
				, newRecord.Status60, newRecord.Hotfix, newRecord.Status, oldRecord.AssignmentNum], function(res){
		callback({success:true});
	});
	*/
}
/*
AssignmentTable.prototype.handleDelete = function(db, record, callback){
	if(record === undefined || record.Id === undefined || isNaN(record.Id)){
		callback({error: "Ingen record at slette"});
		return;
	}
	
	db.query("DELETE FROM AssignmentTable WHERE Id = ? AND Owner = dbo.getUserId()", [record.Id], function(res){
		callback({success:true});
	});
}
*/

AssignmentTable.prototype.handleCustom = function(db, custom, callback){
	
	if(typeof(custom) === "string"){
		switch(custom){
			case "GetAssignmentTypes" :
				db.query("SELECT Id, Title AS Label FROM IssueTypes ORDER BY Title", function(res){callback(res);});
				break;
			case "GetAssignmentStatusValues" :
				db.query("SELECT Id, Title AS Label FROM AssignmentStatusValues ORDER BY Id ASC", function(res){callback(res);});
				break;
			case "GetMilestones" :
				db.query("SELECT Id, Name AS Label FROM Milestones WHERE ProjectId = ? ORDER BY Name", [this.args.ProjectId], function(res){callback(res);});
				break;
		}
	} 
	else if(typeof(custom) === "object"){
		switch(custom.action){
			case "SetDefault" :
				if(typeof(custom.AssignmentNum) === "string"){
					db.query("EXEC dbo.AssignmentSetDefault ?, ?", [custom.AssignmentNum, this.session.userId], function(res){
						callback({success:true});
					});
				}
				break;
/*			case "Approve" :
				if(typeof(custom.AssignmentNum) === "string" && !isNaN(custom.Version)){
					db.query("EXEC dbo.AssignmentApprove @num = ?, @version = ?", [custom.AssignmentNum, custom.Version], function(res){
						callback({success:true, AssignmentNum: custom.AssignmentNum, Version: custom.Version});
					});
				}
				break;
			case "DisApprove" :
				if(typeof(custom.AssignmentNum) === "string" && !isNaN(custom.Version)){
					db.query("EXEC dbo.AssignmentDisapprove @num = ?, @version = ?", [custom.AssignmentNum, custom.Version], function(res){
						callback({success:true, AssignmentNum: custom.AssignmentNum, Version: custom.Version});
					});
				}
				break;
			case "Reject" :
				if(typeof(custom.AssignmentNum) === "string" && !isNaN(custom.Version)){
					db.query("EXEC dbo.AssignmentReject @num = ?, @version = ?", [custom.AssignmentNum, custom.Version], function(res){
						callback({success:true, AssignmentNum: custom.AssignmentNum, Version: custom.Version});
					});
				}
				break;
			case "ChangeTitle" :
				if(typeof(custom.AssignmentNum) === "string" && typeof(custom.Title) === "string")
					db.query("UPDATE AssignmentTable SET Title = ? WHERE AssignmentNum = ?", [custom.Title, custom.AssignmentNum], function(res){callback({success:true});});
				break;
			case "ChangeStatus" :
				if(typeof(custom.AssignmentNum) === "string" && !isNaN(custom.Status))
					db.query("UPDATE AssignmentTable SET Status = ? WHERE AssignmentNum = ? AND EXISTS(SELECT EnumValue FROM AssignmentStatusValues WHERE EnumValue = ?)", [custom.Status, custom.AssignmentNum, custom.Status], function(res){callback({success:true});});
				break;
			case "ChangeHotfix" :
				if(typeof(custom.AssignmentNum) === "string" && typeof(custom.Hotfix) === "string")
					db.query("UPDATE AssignmentTable SET Hotfix = ? WHERE AssignmentNum = ?", [custom.Hotfix, custom.AssignmentNum], function(res){callback({success:true});});
				break;
			case "ChangePriority" :
				if(typeof(custom.AssignmentNum) === "string" && !isNaN(custom.Priority))
					db.query("UPDATE AssignmentTable SET Priority = ? WHERE AssignmentNum = ?", [custom.Priority, custom.AssignmentNum], function(res){callback({success:true});});
				break;
			case "ChangeDescription" :
				if(!isNaN(custom.AssignmentNum) && typeof(custom.Description) === "string")
					db.query("UPDATE AssignmentTable SET Description = ? WHERE AssignmentNum = ? AND ProjectId = ?", [custom.Description, custom.AssignmentNum, this.args.ProjectId], function(res){callback({success:true});});
				break;
				
			// Assign
			case "AssignToUser" :
				if(typeof(custom.AssignmentNum) === "string" && typeof(custom.UserId) === "string")
					db.query("EXEC dbo.AssignmentAssignToUser ?, ?", [custom.AssignmentNum, custom.UserId], function(res){callback({success:true});});
				break;
			case "DeAssignFromUser" :
				if(typeof(custom.AssignmentNum) === "string" && typeof(custom.UserId) === "string")
					db.query("EXEC dbo.AssignmentDeAssignFromUser ?, ?", [custom.AssignmentNum, custom.UserId], function(res){callback({success:true});});
				break;
			*/
			case "ChangeDescription" :
				if(!isNaN(custom.AssignmentNum) && typeof(custom.Description) === "string")
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'desc', custom.Description], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeTitle" :
				if(!isNaN(custom.AssignmentNum) && typeof(custom.Title) === "string")
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'title', custom.Title], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "DevEstimate" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.DevEstimate))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'devestimate', custom.DevEstimate], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangePriority" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.Priority))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'priority', custom.Priority], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeStatus" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.Status))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'status', custom.Status], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeType" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.Type))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'type', custom.Type], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeMilestone" :
				if(!isNaN(custom.AssignmentNum) && custom.Milestone !== undefined)
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'milestone', custom.Milestone], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeMilestoneId" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.MilestoneId))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'milestoneid', custom.MilestoneId], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
			case "ChangeProjectId" :
				if(!isNaN(custom.AssignmentNum) && !isNaN(custom.ProjectId))
					db.query("EXEC AssignmentUpdateField @projectId = ?, @userId = ?, @assignmentNum = ?, @field = ?, @value = ?", 
							[this.args.ProjectId, this.session.userId, custom.AssignmentNum, 'projectid', custom.ProjectId], function(res){callback({success:(res[0].Success === 1 ? true: false)});});
				break;
		}
	} else {
		callback({error: "Ugyldig handling"});
	}
}

AssignmentTable.prototype.handleQuery = function(db, query, callback){
	var q = "";
	var order = "Priority desc, A.Id desc";
	var fields = "A.Id AS AssignmentNum, A.Id, Priority,A.Status, A.Type, V.TypeText, Title, MilestoneId, Milestone,Tags, LastChangeId, CreationChangeId, V.StatusText, V.Approved, V.Assignees, A.DevEstimate";
	var joins = " INNER JOIN dbo.IssueSearchFieldsView AS V ON A.Id = V.Num  ";
	
	if(query === undefined)
		q = "";
	
	if(typeof(query) === "string"){
		q = query;
	} else if(typeof(query) === "object"){
		if(typeof(query.query) === "string" && query.query !== undefined)
			q = query.query;

		if(query.includeDescription !== undefined && query.includeDescription !== false)
			fields += ", Description";

		if(typeof(query.field) === "string"){
			switch(query.field){
				case "Description": fields = "A.Id, Description"; 		break;
				case "Priority": 	fields = "A.Id, Priority"; 			break;
				case "Approved": 	fields = "A.Id, Approved"; 			break;
				case "Tags": 		fields = "A.Id, Tags"; 				break;
				case "DevEstimate": fields = "A.Id, DevEstimate"; 		break;
				case "Assignees": 	fields = "A.Id, V.Assignees"; 		break;

				default: fields = "AssignmentNum";
			}
		}
	}

	//console.log(JSON.stringify(query));
	
	db.query("EXEC dbo.getAssignments @userId = ?, @projectId = ?, @query = ?, @order = ?, @fields = ?, @joins = ?", [this.session.userId, this.args.ProjectId, q, order, fields, joins], function(res){
		callback(res);
	});
}
		
exports = module.exports = AssignmentTable;