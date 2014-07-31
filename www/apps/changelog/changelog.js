function loadModule_Changelog(){
	var tcList = {
						type: "TableCreator",
						typeId: "Changelog",
						clickable: true,
						linesPerPage: 20,
						showRecordsPerPageSelector: true,
						showFieldsSelector: true,
						dataSource: function(onData, q){
							//query("changelog",  (q == "" || q === undefined) ? ":all" : q, function(_changelog) {
							request({module: "database", table: "Changelog", action: "query", query: (q == "" || q === undefined) ? ":all" : q}, function(_changelog) {
								onData(_changelog);
							});
						},
						columns: [
										{title: "Timestamp", dataKey: "TimestampFormatted", width: "140px"},
										{title: "User", dataKey: "User", width: "100px"},
										{title: "Type", dataKey: "ContentTypeTitle", width: "80px"},
										{title: "Reference", dataKey: "ContentRefId", width: "100px"},
										{title: "Change", dataKey: "ChangeTypePrintable", width: "140px"},
										{title: "Description", dataKey: "ChangeText"}
								 ],
						onClick: function(row, idx){
							showContent(row.ContentType, row.ContentRefId);
						}
					};
					
	var tcSavedSearches = {
						type: "TableCreator",
						typeId: "ChangelogSavedSearches",
						columns: [{title: "Title", dataKey: "Title"}, {title: "Query", dataKey: "Query"}],
						dataSource: function(onData){
									request({module: "database", action: "query", table: "UserSavedQueries", query: "Changelog"}, function(data){
										onData(data);
									});
								},
						createRecord: {
									fields: [
										{name: "Title", 	title: "Title:"}, 
										{name: "Query", 	title: "Query:"},
										{name: "ProjectIndependent", title: "Project independent?: ", type: "checkbox"}
									],
									validate: function(record){return record.Title == "" ? "Title is mandatory" : true},
									onCreate: function(record, onFinished){
										record.Context = "Changelog";
										record.ProjectId = record.ProjectIndependent ? undefined : issueMan.activeProject;
										request({module: "database", action: "insert", table: "UserSavedQueries", record: record}, function(){onFinished();});
									}
								},
						editRecord: {
									fields: [
										{name: "Title", 	title: "Title:"}, 
										{name: "Query", 	title: "Query:"},
										{name: "ProjectIndependent", title: "Project independent?: ", type: "checkbox"}
									],
									validate: function(oldRecord, newRecord){return newRecord.Title != "" && newRecord.Query != "";},
									onEdit: function(oldRecord, newRecord, onFinished){
										newRecord.ProjectId = newRecord.ProjectIndependent ? undefined : issueMan.activeProject;
										request({module: "database", action: "update", table: "UserSavedQueries", oldRecord: oldRecord, newRecord: newRecord}, function(){onFinished();});
									}
								},
						deleteRecord: {
									onDelete: function(record, onFinished){
										request({module: "database", action: "delete", table: "UserSavedQueries", record: record}, function(){onFinished();});
									}
								}
				};
				
	var getDropDownItems = function(callback){
		request({type: "databaseaction", action: "query", table: "UserSavedQueries", query: "Changelog"}, function(data){
			callback(data);
		});
	}
	
	return {title: "Changelog", icon: "/img/changelog.png",
			requireLoggedIn: true, 
			popup: {	title: "Changelog", 
						typeId: "Changelog",
						//maximize: true,
						style: {width: "800px", height: "750px"},
								onShow: function(){
									if(!window.isMobile()) 
										this.element.find(".sbbar").focus();
								},
						tabs: [
							{
								title: "Liste",
								content: [
											{type: "SearchBar", dropDownItems: getDropDownItems, delayedSearch: 400, onSearch: function(query){this.popupCreator.contentObjects[1].reloadData(query);}}, 
											tcList
										 ],
								onShow: function(){
									if(!window.isMobile()) 
										this.element.find(".sbbar").focus();
								}
							},
							{
								title: "Saved searches",
								content: tcSavedSearches
							},
							{title: "Help",contentExternal: "/issues/apps/changelog/searchhelp.html"}
						]
					}
			};;
}