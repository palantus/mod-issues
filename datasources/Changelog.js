function Changelog(){
}

Changelog.prototype.handleQuery = function(db, query, callback){
	var q = "";
	var order = "Timestamp desc";
	var fields = "TOP(200) A.Id, ContentType, ContentRefId, A.UserId, U.FirstName AS [User], ChangeType, T.Title AS ChangeTypePrintable, Personal, CONVERT(VARCHAR, Timestamp, 120) AS TimestampFormatted, "
			   + " ChangeText = case when (DATALENGTH(A.changetext) > 100) then SUBSTRING(A.changetext, 1, 94) + ' [...]' else A.ChangeText end, PT.Title AS ContentTypeTitle";
	var joins = " LEFT JOIN ChangelogTypes AS T ON A.ChangeType = T.Id LEFT JOIN Users AS U ON A.UserId = U.Id LEFT JOIN ProjectTypes AS PT ON A.ContentType = PT.Id ";
	
	if(query === undefined)
		q = "";
	
	if(typeof(query) === "string"){
		q = query;
	} else if(typeof(query) === "object"){
		if(typeof(query.query) === "string" && query.query !== undefined)
			q = query.query;

		/*
		if(query.includeDescription !== undefined && query.includeDescription !== false)
			fields += ", Description";

		if(typeof(query.field) === "string"){
			switch(query.field){
				case "Description": fields = "AssignmentNum, Description"; 			break;
				case "Priority": 	fields = "AssignmentNum, Priority"; 			break;
				case "Approved": 	fields = "AssignmentNum, Approved"; 			break;
				case "Tags": 		fields = "AssignmentNum, Tags"; 				break;
				case "DevEstimate": fields = "AssignmentNum, V.DevEstimate"; 		break;
				case "Assignees": 	fields = "AssignmentNum, V.Assignees"; 		break;

				default: fields = "AssignmentNum";
			}
		}
		*/
	}

	//console.log(JSON.stringify(query));
	
	db.query("EXEC dbo.getChangelog @userId = ?, @projectId = ?, @query = ?, @order = ?, @fields = ?, @joins = ?", [this.session.userId, this.args.ProjectId, q, order, fields, joins], function(res){
		callback(res);
	});
}
		
exports = module.exports = Changelog;