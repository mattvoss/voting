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
