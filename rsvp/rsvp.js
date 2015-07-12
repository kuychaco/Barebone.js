/* 
* @Author: Katrina Uychaco
* @Date:   2015-07-11 16:37:05
* @Last Modified by:   Katrina Uychaco
* @Last Modified time: 2015-07-11 18:05:16
*/

'use strict';

// Instantiate Model
var Guest = BAREBONE.Model.extend({
  defaults: {
    attending: false
  }
});

$('form').on('submit', function(event) {
  event.preventDefault();
  guests.add(new Guest({name: $('#name').val()}));
  $('#name').val('');
});

var katrina = new Guest({
  name: 'Katrina Uychaco'
});

var kalev = new Guest({
  name: 'Kalev Roomann-Kurrik'
});

// Instantiate Collection
var guests = new BAREBONE.Collection([katrina, kalev]);

// Instantiate View
var ListView = BAREBONE.View.extend({
  tagName: 'ul',
  initialize: function() {
    console.log('view initialized');
    this.render();
    this.collection.on('add', this.render, this);
    this.collection.on('change', function() {
      var attendeeList = this.collection.filter(function(guest) {
        return guest.attributes.attending === true;
      });
      $('#count').text(attendeeList.length);
    }, this);
  },
  render: function() {
    console.log('view render');
    var names = this.collection.map(function(person) {
      console.log(new ListEntryView({model: person}).render());
      return new ListEntryView({model: person}).render();
    });
    console.log(names);
    this.$el.html(names).appendTo('#guestList');
  }
});

var ListEntryView = BAREBONE.View.extend({
  tagName: 'li',
  template: _.template('<%- name %>'),
  events: {
    'click': function(event) {
      this.model.set('attending', !this.model.get('attending')); 
      if (this.model.get('attending')) {
        $(event.target).css('background-color', 'yellow');
      } else {
        $(event.target).css('background-color', 'transparent');
      }
    }
  },
  render: function() {
    return this.$el.html(this.template(this.model.attributes));
  }
});

var list = new ListView({collection: guests});