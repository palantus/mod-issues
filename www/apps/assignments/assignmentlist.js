function loadModule_AssignmentList(){
	var tcList = {
						type: "TableCreator",
						typeId: "AssignmentList",
						clickable: true,
						linesPerPage: 10,
						showRecordsPerPageSelector: true,
						showFieldsSelector: true,
						dataSource: function(onData, q){
							//query("assignments",  q, function(_assignments) {
							request({module: "database", table: "AssignmentTable", action: "query", query: (!q? ":open" : q)}, function(_assignments) {
								for(i in _assignments)
									_assignments[i].Tags = _assignments[i].Tags? _assignments[i].Tags.replace(/,/g, ", ") : _assignments[i].Tags;
								onData(_assignments);
							}, function(error){onData([]);});
						},
						columns: [
									{title: "Issue", dataKey: "AssignmentNum", width: "50px", visible: !isMobile()},
									{title: "Type", dataKey: "TypeText", width: "90px", visible: false},
									{title: "Priority", dataKey: "Priority", width: "50px", visible: !isMobile()},
									{title: "Status", dataKey: "StatusText", width: "80px", visible: !isMobile()},
									{title: "Title", dataKey: "Title"},
									{title: "Milestone", dataKey: "Milestone", width: "50px", visible: !isMobile()},
									{title: "Estimate", dataKey: "DevEstimate", visible: false},
									{title: "Approved", dataKey: "Approved", visible: false},
									{title: "Assigned to", dataKey: "Assignees", visible: false},
									{title: "Tags", dataKey: "Tags", visible: !isMobile()}
								 ],
						onClick: function(row, idx){
							var num = row.AssignmentNum;
							showAssignment(num);
						},
						recordRightClickMenu: {sort: true, actions: $.merge(
							[
								{title: "Tag all in list", onClick: function(a, r, callback){
									showIssueTagAllPrompt(this.data, callback);
								}},
								{title: "Move all to another project", onClick: function(a, r, callback){
									showIssueMoveAllToProjectPrompt(this.data, callback);
								}}
							], assignmentRightClickMenu.actions)
						},
						createRecord: {
							title: "New issue",
							fields: [
								{title: "Title", name: "Title"},
								{title: "Project", name: "ProjectId", type: "select", value: function(){return issueMan.activeProject;}, values: function(cb){request({module: "database", table: "Projects", action: "query"}, function(elements){cb(elements);});}},
								{title: "Type", name: "Type", type: "select", values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetAssignmentTypes"}, function(elements){cb(elements);});}},
								{title: "Priority", name: "Priority", width: "50px"},
								{title: "Status", name: "Status", width: "70px", type: "select", values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetAssignmentStatusValues"}, function(elements){cb(elements);});}},
								{title: "Milestone", name: "MilestoneId", width: "70px", type: "select", values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetMilestones"}, function(elements){cb($.merge([{id: 0, label: ""}], elements));});}},
								{title: "Description", name: "Description", type: "textarea", style: {width: "400px", height: "100px"}}
							],
							validate: function(record){return record.Title == "" ? "Title is mandatory"
															 : record.Title.length > 150 ? "Title can only be 150 characters"
														     : isNaN(record.Priority) ? "Priority must be a number"
														     : (parseInt(record.Priority) < 0 || parseInt(record.Priority) > 100) ? "Priority must be between 0 and 100"
															 : true;},
							onCreate: function(record, onFinished){
								record.MilestoneId = (record.MilestoneId != '' && record.MilestoneId != null) ? record.MilestoneId : undefined;
								request({module: "database", table: "AssignmentTable", action: "insert", record: record}, function(res){
									new Notifier().show("Created issue " + res.AssignmentNum);
									onFinished();
									showContent(10, res.AssignmentNum);
								});
							}
						}
					};
	
	var tcSavedSearches = {
						type: "TableCreator",
						typeId: "AssignmentListSavedSearches",
						columns: [{title: "Titel", dataKey: "Title"}, {title: "Søgestreng", dataKey: "Query"}],
						dataSource: function(onData){
									request({module: "database", action: "query", table: "UserSavedQueries", query: "Opgaveliste"}, function(data){
										onData(data);
									});
								},
						createRecord: {
									fields: [
										{name: "Title", 	title: "Title:"}, 
										{name: "Query", 	title: "Query:"},
										{name: "ProjectIndependent", title: "Project independent?: ", type: "checkbox"}
									],
									validate: function(record){return record.Title != "" && record.Query != "";},
									onCreate: function(record, onFinished){
										record.Context = "Opgaveliste";
										record.ProjectId = record.ProjectIndependent ? undefined : issueMan.activeProject;
										request({module: "database", action: "insert", table: "UserSavedQueries", record: record}, function(){onFinished();});
									}
								},
						editRecord: {
									fields: [
										{name: "Title", title: "Title:"}, 
										{name: "Query", title: "Query:"},
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
		request({module: "database", action: "query", table: "UserSavedQueries", query: "Opgaveliste"}, function(data){
			callback(data);
		});
	}
	
	return {title: "Issues", icon: "/img/checklist.png", 
			requireLoggedIn: true,
			popup:  
				{	
					title: "Issues", 
					typeId: "AssignmentList",
					/*maximize: true,*/
					style: {width: "1100px", height: "560px"},
								onShow: function(){
									if(!window.isMobile()) 
										this.element.find(".sbbar").focus();
								},
					tabs: [
						{
							title: "List",
							content: [
										{
											type: "SearchBar", 
											dropDownItems: getDropDownItems, 
											delayIfCharsBelow: 3, 
											delayIfCharsBelowFactor: 3, 
											delayedSearch: 400, 
											onSearch: function(query){this.popupCreator.contentObjects[1].reloadData(query);}
										}, 
										tcList
									 ],
							onShow: function(){
								if(!window.isMobile()) 
									this.element.find(".sbbar").focus();
							}
						},
						{title: "Saved filters", content: tcSavedSearches},
						{title: "Help",contentExternal: "/issues/apps/assignments/searchhelp.html"}
					]
				}
			};;
}


function showAssignment(num){
	//query("assignments", "num:" + num, {fields: ["A.*", "Tags", "StatusText", "Status50Text", "Status60Text", "DevEstimate", "Assignees"]}, function(curAssignment){
	request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, includeDescription: true}}, function(curAssignment) {
		
		var curAssignment = curAssignment[0];
		
		var assignmentTabContent = $('<div id="assignmentDialog-tabs-assignments">\
				<table cellspacing="0">\
					<tr><td>Title:</td><td><div id="assignmentTitle"></div></td></tr>\
					<tr><td>Type:</td><td><span style="width:100px; display: inline-block;" id="assignmentType"></span></td></tr>\
					<tr><td>Status:</td><td><span style="width:100px; display: inline-block;" id="assignmentStatus"></span></td></tr>\
					<tr><td>Priority:</td><td><div id="assignmentPriority"></div></td></tr>\
					<tr><td>Approved:</td><td><div id="assignmentApproval"><img style="width: 15px; height: 15px;" src="/img/loading.gif"></img></div></td></tr>\
					<tr><td>Milestone:</td><td><div id="assignmentMilestone"></div></td></tr>\
					<tr><td>Estimate:</td><td><div id="assignmentDevEstimate"></div></td></tr>\
					<tr><td>Assigned to:</td><td><div id="assignmentAssignees"></div></td></tr>\
					<tr><td>Tags:</td><td><div id="assignmentTags"></div></td></tr>\
				</table>\
				<details open>\
					<summary class="multilineheader">Description:</summary>\
					<div id="assignmentDescription" style="white-space: pre-wrap;"></div>\
				</details>\
				<details open>\
					<summary class="multilineheader">Comments:</summary>\
					<div id="assignmentComments"></div>\
				</details>\
			</div>');
		
		assignmentTabContent.find("#assignmentTitle").html(curAssignment.Title);
		assignmentTabContent.find("#assignmentType").html(curAssignment.TypeText);
		assignmentTabContent.find("#assignmentStatus").html(curAssignment.StatusText);
		assignmentTabContent.find("#assignmentHotfix").html(curAssignment.Hotfix);
		assignmentTabContent.find("#assignmentPriority").html(curAssignment.Priority);
		assignmentTabContent.find("#assignmentAssignees").html(curAssignment.Assignees);
		assignmentTabContent.find("#assignmentDevEstimate").html(curAssignment.DevEstimate != null ? curAssignment.DevEstimate + " timer": "Ikke angivet");
		assignmentTabContent.find("#assignmentTags").html(curAssignment.Tags != undefined ? curAssignment.Tags.replace(/,/g,', ') : "");
		assignmentTabContent.find("#assignmentDescription").html(curAssignment.Description);
				
		var tcChangelog = {	type: "TableCreator", 
							typeId: "AssignmentChangelog",
							hideFooter: true,
							hideHeader: true,
							css: {margin: "10px"},
							columns: [
										{title: "Timestamp", dataKey: "TimestampFormatted", width: "145px"},
										{title: "User", dataKey: "User", width: "70px"},
										{title: "Type", dataKey: "ChangeTypePrintable", width: "120px"},
										{title: "Change", dataKey: "ChangeText"}
									 ],
							dataSource: function(onData){
								//query("changelog", "assignment:" + num, function(changelog){
								request({module: "database", table: "Changelog", action: "query", query: "assignment:" + num}, function(changelog) {
									onData(changelog);
								});
							}};
		/*
		var tcElements = {	type: "TableCreator", 
							typeId: "AssignmentElements",
							hideFooter: true,
							hideHeader: true,
							css: {margin: "10px"},
							columns: [
										{title: "Type", dataKey: "ElementTypeTitle"},
										{title: "Name", dataKey: "ElementName"}
									 ],
							dataSource: function(onData){
								request({type: "databaseaction", action: "query", table: "ProjectElements", query: {ProjectType: 10, ProjectRefId: num}}, onData);
							},
							deleteRecord: {
								onDelete: function(record, callback){
									request({type: "databaseaction", action: "delete", table: "ProjectElements", record: record}, callback);
								}
							}
							};
		*/	
		/*			
		var tcNotes = {		type: "TableCreator", 
							typeId: "AssignmentNotes",
							hideFooter: true,
							hideHeader: false,
							clickable: true,
							css: {margin: "10px"},
							columns: [
										{title: "Timestamp", dataKey: "Timestamp", width: "100px"},
										{title: "User", dataKey: "Userid", width: "50px"},
										{title: "Title", dataKey: "Title"}
									 ],
							dataSource: function(onData){
								query("assignmentnotes", "assignment:" + num, function(notes){
									onData(notes);
								});
							},
							onClick: function(record){
								new PopupCreator().init({title: "Notat til " + record.AssignmentNum, content: record.Note.replace(/(\r\n|\n|\r)/gm, "<br/>")}).show();
							},
							createRecord: {
								fields: [
											{name: "Note", title: "Notat:", type: "textarea", style: {width: "800px", height: "350px"}},
										],
								validate: function(record){return record.Note !== "";},
								onCreate: function(record, callback){
									record.AssignmentNum = curAssignment.AssignmentNum;
									var t = this;
									request({module: "database", action: "insert", table: "AssignmentNotes", record: record}, function(){
										t.popupCreator.refreshTabTitles();
										callback();
									});
								}
							},
							editRecord: {
								fields: [
											{name: "Note", title: "Notat:", type: "textarea", style: {width: "800px", height: "350px"}},
										],
								validate: function(record){return record.Note !== "";},
								onEdit: function(oldRecord, newRecord, callback){
									request({module: "database", action: "update", table: "AssignmentNotes", oldRecord: oldRecord, newRecord: newRecord}, callback);
								}
							},
							deleteRecord: {
								onDelete: function(record, callback){
									var t = this;
									request({module: "database", action: "delete", table: "AssignmentNotes", record: record}, function(){
										t.popupCreator.refreshTabTitles();
										callback();
									});
								}
							}
							};
		*/
		/*					
		var tcSub = {		type: "TableCreator", 
							typeId: "AssignmentSub",
							hideFooter: true,
							hideHeader: false,
							clickable: true,
							css: {margin: "10px"},
							columns: [
										{title: "Nummer", dataKey: "AssignmentNum"},
										{title: "Status", dataKey: "StatusText"},
										{title: "Titel", dataKey: "Title"}
									 ],
							dataSource: function(onData){
								query("assignments", "sub:" + num, function(notes){
									onData(notes);
								});
							},
							onClick: function(row){
								showAssignment(row.AssignmentNum);
							}
							};
		*/	
		/*
		var tcRel = {		type: "TableCreator", 
							typeId: "AssignmentRel",
							hideFooter: true,
							hideHeader: false,
							clickable: true,
							css: {margin: "10px"},
							columns: [
										{title: "Relation", dataKey: "RelationTypeTitle"},
										{title: "Type", dataKey: "ProjectTypeTitle"},
										{title: "Reference", dataKey: "ProjectRefId"},
										{title: "Optional Description", dataKey: "CustomText"}
									 ],
							dataSource: function(onData){
								request({database: "database", action: "query", table: "ProjectRelations", query: {"ProjectType" : 10, ProjectRefId: curAssignment.AssignmentNum}}, function(data){
									onData(data);
								});
							},
							onClick: function(row){
								showContent(row.ProjectType, row.ProjectRefId);
							},
						createRecord: {
							title: "Ny relation",
							fields: [
								{title: "Relation", name: "RelType", type: "select", values: function(cb){query("enums", "GetProjectRelationTypes", function(elements){cb(elements);});}},
								{title: "Type", name: "Type2", type: "select", values: function(cb){query("enums", "GetProjectTypes", function(elements){cb(elements);});}},
								{title: "Reference", name: "RefId2"},
								{title: "Evt. beskrivelse", name: "CustomText", width: "50px"}
							],
							validate: function(record){return record.RefId2 == "" ? "Reference skal udfyldes"
															: record.Type2 <= 0 ? "Type skal udfyldes"
															: true;},
							onCreate: function(record, onFinished){
								record.Type1 = 10;
								record.RefId1 = curAssignment.AssignmentNum;
								var t = this;
								request({database: "database", action: "insert", table: "ProjectRelations", record: record}, function(data){
									t.popupCreator.refreshTabTitles();
									onFinished(data);
								});
							}
						},
						deleteRecord: {
							onDelete: function(record, callback){
								var t = this;
								record.Type1 = 10;
								record.RefId1 = curAssignment.AssignmentNum;
								record.Type2 = record.ProjectType;
								record.RefId2 = record.ProjectRefId;
								var t = this;
								request({module: "database", action: "delete", table: "ProjectRelations", record: record}, function(){
									t.popupCreator.refreshTabTitles();
									callback();
								});
							}
						},
						editRecord: {
							fields: [
										{name: "CustomText", title: "Beskrivelse:", type: "text", style: {width: "300px"}},
									],
							onEdit: function(oldRecord, newRecord, callback){
								oldRecord.Type1 = 10;
								oldRecord.RefId1 = curAssignment.AssignmentNum;
								oldRecord.Type2 = oldRecord.ProjectType;
								oldRecord.RefId2 = oldRecord.ProjectRefId;
								request({module: "database", action: "update", table: "ProjectRelations", oldRecord: oldRecord, newRecord: newRecord}, callback);
							}
						}
					};
		*/

		//query("assignmentnotes", "GetAssignmentNoteCount", {num: curAssignment.AssignmentNum}, function(notesCount){
		
		var tab1OnBeforeShow = function(){
			//Kommentarer
			new Comments().init({
				myUserId: issueMan.session.userId,
				element: this.element.find("#assignmentComments"), 
				getComments: function(onData){
					request({module: "database", action: "query", table: "Comments", query: {"ContentType" : 10, RefId: curAssignment.AssignmentNum}}, function(data){
						onData(data);
					});
				},
				onAdd: function(newComment, callback){
					request({module: "database", action: "insert", table: "Comments", record: {"ContentType" : 10, RefId: curAssignment.AssignmentNum, Comment: newComment}}, function(data){
						callback(data);
					});
				},
				onDelete: function(comment, callback){
					request({module: "database", action: "delete", table: "Comments", record: comment}, function(data){
						if(data.success !== true)
							new Notifier().show("You can only delete your own comments");
						else
							callback(data);
					});
				},
				onEdit: function(oldComment, newComment, callback){
					request({module: "database", action: "update", table: "Comments", oldRecord: oldComment, newRecord: newComment}, function(data){
						if(data.success !== true)
							new Notifier().show("You can only edit your own comments");
						else
							callback(data);
					});
				}
			}).show();
			
			// Title field
			new FieldEdit().init({
				element: this.element.find("#assignmentTitle"),
				type: "text",
				value: curAssignment.Title,
				maxLength: 150,
				onSave: function(newValue, oldValue, element){
					element.html(newValue);
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeTitle", AssignmentNum: curAssignment.AssignmentNum, Title: newValue}});
				}
			}).attach();
			
			// Type field
			new FieldEdit().init({
				element: this.element.find("#assignmentType"),
				type: "select",
				width: "120px",
				values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetAssignmentTypes"}, function(elements){cb(elements);})},
				value: curAssignment.Type,
				valueDisplay: curAssignment.TypeText,
				onSave: function(newValue, oldValue, element){
					this.options.valueDisplay = $.grep(this.options.values, function(e){ return e.Id == newValue; })[0].Label;
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeType", AssignmentNum: curAssignment.AssignmentNum, Type: newValue}});
				}
			}).attach();
			
			// Status field
			new FieldEdit().init({
				element: this.element.find("#assignmentStatus"),
				type: "select",
				width: "100px",
				values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetAssignmentStatusValues"}, function(elements){cb(elements);})},
				value: curAssignment.Status,
				valueDisplay: curAssignment.StatusText,
				onSave: function(newValue, oldValue, element){
					this.options.valueDisplay = $.grep(this.options.values, function(e){ return e.Id == newValue; })[0].Label;
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeStatus", AssignmentNum: curAssignment.AssignmentNum, Status: newValue}});
				}
			}).attach();
			
			// Milestone field
			new FieldEdit().init({
				element: this.element.find("#assignmentMilestone"),
				type: "select",
				width: "100px",
				values: function(cb){request({module: "database", table: "AssignmentTable", action: "custom", custom: "GetMilestones"}, function(elements){cb($.merge([{Id: 0, Label: ""}], elements));})},
				value: curAssignment.MilestoneId,
				valueDisplay: curAssignment.Milestone,
				onSave: function(newValue, oldValue, element){
					this.options.valueDisplay = $.grep(this.options.values, function(e){ return e.Id == newValue; })[0].Label;
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeMilestoneId", AssignmentNum: curAssignment.AssignmentNum, MilestoneId: newValue}});
				}
			}).attach();
			
			// Description field
			new FieldEdit().init({
				element: this.element.find("#assignmentDescription"),
				type: "textarea",
				value: curAssignment.Description,
				onSave: function(newValue, oldValue, element){
					element.html(newValue);
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeDescription", AssignmentNum: curAssignment.AssignmentNum, Description: newValue}});
				}
			}).attach();
			
			// Tags field
			new FieldEdit().init({
				element: this.element.find("#assignmentTags"),
				type: "taglist",
				value: curAssignment.Tags? curAssignment.Tags.replace(/,/g, ", ") : curAssignment.Tags,
				onTagAdd: function(element){
					var editF = this;
					new LookupCreator().init({
						tableOptions: {
							columns: [{title: "Tag", dataKey: "Tag"}],
							dataSource: function(cb, query){request({module: "database", action: "query", table: "Tags", query: query}, cb);}
						},
						popupOptions: {style: {height: "400px"}},
						searchBar: true,
						onLookup: function(row){
							if(row.Tag){
								request({module: "database", action: "insert", table: "TagMapping", record: {Type: 10, RefId: curAssignment.AssignmentNum, Tag: row.Tag}}, function(res){
									request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "Tags"}}, function(a) {
										editF.setValue(a[0].Tags? a[0].Tags.replace(/,/g, ", ") : a[0].Tags);
									});
								});
							}
						}
					}).show();
				},
				onTagRemove: function(tag, element){
					var editF = this;
					request({module: "database", action: "delete", table: "TagMapping", record: {Type: 10, RefId: curAssignment.AssignmentNum, Tag: tag}}, function(res){
						request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "Tags"}}, function(a) {
							editF.setValue(a[0].Tags? a[0].Tags.replace(/,/g, ", ") : a[0].Tags);
						});
					});
				}
			}).attach();




			//Approval:
			var t = this;
			var updateApp = function(){
				//query("assignments", "num:" + num, {fields: ["V.Approved50", "V.Approved51", "V.Approved60", "V.Approved62"]}, function(curAssignment){
				request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "Approved"}}, function(curAssignment) {
					t.element.find("#assignmentApproval").html(curAssignment[0].Approved != 0 ? "Yes" : "No");
				});
			}
			t.element.find("#assignmentApproval").html(curAssignment.Approved != 0 ? "Yes" : "No");
			t.element.find("#assignmentApproval").closest("tr").css("cursor", "pointer");
			t.element.find("#assignmentApproval").closest("tr").click(function(){
				showAssignmentApprovalPrompt(num, function(){
					updateApp();
				});
			});
			
			/* Dev estimate */
			var updateEstimate = function(){
				request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "DevEstimate"}}, function(curAssignment) {
					t.element.find("#assignmentDevEstimate").html(curAssignment[0].DevEstimate != null ? curAssignment[0].DevEstimate + " hours": "Not estimated");
				});
			}
			t.element.find("#assignmentDevEstimate").html(curAssignment.DevEstimate != null ? curAssignment.DevEstimate + " hours": "Not estimated");
			t.element.find("#assignmentDevEstimate").closest("tr").css("cursor", "pointer");
			t.element.find("#assignmentDevEstimate").closest("tr").click(function(){
				showAssignmentEstimatePrompt(num, function(){
					updateEstimate();
				});
			});
			
			/* Priority */
			var updatePriority = function(){
				request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "Priority"}}, function(curAssignment) {
					t.element.find("#assignmentPriority").html(curAssignment[0].Priority);
				});
			}
			t.element.find("#assignmentPriority").closest("tr").css("cursor", "pointer");
			t.element.find("#assignmentPriority").closest("tr").click(function(){
				showAssignmentPriorityPrompt(num, function(){
					updatePriority();
				});
			});
			
			/* Assignees */
			var updateAssignees = function(){
				request({module: "database", table: "AssignmentTable", action: "query", query: {query: "num:" + num, field: "Assignees"}}, function(curAssignment) {
					t.element.find("#assignmentAssignees").html(curAssignment[0].Assignees != null ? curAssignment[0].Assignees : "Nobody");
				});
			}
			t.element.find("#assignmentAssignees").html(curAssignment.Assignees != null ? curAssignment.Assignees : "Nobody");
			t.element.find("#assignmentAssignees").closest("tr").css("cursor", "pointer");
			t.element.find("#assignmentAssignees").closest("tr").click(function(){
				showAssignmentAssignPrompt(num, function(){
					updateAssignees();
				});
			});
		}
	
		var popupCreator = new PopupCreator();
		popupCreator.init({
			title: "Issue " + num,
			//style: {width: "900px", top: "80px", left: "50%", "margin-left": "-450px"},
			style: {width: "800px"},
			center: false,
			/*contentStyle: {"max-height": "650px"},*/
			rightClickMenu: $.extend({}, assignmentRightClickMenu, {sort: true, onClickOverride: function(action, ele){
				action.onClick.call(this, action, curAssignment, function(){});
			}}),
			modal: false,
			tabs: [
				{title: "General", content: assignmentTabContent, onShow: tab1OnBeforeShow},
				{title: "Changelog", content: tcChangelog},
				//{title: "Elements", content: tcElements},
				//{title: "Notes", content: tcNotes},//{title: function(cb){request({type: "databaseaction", action: "query", table: "AssignmentNotes", query: {Num: curAssignment.AssignmentNum}}, function(notesCount){cb("Notes (" + notesCount[0].NoteCount + ")");});}, content: tcNotes},
				//{title: "Relations", content: tcRel},//{title: function(cb){request({type: "databaseaction", action: "query", table: "ProjectRelations", query: {ProjectType: 10, ProjectRefId: curAssignment.AssignmentNum}}, function(count){cb("Relations (" + count.length + ")");});}, content: tcRel},
				//{title: "Sub Assignments", content: tcSub}
			]
		});

		popupCreator.show();
		//});
	});
}

