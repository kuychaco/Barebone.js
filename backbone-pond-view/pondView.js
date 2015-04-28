var PondView = Barebone.View.extend({

  // display table row for each item
  tagName: 'table',//???

  template: _.template('<tr> <td> <%- name %> </td> <td> <img src="<%- image %>"/> </td> </tr>'),  // input - html string, output - function that takes an object w/ properties that we have access to 

  // when do we render
  // model events go here
  initialize: function() {
    this.render();
    // on name change, re-render
    this.collection.on('change', function(fish) {
      console.log(fish.name);
      console.log(this);
      this.render();
    }, this);
  },

  // dom events go here
  // "controller" - turns user behavior into intent
  events: {
    'click': function(event) {
      console.log(this);
      $(event.target).css('border', 'medium solid green');
    }
  },

  // how do we render
  render: function() {
    var context = this;
    this.$el.html('');
    // call this.template for each fish in collection - each or map
    this.collection.each(function(fish) {
    // append returned html tr to this.$el
      context.$el.append(context.template(fish.attributes));
    });
    // append this.$el to body
    this.$el.appendTo('body');
  }

});