function loadModule_Projects(){
	var tc = {
				type: "TableCreator",
				typeId: "Projects",
				linesPerPage: 15,
				clickable: true,
				columns: [
					//{title: "Id", dataKey: "Id", visible: !isMobile()}, 
					{title: "Title", dataKey: "Title"},
					{title: "Owner", dataKey: "OwnerName", width: "150px", visible: !isMobile()}
				],
				dataSource: function(callback, query){
					request({module: "database", action: "query", table: "Projects"}, callback);
				},
				/*onClick: function(row){
					showProject(row.ProjectType, row.ProjectRefId);
				},*/
				createRecord: {
					fields: [
								{name: "Title", title: "Title:", style: {width: "120px"}}
							],
					validate: function(record){return record.Tag == "" ? "No title" : true;},
					onCreate: function(record, callback){
						record.HideInGrids = record.Hide ? 1 : 0;
						request({module: "database", action: "insert", table: "Projects", record: record}, callback);
					}
				},
				editRecord: {
					fields: [
								{name: "Title", title: "Title:", type: "text"}
							],
					onEdit: function(oldRecord, newRecord, callback){
						request({module: "database", action: "update", table: "Projects", oldRecord: oldRecord, newRecord: newRecord}, callback);
					}
				},
				deleteRecord: {
					onDelete: function(record, callback){
						request({module: "database", action: "delete", table: "Projects", record: record}, callback);
					}
				},
				onClick: function(record){
					new PopupCreator().init({
						title: "Project " + record.Title,
						style: {width: "400px"},
						content: "	<h3>Members</h3>\
									<div id='members'></div>\
									<h3>Add members</h3>\
									<p>Press the button below to generate an URL. When the URL is entered in a browser where a user is logged in, that user is added as a project member. \
									The URL can only be used once and will expire after 24 hours</p>\
									<button id='GenJoinURL'>Generate URL for members to join</button>\
									\
									<h3>Set active project</h3>\
									Right click the project and click 'Set as active project'.\
									",
						onShow: function(){
							var t = this;
							this.element.find("#GenJoinURL").click(function(){
								request({module: "database", action: "custom", table: "ActionLinks", custom: "GetJoinGUID"}, function(ret){
									var url = window.location.href;
									if(url.indexOf("?") >= 0)
										url = url.substring(0, url.indexOf("?") - 1);

									url += "?actionlink=" + ret.guid;

									prompt("Copy the URL and send it to a user to be added as project member", url);
								});
							});

							request({module: "database", action: "custom", table: "Projects", custom: {action: "GetUsers", ProjectId: record.Id}}, function(ret){
								var membersText = "";
								for(var i in ret)
									membersText += ret[i].FirstName + " " + ret[i].LastName + " (" + ret[i].Username + ") " + (ret[i].IsOwner===1? " - owner":"") + "<br/>";

								t.element.find("#members").html(membersText);
							});
						}

					}).show();
				},
				recordRightClickMenu: {
					sort: true, 
					actions: [
						{title: "Set as active project", onClick: function(a, r, callback){
							setActiveProject(r.Id);
						}}
					]
				}
			};

	return {
		title: "Projects", 
		icon: "/img/hierarchy.png",
		requireLoggedIn: true,
		popup: {
			title: "Projects",
			typeId: "TagList",
			style: {"width": "400px", height: "400px"},
			content: [
						tc
					 ]
		}
	};
}