function showAssignmentApprovalPrompt(num, callback){
	if(callback === undefined) callback = function(){};
	new PopupCreator().init({
		title: "Approval of issue " + num,
		style: {width: "350px"},
		content: '<table>\
					<tr><td>Action:<td/><td><select><option value="0">Approve</option><option value="1">Remove my approvals</option><option value="2">Remove all approvals</option></select></td></tr>\
					<tr><td><td/><td><button>Go</button><button>Cancel</button></td></tr>\
				</table>',
		onShow: function(){
			var t = this;
			this.element.find("select").first().focus();
			this.element.find("button:nth-child(1)").click(function(){
				var action = t.element.find("select:eq(0)").val();
				var version = t.element.find("select:eq(1)").val();
				if(action == 0){ //Godkend
					request({type: "databaseaction", action: "custom", table: "AssignmentTable", custom: {action: "Approve", AssignmentNum: num, Version: version}}, function(r){
						new Notifier().show(r.AssignmentNum + " has been approved");
						t.close();
						callback();
					});
				} else if(action == 1){ //Fjern mine godkendelser
					request({type: "databaseaction", action: "custom", table: "AssignmentTable", custom: {action: "DisApprove", AssignmentNum: num, Version: version}}, function(r){
						new Notifier().show(r.AssignmentNum + " is not approved anymore by you");
						t.close();
						callback();
					});
				} else if(action == 2){ //Fjern alle godkendelser
					request({type: "databaseaction", action: "custom", table: "AssignmentTable", custom: {action: "Reject", AssignmentNum: num, Version: version}}, function(r){
						new Notifier().show(r.AssignmentNum + " is not approved anymore");
						t.close();
						callback();
					});
				} else {
					new Notifier().show("Not implemented");
					t.close();
				}
			});
			this.element.find("button:nth-child(2)").click(function(){
				t.close();
			});
		}	
	}).show();
}

