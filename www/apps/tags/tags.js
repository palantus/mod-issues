function loadModule_Tags(){
	var tc = {
				type: "TableCreator",
				typeId: "Tags",
				linesPerPage: 15,
				//clickable: true,
				columns: [
					{title: "Tag", dataKey: "Tag"}, 
					{title: "Hide", dataKey: "HideDisplay", width: "40px"}
				],
				dataSource: function(callback, query){
					request({module: "database", action: "query", table: "Tags", query: query}, callback);
				},
				/*onClick: function(row){
					showProject(row.ProjectType, row.ProjectRefId);
				},*/
				createRecord: {
					fields: [
								{name: "Tag", title: "Tag: "},
								{name: "Hide", title: "Hide: ", type: "checkbox"}
							],
					validate: function(record){return record.Tag == "" ? "Please fill out Tag" :  record.Tag.indexOf(',') >= 0 ? "Tags cannot contain a comma" : true;},
					onCreate: function(record, callback){
						record.HideInGrids = record.Hide ? 1 : 0;
						request({module: "database", action: "insert", table: "Tags", record: record}, callback);
					}
				},
				editRecord: {
					fields: [
								{name: "HideInGrids", title: "Hide:", type: "checkbox"}
							],
					onEdit: function(oldRecord, newRecord, callback){
						newRecord.HideInGrids = newRecord.HideInGrids ? 1 : 0;
						request({module: "database", action: "update", table: "Tags", oldRecord: oldRecord, newRecord: newRecord}, callback);
					}
				},
				deleteRecord: {
					onDelete: function(record, callback){
						request({module: "database", action: "delete", table: "Tags", record: record}, callback);
					}
				}
			};

	return {
		title: "Tags", 
		requireLoggedIn: true,
		icon: "/img/tag.png",
		popup: {
			title: "Tags",
			typeId: "TagList",
			style: {"width": "400px", height: "400px"},
			onShow: function(){
				if(!window.isMobile()) 
					this.element.find(".sbbar").focus();
			},
			content: [
						{type: "SearchBar", delayedSearch: 100, onSearch: function(query){this.popupCreator.contentObjects[1].reloadData(query);}}, 
						tc
					 ]
		}
	};
}