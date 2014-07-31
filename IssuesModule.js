var IssuesModule = function () {
};

IssuesModule.prototype.init = function(fw, onFinished) {
    this.fw = fw;
	onFinished.call(this);
}

IssuesModule.prototype.onMessage = function (req, callback) {
};
 
module.exports = IssuesModule;