function showAssignmentAssignPrompt(num, callback){
	if(callback === undefined) callback = function(){};
	new PopupCreator().init({
		title: "Assignees of issue " + num,
		style: {width: "350px"},
		content: '<table>\
					<tr><td>Action:<td/><td><select><option value="0">Add</option><option value="1">Remove</option></select></td></tr>\
					<tr><td>User:<td/><td><select></select></td></tr>\
					<tr><td><td/><td><button>Go</button><button>Cancel</button></td></tr>\
				</table>',
		onShow: function(){
			
			var t = this;
			
			request({type: "databaseaction", action: "query", table: "Users"}, function(r){
				$.each(r, function(i, v){
					t.element.find("select:eq(1)").append("<option value='" + v.UserId + "'>" + v.Name + " (" + v.UserId + ")</option>");
				});
			});
						
			
			this.element.find("select").first().focus();
			this.element.find("button:nth-child(1)").click(function(){
				var action = t.element.find("select:eq(0)").val();
				var user = t.element.find("select:eq(1)").val();
				
				if(action == 0){ //Tilføj
					request({type: "databaseaction", action: "custom", table: "AssignmentTable", custom: {action: "AssignToUser", AssignmentNum: num, UserId: user}}, function(r){
						new Notifier().show(num + " has now been assigned to " + user);
						t.close();
						callback();
					});
				} else if(action == 1){ //Fjern
					request({type: "databaseaction", action: "custom", table: "AssignmentTable", custom: {action: "DeAssignFromUser", AssignmentNum: num, UserId: user}}, function(r){
						new Notifier().show(num + " is not assigned to " + user + " anymore");
						t.close();
						callback();
					});
				}
			});
			this.element.find("button:nth-child(2)").click(function(){
				t.close();
			});
		}	
	}).show();
}

