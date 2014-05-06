Voting.module('Public.Views', function(Views, App, Backbone, Marionette, $, _) {

  // Public View
  // --------------

  Views.AlertView = Marionette.ItemView.extend({
    template: Templates.alert,
    className: "alert alert-danger fade in",
  });

  Views.PublicView = Marionette.ItemView.extend({
      template: Templates.public,
      className: "row",
      events: {
        'keypress #registrantid'  :   'onInputKeypress',
        'click .next'             :   'logIn',
      },

      ui: {
        registrantid: '#registrantid'
      },

      initialize: function() {
        this.keyboardOpen = false;
      },

      onShow: function() {
        var view = this;
        this.ui.registrantid
        .keyboard({
            layout: 'custom',
            customLayout: {
             'default' : [
              'E G S {bksp}',
              '1 2 3',
              '4 5 6',
              '7 8 9',
              ' 0 ',
              '{accept} {cancel}'
             ]
            },
            openOn : null,
            stayOpen : true,
            css: {
              // input & preview
              input: '',
              // keyboard container
              container: 'center-block dropdown-menu', // jumbotron
              // default state
              buttonDefault: 'btn btn-default',
              // hovered button
              buttonHover: 'btn-primary',
              // Action keys (e.g. Accept, Cancel, Tab, etc);
              // this replaces "actionClass" option
              buttonAction: 'active',
              // used when disabling the decimal button {dec}
              // when a decimal exists in the input area
              buttonDisabled: 'disabled'
            }
        });

        $('.keyboard', this.$el).click(function(){
          if (view.keyboardOpen) {
            view.ui.registrantid.getkeyboard().close();
          } else {
            view.ui.registrantid.getkeyboard().reveal();
          }
          view.keyboardOpen = (view.keyboardOpen) ? false : true;
        });

        this.ui.registrantid.focus();
      },

      onInputKeypress: function(evt) {
        var ENTER_KEY = 13;

        if (evt.which === ENTER_KEY && this.ui.registrantid.val().length > 0) {
          evt.preventDefault();
          this.logIn(evt);
        }
      },

      showAlert: function(model) {
        var alert = new App.Public.Views.AlertView({model: model});
        $("#registrantid", this.$el).removeClass("alert-danger");
        $(".alert", this.$el).remove();
        alert.render();
        $("#"+model.get("error"), this.$el).addClass("alert-danger");
        $(alert.$el).insertBefore(".login-title", this.$el);
      },

      logIn: function(e) {
        var view = this,
            id = this.ui.registrantid.val().trim();
        if (id.indexOf("|") != -1) {
            id = id.split("|")[0];
        }
        App.voter.set({
          id: id
        });
        if (App.voter.isValid()) {
          App.voter.urlRoot = "/api/authenticate";

          App.voter.save(
            {},
            {
              success: function(model, response, options) {
                //App.login.$el.hide();
                App.voter.urlRoot = "/api/voter";
                Backbone.history.navigate("siteid", { trigger: true });
              },
              error: function(model, xhr, options) {
                var alertModel = new Backbone.Model({
                      'error': 'login',
                      'message': xhr.responseJSON.messsage.response
                    });
                alert = new App.Public.Views.AlertView({model: alertModel});
                $("#zipcode", view.$el).removeClass("alert-danger");
                $(".alert", view.$el).remove();
                alert.render();
                $(alert.$el).insertBefore(".login-title", this.$el);
                setTimeout(function(){
                  Backbone.history.navigate("start", { trigger: true });
                },10000);
              }
            }
          );
        } else {
          var model = new Backbone.Model(App.voter.validationError);
          this.showAlert(model);
        }
      },

      update: function() {

      }

  });

  // Application Event Handlers
  // --------------------------

});
