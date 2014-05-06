Voting.module('Public', function(Public, App, Backbone, Marionette, $, _) {

  // Public Router
  // ---------------
  //
  // Handle routes to show the active vs complete todo items

  Public.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'start': 'start',
      'logout': 'logout'
    }
  });

  // Public Controller (Mediator)
  // ------------------------------
  //
  // Control the workflow and logic that exists at the application
  // level, above the implementation detail of views and models

  Public.Controller = function() {};

  _.extend(Public.Controller.prototype, {

    // Start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    start: function() {
      App.voter = new App.Models.Voter();
      var options = {login: true};
      this.appBody = new App.Layout.Body(options);
      App.body.show(this.appBody);
      this.showPublic();
    },

    showHeader: function(options) {
      options = options || {};
      var header = new App.Layout.Header(options);
      this.appBody.header.show(header);
      this.appBody.header.$el.show();
    },

    showFooter: function() {
      var footer = new App.Layout.Footer();
      this.appBody.footer.show(footer);
      this.appBody.footer.$el.show();
    },

    showPublic: function() {
      var view = new Public.Views.PublicView();
      this.appBody.login.show(view);
      this.appBody.login.$el.show();
    },

    logout: function() {
        App.voter.destroy();
        Backbone.history.navigate("start", { trigger: true });
    }

  });

  // Public Initializer
  // --------------------
  //
  // Get the Public up and running by initializing the mediator
  // when the the application is started.

  Public.addInitializer(function() {

    var controller = new Public.Controller();
    new Public.Router({
      controller: controller
    });

  });

});
