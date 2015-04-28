var Barebone = {};



/*
Barebone Events is a module that can be added to any object, giving it the ability to bind and trigger custom named events. Events may take passed arguments.
*/

var Events = Barebone.Events = {
  on: function(name, callback, context) {
    this._events || (this._events = {});  // why not this._events = this._events || {};
    actions = this._events[name] || (this._events[name] = []);
    actions.push({callback: callback, context: context, ctx: context || this});  // DISSONANCE: why separate context and ctx properties?
    return this;
  },
  trigger: function(name) {
    var params = Array.prototype.slice.call(arguments, 1);
    actions = this._events[name] || [];
    _.each(actions, function(action) {
      action.apply(this, params);
    });
  }
};


/*
Barebone Models are the basic data object in the framework - frequently representing a row in a databse on your server. A discrete chunk of data and a logic surrouding it.
*/



// Model provides a basic set of functionality for managing changes
// Create a new model with the specified attributes
var Model = Barebone.Model = function(attributes) {
  
  // attach attributes (initial values) and defaults to model
  var attrs = attributes || {};
  attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
  
  // TODO: why does backbone have this? --> set attributes using SET to trigger events
  this.attributes = {}
  this.set(attrs);
  
  // create unique ID
  this.cid = _.uniqueId('c');

  // track what has changed
  this.changed = {};
  
  // invoke initialize
  this.initialize.apply(this, arguments); // first parameter for initialize will be attributes object

};

// Extend Model to add all inheritable methods to the Model prototype
  // Events module so that model can bind and trigger events
  // Domain-specific methods
_.extend(Model.prototype, Events, {
  
  // a hash of attributes whose current and previous values differ
  changed: null,

  // Override with initialization logic. Empty function by default.
  initialize: function() {},

  // get the value of an attribute
  get: function(attr) {
    return this.attributes[attr];
  },

  // return true/false for if attribute has a value that is null or undefined
  has: function(attr) {
    return this.get(attr) != null;  // null == undefined
  },
  set: function(key, val) {
    // check if key already has value

    var attrs, attr, current, prev, changes;

    // handle two input type - object or string
    if (key == null) return this;   // null == undefined
    if (typeof key === 'object') {
      attrs = key;
      // iterate through and add to this.attributes
    } else {
      (attrs = {})[key] = val;
    }

    // // DISSONANCE: backbone has this:
    // changing = this._changing;  // this will be undefined when model is instantiated
    // this._changing = true;  // UNCLEAR - what is this._changing doing??

    // // if this is the first time the model has been changed or if changing is false, reset changed to be empty object
    // if (!changing) {
    //   this._previousAttributes = _.clone(this.attributes);
    //   // DISSONANCE: this appears in Model, why have it here as well? Unnecessary duplicate... CONTRIBUTION??
    //   this.changed = {};  
    // }

    current = this.attributes;
    // prev = _.clone(this.attributes);
    // changes = [];

    // for each set attribute, update or delete the current value
    for (attr in attrs) {
      // // if attr different from current, add to changes array
      // if (!_.isEqual(current[attr], val)) { // _.isEqual does deep comparison
      //   changes.push(attr);
      // } 
      // // if attr is different from previous, add to changed array. if same, delete from changed array
      // if (!_.isEqual(prev[attr], val)) {
      //   this.changed[attr] = val;
      // } else {
      //   delete this.changed[attr];  // UNCLEAR: why? has to do with changing being true;
      // }
      current[attr] = val;
    }

    // trigger all relevant attribute changes
    this.trigger('change', this);
    return this;
  },
})

// Mix in Underscore methods and implement on the Model
var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'chain', 'isEmpty'];
_.each(modelMethods, function(method) {
  // TODO
});






/*
Helper functions to correctly set up prototype chain for subclasses
*/

// create constructor function for class of Model, Collection, View
// function returned creates children objects with prototype with protoProps on it
var extend = function(protoProps) {

  // invoke Barebone.Model
  var parent = this; // Barebone.Model or Barebone.View function
  var child = function() {
    return parent.apply(this, arguments); // pass arguments to Barebone.Model and invoke
  };

  // set up prototype chain to inherit from parent Model.prototype without calling parent's constructor function (no invoking parent)
  // DISSONANCE: "set up prototype chain to inherit from parent, without calling **parent's constructor function**" --> without calling parent, which is the constructor function, CONTRIBUTION?
  // create a surrogate which gets invoked instead

  // returns child.prototype object - w/ constructor property of child and prototype object matching parent prototype (Model.prototype)
  var Surrogate = function() { this.constructor = child; };   // BLOG POST!!! relationship between bb.Model, bb.extend and use of Surrogate func to set up prototype delegation
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  // decorate subclass (child.prototype) with prototype properties (instance properties)
  if (protoProps) _.extend(child.prototype, protoProps);

  // set a convenience property in case the parent's prototype is needed later
  child.__super__ = parent.prototype;

  return child;
}

// set up inheritance for the model, collection, and view
Model.extend = extend;