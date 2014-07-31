var IssueManagement = function(){
	this.activeProject = null;
	this.session = {};
}

IssueManagement.prototype.init = function(){
	if(!isNaN($.cookie("StartProjectId")))
		setActiveProject($.cookie("StartProjectId"));

	this.refreshSession();

	new ActionLinkHandler().run(function(guid){
		request({module: "database", action: "custom", table: "ActionLinks", custom: {action: "HandleGUID", guid: guid}}, function(ret){
			if(ret.success === true)
				new Notifier().show("Action completed successfully");
			else
				new Notifier().show("Action failed");

		});
	});
}

IssueManagement.prototype.refreshSession = function(){
	var t = this;
	request({module: "user", type: "GetSession"}, function(session){
		if(session !== undefined)
			t.session = session;
	});
}


function showContent(type, refId){
	switch(type){
		case 10:
			showAssignment(refId);
			break;
		case 50:
			showCustomer(refId);
			break;
		case 53:
			showForumThread(refId);
			break;
		case 54:
			showDoc(refId);
			break;
	}
}

function setActiveProject(projectId){
	issueMan.activeProject = projectId;
	$.cookie("StartProjectId", projectId, { expires: 60 });
	_FrameworkRequestFixedArgs.ProjectId = projectId;
	request({module: "database", table: "Projects", action: "query", query: projectId}, function(res){
		if(res.length > 0)
			document.title = res[0].Title + " - Issue Management";
	});
}