function showAssignmentEstimatePrompt(num, callback){
	if(callback === undefined) callback = function(){};
	new PopupCreator().init({
		title: "Estimation of issue " + num,
		style: {width: "350px"},
		content: '<table>\
					<tr><td>Development time:<td/><td><input type="text" pattern="[0-9]+([\.|,][0-9]+)?"></input></td></tr>\
					<tr><td><td/><td><button>Go</button><button>Cancel</button></td></tr>\
				</table>',
		onShow: function(){
			
			var t = this;
			
			this.element.find("input").first().focus();
			
			this.element.find("input").first().keydown(function(e){
				if(e.keyCode == 13){
					t.element.find("button:nth-child(1)").click();
				}
			});
			
			this.element.find("button:nth-child(1)").click(function(){
				var devEstimate = t.element.find("input:eq(0)").val().replace(",", ".");
				
				if(!isNaN(devEstimate)){
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "DevEstimate", AssignmentNum: num, DevEstimate: devEstimate}}, function(r){
						new Notifier().show("Issue " + num + " is now estimated to " + devEstimate + " hour(s)");
						callback();
					});
					t.close();
				}
			});
			this.element.find("button:nth-child(2)").click(function(){
				t.close();
			});
		}	
	}).show();
}

function showAssignmentPriorityPrompt(num, callback){
	if(callback === undefined) callback = function(){};
	new PopupCreator().init({
		title: "Priority of issue " + num,
		style: {width: "350px"},
		content: '<table>\
					<tr><td>Priority:<td/><td><input type="text" pattern="[0-9]+"></input></td></tr>\
					<tr><td><td/><td><button>Go</button><button>Cancel</button></td></tr>\
				</table>',
		onShow: function(){
			
			var t = this;
			
			this.element.find("input").first().focus();
			
			this.element.find("input").first().keydown(function(e){
				if(e.keyCode == 13){
					t.element.find("button:nth-child(1)").click();
				}
			});
			
			this.element.find("button:nth-child(1)").click(function(){
				var priority = t.element.find("input:eq(0)").val();
				
				if(!isNaN(priority)){
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangePriority", AssignmentNum: num, Priority: priority}}, function(r){
						new Notifier().show("Issue " + num + " now has priority " + priority);
						callback();
					});
					t.close();
				}
			});
			this.element.find("button:nth-child(2)").click(function(){
				t.close();
			});
		}	
	}).show();
}

