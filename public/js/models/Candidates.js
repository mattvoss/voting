var Candidates = Backbone.Collection.extend({
    model: Candidate,
    idAttribute: "id",
    url: "/api/candiates/"
});
