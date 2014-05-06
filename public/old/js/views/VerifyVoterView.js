var VerifyVoterView = Backbone.View.extend({
    events: {
        "click .verify-btn"         :   "verify",
        "keypress #scan"            :   "verifyOnEnter"
    },

    initialize: function() {
        _.bindAll(this, 'render', 'unrender', "verify", "verifyOnEnter");

        //this.registrantsView = new RegistrantsView({parent: this});
        //this.timelineView = new TimelineView({parent: this});

    },

    render: function() {
        var source = Templates.verifyVoter,
            template = Handlebars.compile(source),
            html = template(),
            view = this;

        this.$el.html(html);
        $('#app').append(this.el);
        $('#scan', this.$el).focus();
        return this;

    },


    verify: function(e) {
        e.preventDefault();
        var scan = $("#scan", this.$el).val();
        //App.Models.registrants.fetch({ data: { category: category, term: term } });
        App.Router.navigate("offices", true);
    },

    verifyOnEnter: function(e) {
        if (e.keyCode != 13) return;
        this.verify(e);
    },

    unrender: function () {

        console.log('Kill: ', this.cid);

        this.trigger('close:all');
        this.unbind(); // Unbind all local event bindings
        //this.model.unbind( 'change', this.render, this ); // Unbind reference to the model
        //this.options.parent.unbind( 'close:all', this.close, this ); // Unbind reference to the parent view

        this.remove(); // Remove view from DOM

        delete this.$el; // Delete the jQuery wrapped object variable
        delete this.el; // Delete the variable reference to this node

    }

});