function showIssueTagAllPrompt(data, callback){ //todo
	if(callback === undefined) callback = function(){};
	new LookupCreator().init({
		tableOptions: {
			columns: [{title: "Tag", dataKey: "Tag"}],
			dataSource: function(cb, query){request({module: "database", action: "query", table: "Tags", query: query}, cb);}
		},
		popupOptions: {style: {height: "400px"}},
		searchBar: true,
		onLookup: function(row){
			if(row.Tag){
				for(var i = 0; i < data.length - 1; i++){
					request({module: "database", action: "insert", table: "TagMapping", record: {Type: 10, RefId: data[i].AssignmentNum, Tag: row.Tag}});
				}

				if(data.length > 0){
					request({module: "database", action: "insert", table: "TagMapping", record: {Type: 10, RefId: data[data.length - 1].AssignmentNum, Tag: row.Tag}}, function(){
						callback();
					});
				} else {
					callback();
				}
			}
		}
	}).show();
}

function showIssueMoveAllToProjectPrompt(data, callback){ //todo
	if(callback === undefined) callback = function(){};
	new LookupCreator().init({
		tableOptions: {
			columns: [{title: "Title", dataKey: "Title"}],
			dataSource: function(cb, query){request({module: "database", action: "query", table: "Projects", query: query}, cb);}
		},
		popupOptions: {style: {height: "400px"}},
		searchBar: true,
		onLookup: function(row){
			if(row.Id && confirm("Are you sure that you want to move ALL " + data.length + " issues to project " + row.Title + "?") == true){
				for(var i = 0; i < data.length - 1; i++){
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeProjectId", AssignmentNum: data[i].AssignmentNum, ProjectId: row.Id}});
				}

				if(data.length > 0){
					request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeProjectId", AssignmentNum: data[data.length - 1].AssignmentNum, ProjectId: row.Id}}, function(){
						callback();
					});
				} else {
					callback();
				}
			}
		}
	}).show();
}

