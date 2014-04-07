var Offices = Backbone.Collection.extend({
    model: Office,
    idAttribute: "id",
    url: "/api/offices/"
});
