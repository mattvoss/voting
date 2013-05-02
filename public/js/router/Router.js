var Router = Backbone.Router.extend({

    routes: {
        "":                                     "index",
        "offices":                              "offices",
        "verifyVoter":                          "verifyVoter"
    },

    views: {},

    initialize: function() {
        _.bindAll(this, 'index',  'offices', 'verifyVoter', 'setBody');

        //Create all the views, but don't render them on screen until needed
        this.views.app = new AppView({ el: $('body') });
        //this.views.tags = new TagsView();
        //this.views.account = new AccountView();

        //The "app view" is the layout, containing the header and footer, for the app
        //The body area is rendered by other views
        this.view = this.views.app;
        this.view.render();
        this.currentView = null;
    },

    index: function() {
        //if the user is logged in, show their documents, otherwise show the signup form
        this.navigate("verifyVoter", true);
        /**
        this.views.dash = new DashboardView();
        App.Io.emit('ready', {'user': App.uid});
        this.setBody(this.views.dash, true);
        this.view.body.render();
        **/
    },

    offices: function() {
        App.Models.offices = new Offices().get();
        var main = new OfficesView({ model: App.Models.offices });
        this.setBody(main, true);
        this.view.body.render();
    },

    verifyVoter: function() {
        var verifyVoter = new VerifyVoterView();
        App.Io.emit('ready', {'user': App.uid});
        this.setBody(verifyVoter, true);
        this.view.body.render();
    },

    setBody: function(view, auth) {
        /**
        if (auth == true && typeof App.user == 'undefined') {
            this.navigate("", true);
            return;
        }
        **/
        if (typeof this.view.body != 'undefined') {
            this.view.body.unrender();
        }
        App.CurrentView = view;
        this.view.body = view;
    }

});
