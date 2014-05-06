
/**
* js/models/Vote.js
*/

var Vote = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: "/api/candidate/vote/"
});



/**
* js/models/Votes.js
*/

var Votes = Backbone.Collection.extend({
    model: Vote,
    idAttribute: "id",
    urlRoot: "/api/candidate/votes/"
});



/**
* js/models/Candidate.js
*/

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



/**
* js/models/Candidates.js
*/

var Candidates = Backbone.Collection.extend({
    model: Candidate,
    idAttribute: "id",
    url: "/api/candiates/"
});



/**
* js/models/Office.js
*/

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



/**
* js/models/Offices.js
*/

var Offices = Backbone.Collection.extend({
    model: Office,
    idAttribute: "id",
    url: "/api/offices/"
});



/**
* js/views/OfficesView.js
*/

var OfficesView = Backbone.View.extend({
    events: {

    },

    initialize: function() {
        _.bindAll(this, 'fetch', 'render', 'unrender');

        //this.parent = opts.parent;
        this.collection.on('reset', this.render, this); // Event listener on collection
        //this.collection.on("sync", this.render, this);
        //Backbone.on("updateGrid", this.renderRow, this);

        //this.options.parent.on('close:all', this.unrender, this); // Event listener on parent

    },

    fetch: function(options) {
        this.collection.fetch();
    },

    render: function() {
        var source = Templates.offices,
            template = Handlebars.compile(source),
            html = template(),
            pagerSource = Templates.wizardPager,
            pagerTemplate = Handlebars.compile(pagerSource),
            pagerHtml = pagerTemplate(),
            view = this;

        this.$el.html(html);
        $('#app').append(this.el);
        _(this.collection.models).each(function(office) {
            $('#tabs', view.$el).append('<li><a href="#office'+office.get("id")+'" data-toggle="tab">'+office.get("title")+'</a></li>');
            $('#tab-content', view.$el).append('<div class="tab-pane" id="office'+office.get("id")+'"><h2>'+office.get("title")+'</h2></div>');
            var candidates = [];
            _(office.candidates.models).each(function(candidate) {
                var html = '<label class="radio"><input type="radio" name="off-can-'+office.get("id")+'" id="off-can-'+office.get("id")+'-'+candidate.get('id')+'" value="'+candidate.get('id')+'">'+candidate.get('name')+'</label>';
                $("#office"+office.get("id"), view.$el).append(html);
            });
        });
        $('#tab-content', view.$el).append(pagerHtml);
        $('#tabs', view.$el).hide();
        $('#rootwizard', this.$el).bootstrapWizard({
            onNext: function(tab, navigation, index) {
                console.log('next');
            },
            onTabShow: function(tab, navigation, index) {
                if (index == (view.collection.models.length -1)) {
                    $(".wizard li.next").hide();
                    $(".wizard li.last").toggleClass('disabled').show();
                }
            },
            onLast: function() {
                console.log("Review votes");
            }
        });

        return this;
    },

    unrender: function() {
        console.log('Kill: ', this.cid);

        this.trigger('close:all');
        this.unbind(); // Unbind all local event bindings
        //this.collection.unbind( 'change', this.render, this ); // Unbind reference to the model
        this.collection.unbind( 'reset', this.render, this ); // Unbind reference to the model
        this.collection.unbind( 'fetch', this.render, this ); // Unbind reference to the model
        //this.options.parent.unbind( 'close:all', this.close, this ); // Unbind reference to the parent view
        Backbone.off("updateGrid");

        this.remove(); // Remove view from DOM

        delete this.$el; // Delete the jQuery wrapped object variable
        delete this.el; // Delete the variable reference to this node
    }

});



/**
* js/views/VerifyVoterView.js
*/

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



/**
* js/views/AppView.js
*/

var AppView = Backbone.View.extend({

    events: {
        "click  #btn-home":            "home"
    },

    initialize: function() {
        _.bindAll(this, 'render', 'home');
    },

    render: function() {
         var source = Templates.header,
            template = Handlebars.compile(source),
            html = template();
         $('#header').html(html);
    },

    home: function(e) {
        e.preventDefault();
        App.Router.navigate("verifyVoter", true);
    }

});



/**
* js/router/Router.js
*/

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
        var view = this;
        App.Models.offices = new Offices();
        App.Models.offices.fetch({success: function(model, response, options) {
            var main = new OfficesView({ collection: App.Models.offices });
            view.setBody(main, true);
            view.view.body.render();
        }});

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



/**
* js/App.js
*/

var App = {

    initialize: function() {
        _.bindAll(this, "ioEvent");

        //Initialize Socket.IO
        this.Io = io.connect();
        // Listen for the talk event.
        this.Io.on('talk', this.ioEvent);

        //If Backbone sync gets an unauthorized header, it means the user's
        //session has expired, so send them back to the homepage
        var sync = Backbone.sync;
        Backbone.sync = function(method, model, options) {
            options.error = function(xhr, ajaxOptions, thrownError) {
                if (xhr.status == 401) {
                    window.location = '/';
                }
            }
            sync(method, model, options);
        };
        this.Models = {};
        this.Router = new Router();
        Backbone.history.start({pushState: true});
        //this.Models.events = new Events();
        //this.Models.events.fetch();
        var self = this;

    },

    ioEvent: function(data) {
        console.log(data);

        if (App.uid != data.uid) {
            if (data.objectType == "office") {
                var model = App.Models.offices.get(parseInt(data.objectId));
                if (model) {
                    if ("fetch" in model) {
                        model.fetch({success: function(model, response, options){
                            //Backbone.trigger("updateGrid", model);
                        }});
                    } else {
                        console.log("missing model:", data.objectId);
                    }
                } else {
                    console.log("missing model:", data.objectId);
                }

                //this.Models.registrants.unshift(data);
            }
        }
        /*
        if (data.type == "review-submitted") {
            var message = data.doc.versions[0].personnel[0].uinName + " was submitted for review.";
            $('.top-right').notify({ message: { text: message }, type: 'bangTidy', fadeOut: { enabled: true, delay: 8000 } }).show();
        }
        */

    }

};

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
  if (window.moment && context != null) {
    var f = block.hash.format || "MMM Do, YYYY";
    //return moment(context.replace("Z","")).format(f);
    return moment(context).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  };
});

// usage: {{fromNow date}}
Handlebars.registerHelper('fromNow', function(date) {
    return moment(date).fromNow();
});


// Comparison Helper for handlebars.js
// Pass in two values that you want and specify what the operator should be
// e.g. {{#compare val1 val2 operator="=="}}{{/compare}}

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('iter', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var ret = "";

    if(context && context.length > 0) {
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + fn(_.extend({}, context[i], { i: i, iPlus1: i + 1 }));
        }
    } else {
        ret = inverse(this);
    }
    return ret;
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


