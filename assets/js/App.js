var Voting = new Backbone.Marionette.Application();

var ModalRegion = Backbone.Marionette.Region.extend({
  el: "#modal",

  constructor: function(){
    _.bindAll( this, "getEl", "showModal", "hideModal" );
    Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
    this.listenTo(this, "show", this.showModal, this);
  },

  getEl: function(selector){
    var $el = $(selector);
    $el.attr("class","modal fade");
    $el.on("hidden", this.close);
    return $el;
  },

  showModal: function(view){
    this.listenTo(view, "close", this.hideModal, this);
    this.$el.modal('show');
  },

  hideModal: function(){
    this.$el.modal('hide');
  }
});

Voting.addRegions({
  body: '#body'
});

Voting.on('initialize:before', function() {
  this.collections = {};
});

Voting.on('initialize:after', function() {
  this.currentView = null;
  this.review = false;
  Backbone.history.start({root: "/", pushState: true});
  if (typeof this.voter !== 'undefined' && "id" in this.voter) {
    Backbone.history.navigate("siteid", { trigger: true });
  } else {
    Backbone.history.navigate("start", { trigger: true });
  }
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
