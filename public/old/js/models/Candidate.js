var Candidate = Backbone.Model.extend({
    //urlRoot: '/api/registrant',
    idAttribute: "id",
    url: "/api/candidate/",
    set: function(attributes, options) {
        var ret = Backbone.Model.prototype.set.call(this, attributes, options);
        this.votes = nestCollection(this, 'votes', new Votes(this.get('votes')));
        return ret;
    }
});
