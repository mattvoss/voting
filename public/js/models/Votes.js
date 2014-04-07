var Votes = Backbone.Collection.extend({
    model: Vote,
    idAttribute: "id",
    urlRoot: "/api/candidate/votes/"
});
