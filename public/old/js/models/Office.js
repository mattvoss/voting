var Office = Backbone.Model.extend({
    //urlRoot: '/api/registrant',
    idAttribute: "id",
    set: function(attributes, options) {
        var ret = Backbone.Model.prototype.set.call(this, attributes, options);
        this.candidates = nestCollection(this, 'candidates', new Candidates(this.get('candidates')));
        return ret;
    },
    url: "/api/office/"
});
