function loadModule_Milestones(){
	var tc = {
				type: "TableCreator",
				typeId: "Milestones",
				linesPerPage: 15,
				clickable: true,
				columns: [
					{title: "Id", dataKey: "Id", visible: false}, 
					{title: "Name", dataKey: "Name"},
					{title: "Description", dataKey: "Description", visible: !isMobile()}
				],
				dataSource: function(callback, query){
					request({module: "database", action: "query", table: "Milestones"}, callback);
				},
				/*onClick: function(row){
					showProject(row.ProjectType, row.ProjectRefId);
				},*/
				createRecord: {
					fields: [
								{name: "Name", title: "Name:", style: {width: "120px"}},
								{name: "Description", title: "Description:", style: {width: "120px"}}
							],
					validate: function(record){return record.Name == "" ? "No Name" : record.Name.length > 50 ? "Name can only be 50 chars" : record.Description.length > 150 ? "Description can only be 150 chars" : true;},
					onCreate: function(record, callback){
						request({module: "database", action: "insert", table: "Milestones", record: record}, callback);
					}
				},
				editRecord: {
					fields: [
								{name: "Name", title: "Name:", style: {width: "120px"}},
								{name: "Description", title: "Description:", style: {width: "120px"}}
							],
					onEdit: function(oldRecord, newRecord, callback){
						request({module: "database", action: "update", table: "Milestones", oldRecord: oldRecord, newRecord: newRecord}, callback);
					}
				},
				deleteRecord: {
					onDelete: function(record, callback){
						request({module: "database", action: "delete", table: "Milestones", record: record}, callback);
					}
				},
				onClick: function(record){
					setActiveProject(record.Id);
				}
			};

	return {
		title: "Milestones", 
		icon: "/img/milestone.png",
		requireLoggedIn: true,
		popup: {
			title: "Milestones",
			typeId: "MilestonesList",
			style: {"width": "400px", height: "400px"},
			content: [
						tc
					 ]
		}
	};
}