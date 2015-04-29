var PondView = BAREBONE.View.extend({

  tagName: 'table',

  template: _.template('<tr> <td> <%- name %> </td> <td> <img src="<%- image %>"/> </td> </tr>'), 

  initialize: function() {
    this.render();
    this.collection.on('change', this.render, this);
  },

  events: {
    'click img': function(event) {
      $(event.target).css('border', 'medium solid red');
    }
  },

  render: function() {
    var context = this;
    this.$el.html(this.collection.map(function(fish) {
      return context.template(fish.attributes);
    })).appendTo('body');
  }

});