function showIssueMoveToProjectPrompt(num, callback){ //todo
	if(callback === undefined) callback = function(){};
	new LookupCreator().init({
		tableOptions: {
			columns: [{title: "Title", dataKey: "Title"}],
			dataSource: function(cb, query){request({module: "database", action: "query", table: "Projects", query: query}, cb);}
		},
		popupOptions: {style: {height: "400px"}},
		searchBar: true,
		onLookup: function(row){
			if(row.Id && confirm("Are you sure that you want to move issue " + num + " to project " + row.Title + "?") == true){
				request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "ChangeProjectId", AssignmentNum: num, ProjectId: row.Id}}, function(){
					callback();
				});
			}
		}
	}).show();
}
/* Used to pop-out functionality - need a lot of refinement!
function createAssignmentText(curAssignment){
	var assignmentTabContent = $('<div id="assignmentDialog-tabs-assignments">\
				<table cellspacing="0">\
					<tr><td>Title:</td><td><div id="assignmentTitle"></div></td></tr>\
					<tr><td>Status:</td><td><span style="width:100px; display: inline-block;" id="assignmentStatus"></span></td></tr>\
					<tr><td>Priority:</td><td><div id="assignmentPriority"></div></td></tr>\
					<tr><td>Approved:</td><td><div id="assignmentApproval"></div></td></tr>\
					<tr><td>Milestone:</td><td><div id="assignmentHotfix"></div></td></tr>\
					<tr><td>Estimate:</td><td><div id="assignmentDevEstimate"></div></td></tr>\
					<tr><td>Assigned to:</td><td><div id="assignmentAssignees"></div></td></tr>\
					<tr><td>Tags:</td><td><div id="assignmentTags"></div></td></tr>\
				</table>\
				<details open>\
					<summary class="multilineheader">Description:</summary>\
					<div id="assignmentDescription" style="white-space: pre-wrap;"></div>\
				</details>\
				<details open>\
					<summary class="multilineheader">Comments:</summary>\
					<div id="assignmentComments"></div>\
				</details>\
			</div>');
		
	assignmentTabContent.find("#assignmentTitle").html(curAssignment.Title);
	assignmentTabContent.find("#assignmentStatus").html(curAssignment.StatusText);
	assignmentTabContent.find("#assignmentStatus50").html(curAssignment.Status50Text);
	assignmentTabContent.find("#assignmentStatus60").html(curAssignment.Status60Text);
	assignmentTabContent.find("#assignmentHotfix").html(curAssignment.Hotfix);
	assignmentTabContent.find("#assignmentPriority").html(curAssignment.Priority);
	assignmentTabContent.find("#assignmentAssignees").html(curAssignment.Assignees);
	assignmentTabContent.find("#assignmentDevEstimate").html(curAssignment.DevEstimate != null ? curAssignment.DevEstimate + " timer": "Ikke angivet");
	assignmentTabContent.find("#assignmentTags").html(curAssignment.Tags != undefined ? curAssignment.Tags.replace(/,/g,', ') : "");
	assignmentTabContent.find("#assignmentDescription").html(curAssignment.Description);

	return assignmentTabContent;
}
*/

var assignmentRightClickMenu = {actions: [
	{title: "Set as current", onClick: function(a, r){
		request({module: "database", action: "custom", table: "AssignmentTable", custom: {action: "SetDefault", AssignmentNum: r.AssignmentNum}}, function(data){
			new Notifier().show(r.AssignmentNum + " is now your default issue");
		});
	}},
	{title: "Approve/reject", onClick: function(a, r, callback){
		showAssignmentApprovalPrompt(r.AssignmentNum, callback);
	}},
	{title: "Assignees", onClick: function(a, r, callback){
		showAssignmentAssignPrompt(r.AssignmentNum, callback);
	}},
	{title: "Estimate", onClick: function(a, r, callback){
		showAssignmentEstimatePrompt(r.AssignmentNum, callback);
	}},
	{title: "Move to another project", onClick: function(a, r, callback){
		showIssueMoveToProjectPrompt(r.AssignmentNum, callback);
	}}
	/*
	{title: "pop-out", onClick: function(a, r, callback){
		var myWindow = window.open("", "", "width=700, height=400");
		$(myWindow.document.body).append(createAssignmentText(r));
		callback();
	}}
	*/
]};