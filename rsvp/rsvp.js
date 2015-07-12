// Let's have a BAREBONE.JS Party!!
// Here's a barebone implementation of an RSVP application to track attendees...

// Create `Guest` Model.
// Set default `attending` property to false. This will be toggled on click of the attendee's `name`.
var Guest = BAREBONE.Model.extend({
  defaults: {
    attending: false
  }
});

// Instantiate instances of `Guest` Model.
// Who invited these two nerds...?
var katrina = new Guest({
  name: 'Katrina Uychaco'
});
var kalev = new Guest({
  name: 'Kalev Roomann-Kurrik'
});

// Instantiate `guests` Collection array with our two current guests.
var guests = new BAREBONE.Collection([katrina, kalev]);

// Handle adding a new `Guest` model to the `guests` collection via UI form input. 
$('form').on('submit', function(event) {
  event.preventDefault();
  guests.add(new Guest({name: $('#name').val()}));
  $('#name').val('');
});

// Create `ListView`, which has subviews of `ListEntryView`.
// This will be instantiated with the `guests` collection.
var ListView = BAREBONE.View.extend({
  // Let's put our attendies in an unordred list.
  tagName: 'ul',
  // This method gets invoked upon instantiation of `ListView`.
  initialize: function() {
    // Perform initial rendering of view.
    this.render();
    // When a new `Guest` model is added, re-render view.
    this.collection.on('add', this.render, this);
    // When there is a change on a model property (such as `attending` being set to `true`), update the attendee count and re-render `ListView`.
    this.collection.on('change', function() {
      var attendeeList = this.collection.filter(function(guest) {
        return guest.attributes.attending === true;
      });
      $('#count').text(attendeeList.length);
      this.render();
    }, this);
  },
  // Define render method, which maps over the `guests` collection and instantiates and renders a `ListEntryView` for each `guest` model.
  render: function() {
    var names = this.collection.map(function(guest) {
      return new ListEntryView({model: guest}).render();
    });
    this.$el.html(names).appendTo('#guestList');
  }
});

// Create `ListEntryView`, which is a subview of `ListView`.
// There will be one instantiated per guest model in the `guests` collection associated with `ListView`.
var ListEntryView = BAREBONE.View.extend({
  // Each guest will be an item in a list.
  tagName: 'li',
  // Use Underscore's template function to fill in correct name for a given guest model and add a checkmark if the guest's `attending` property is set to `true`.
  template: _.template('<%- name %> <% if (attending) { %> <img src="checkmark.png"/> <% } %>'),
  // Listen for DOM `click` event and change `attending` property on model accordingly.
  events: {
    'click': function(event) {
      this.model.set('attending', !this.model.get('attending')); 
    }
  },
  // Define render method, which returns HTML for a given guest.
  render: function() {
    return this.$el.html(this.template(this.model.attributes));
  }
});

// START THE PARTAAYYY!!
// Instantiate `ListView` with the `guests` collection and get your BAREBONE.JS party started ^_^
new ListView({collection: guests});