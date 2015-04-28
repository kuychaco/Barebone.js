(function() {

var Barebone = {};

Barebone.$ = $;


/*
BAREBONE EVENTS 
A module that can be added to any object, giving it the ability to bind and trigger custom named events. Events may take passed arguments.
*/

var Events = Barebone.Events = {

  // bind an event to a callback function
  on: function(name, callback, context) {
    this._events || (this._events = {});  // why not this._events = this._events || {};
    actions = this._events[name] || (this._events[name] = []);
    actions.push({callback: callback, context: context, ctx: context || this});  // DISSONANCE: why separate context and ctx properties?
    return this;
  },

  // trigger an event, firing all bound callbacks. 
  // callbacks are passed the same arguments as trigger
  trigger: function(name) {
    if (!this._events) return this;
    var args = Array.prototype.slice.call(arguments, 1);
    var actions = this._events[name] || [];
    _.each(actions, function(action) {
      action.callback.apply(action.ctx, args);
    });
    return this;
  }
};

// allow the Barebone object to serve as a global event bus
_.extend(Barebone, Events);



/*
BAREBONE MODELS
The basic data object in the framework - frequently representing a row in a databse on your server. A discrete chunk of data and a logic surrouding it.
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

    var attrs, attr, current, prev, changes, options;

    // handle two input type - object or string
    if (key == null) return this;   // null == undefined
    if (typeof key === 'object') {
      attrs = key;
      // options = val;
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
      // debugger;
      current[attr] = attrs[attr];
    }

    // trigger all relevant attribute changes
    this.trigger('change', this);
    return this;
  }
});

// Mix in Underscore methods and implement on the Model
var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'chain', 'isEmpty'];
_.each(modelMethods, function(method) {
  // TODO
});




/*
BAREBONE COLLECTIONS
Ordered sets of models 
If models tend to represent a single row of data, a collection is analogous to a table full of data, or a group of rows
Any event triggered on a model in a collection will also be triggered on the collection directly
*/

// create a new collection
var Collection = Barebone.Collection = function(models, options) {
  // options || (options = {});
  // if (options.model) this.model = options.model;
  this.length = 0;
  this.models = [];
  // invoke initialize
  this.initialize.apply(this, arguments);
  if (models) this.set(models);
};

// Define Collection's inheritable methods
_.extend(Collection.prototype, Events, {
  model: Model,
  initialize: function() {},
  add: function(models) {
    return this.set(models);
  },
  set: function(models) {
    // check if it's a single model
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();

    // for each model - assume all are new, no duplicates!!
    var that = this;
    _.each(models, function(model) {
      that.length++;
      that.models.push(model);
      model.on('change', function(model) {
        that.trigger('change', model);
      });
    });

    return singular ? models[0] : models;
  }
});

// add underscore methods
var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
  'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
  'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];

_.each(methods, function(method) {
  if (!_[method]) return;
  Collection.prototype[method] = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.models);
    return _[method].apply(_, args);
  };
});



/*
BAREBONE VIEW
Provide convention to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the whole page.
You no longer need to dig into a JSON object, look up an element on the DOM, and manually update the HTML. Simply bind your view's render function to the model's change event
*/

var View = Barebone.View = function(options) {
  this.cid = _.uniqueId('view');
  options || (options = {});
  _.extend(this, _.pick(options, viewOptions), _.pick(options, extraOptions));  // _.pick returns a copy of the object, filtered to only have values for whitelisted keys
  console.log(_.pick(options, viewOptions));
  // debugger;
  this._ensureElement();
  debugger;
  this.initialize.apply(this, arguments);
  this.autoRender && this.render.apply(this);
};

var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
var extraOptions = ['autoRender', 'autoRerender'];

// add inheritable properties and methods
_.extend(View.prototype, Events, {

  tagName: 'div',
  
  // jQuery delegate for element lookup, scoped to DOM elements within current view
  $: function(selector) {
    return this.$el.find(selector);
  },

  initialize: function() {},

  // override with custom render function to populate element this.el
  render: function() {
    return this;
  },

  // ensure that the View has a DOM element to render into
  _ensureElement: function() {
    // if this.el doesn't exist, create an element from id, className, and tagName
    if (!this.el) {
      var attrs = _.extend({}, _.result(this, 'attributes'));  // _.result accesses value of named property, invokes if function
      if (this.id) attr.id = _.result(this, 'id');
      if (this.className) attrs['class'] = _.result(this, 'className');  // DISSONANCE: why bracket notation??
      this._setElement(this._createElement(_.result(this, 'tagName')));
      this._setAttributes(attrs);
    } else {
      this._setElement(_.result(this, 'el'));  
    }
  },

  _createElement: function(tagName) {
    return document.createElement(tagName);
  },

  // create this.el and this.$el references
  _setElement: function(el) {
    this.$el = el instanceof Barebone.$ ? el : Barebone.$(el);
    this.el = this.$el[0];
  },

  _setAttributes: function(attrs) {
    this.$el.attr(attrs);
  }


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
Model.extend = Collection.extend = View.extend = extend;

window.Barebone = Barebone;
})();