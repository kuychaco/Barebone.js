// # BAREBONE.JS
// A BAREBONE implementation of [Backbone.js](http://backbonejs.org/docs/backbone.html) (only about 120 lines of code). 

// Use this as a learning resource to:
// - Demystify MVC frameworks 
//   * Understand the magic under the hood
//   * See how the components work together
// - Review JavaScript fundamentals:
//   * this keyword
//   * scopes & closure
//   * event system
//   * instantiation
//   * subclassing

// Create a closure to avoid polluting the global scope by wrapping the framework in an IIFE.
(function() {

  // Create BAREBONE object namespace.
  var BAREBONE = {};

  // ## BAREBONE EVENTS 
  // Event system giving the ability to bind and trigger custom named events.
  // This module will be added to the prototype of BAREBONE.Model, BAREBONE.Collection, and BAREBONE.View.

  var Events = BAREBONE.Events = {

    // Method to bind an event to a callback function.
    on: function(name, callback, context) {
      this._events || (this._events = {}); 
      actions = this._events[name] || (this._events[name] = []); 
      actions.push({callback: callback, ctx: context || this}); 
      return this;
    },

    // Trigger an event, firing all bound callbacks. 
    // Callbacks are passed the same arguments that are passed to trigger.
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


  // ## BAREBONE MODELS
  // The basic data object in the framework - a discrete chunk of data and the logic surrouding it.
  // Model provides a basic set of functionality for managing changes.

  // Create a new model with the specified attributes.
  var Model = BAREBONE.Model = function(attributes) {
    
    // Attach `attributes` (initial values) and `defaults` to model.
    var attrs = attributes || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.attributes = {}
    this.set(attrs);

    // Invoke `initialize`. First parameter to initialize will be model's `attributes` object.
    this.initialize.apply(this, arguments); 
  };

  // Attach all inheritable methods to the Model prototype.
  // Add the Events module so that the model can bind and trigger events.
  // Add model-specific methods.
  _.extend(Model.prototype, Events, {
    
    // Override with initialization logic. Empty function by default.
    initialize: function() {},

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Set or update the value of an attribute. 
    set: function(key, val) {

      var attrs;

      if (key == null) return this; 

      // Input may be object or string. Create `attrs` object.
      if (typeof key === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      // Add or change attribute in `this.attributes` object.
      for (var attr in attrs) {
        this.attributes[attr] = attrs[attr];
      }

      // Trigger change event on object.
      this.trigger('change', this);
      return this;
    }
  });

  // Underscore methods to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'chain', 'isEmpty'];

  // Mix in Underscore methods as a proxy to the `model.attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // ## BAREBONE COLLECTIONS
  // Collections are ordered sets of models.
  // Any event triggered on a model in a collection will also be triggered on the collection directly.

  // Create a new collection.
  var Collection = BAREBONE.Collection = function(models) {
    // Keep track of `length` and `models` in collection.
    this.length = 0;
    this.models = [];
    // Invoke `initialize`. First argument to initialize will be models passed to Collection.
    this.initialize.apply(this, arguments);
    // Add models to `this.models` via the set method.
    if (models) this.set(models);
  };

  // Attach all inheritable methods to the Collection prototype.
  // Add the Events module so that the collection can bind and trigger events.
  // Add collection-specific methods.
  _.extend(Collection.prototype, Events, {

    // Override with initialization logic. Empty function by default.
    initialize: function() {},

    // Add a model or list of models to the set.
    add: function(models) {
      var added = this.set(models);
      this.trigger('add', models);
      return added;
    },

    // Update collection by setting models.
    set: function(models) {
      // Check if a single model is passed. Ensure `models` is an array.
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : models.slice();

      // Add each model to `models` array and increment `length`.
      // Trigger 'change' event on collection when a contained model triggers 'change' event.
      var context = this;
      _.each(models, function(model) {
        context.length++;
        context.models.push(model);
        model.on('change', function(model) {
          context.trigger('change', model);
        });
      });

      return singular ? models[0] : models;
    }
  });

  // Underscore methods to implement on the Collection:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];

  // Add Underscore methods as a proxy to `Collection.models`.
  _.each(methods, function(method) {
    if (!_[method]) return;
    Collection.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });




  // ## BAREBONE VIEW
  // Provide convention to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the whole page.
  // You no longer need to dig into a JSON object, look up an element on the DOM, and manually update the HTML. Simply bind your view's `render` function to the model's 'change' event.

  // Create a new View.
  var View = BAREBONE.View = function(options) {

    options || (options = {});

    // Decorate View with options provided.
    _.extend(this, _.pick(options, viewOptions));  

    // Ensure that the View has a DOM element to render into.
    this._ensureElement();

    // Invoke `initialize`. First argument to initialize will be options passed to View.
    this.initialize.apply(this, arguments);
  };

  // List of view options to be merged as properties:
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Cached regex to split keys for `delegate`:
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // Attach all inheritable methods to the View prototype.
  // Add the Events module so that the view can bind and trigger events.
  // Add view-specific methods.
  _.extend(View.prototype, Events, {

    // Default `tagName` of a View's element is 'div'.
    tagName: 'div',
    
    // jQuery delegate for element lookup, scoped to DOM elements within current view. Use this rather than global lookups.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Override with initialization logic. Empty function by default.
    initialize: function() {},

    // Override with custom render function to populate view's element (`this.el`) with appropriate HTML.
    render: function() {
      return this;
    },

    // Ensure that the View has a DOM element to render into. Invoke `_setElement` method to set `this.el` and `this.$el`.
    _ensureElement: function() {
      if (this.el) {
        this._setElement(_.result(this, 'el'));  
      } else {
        // If `this.el` doesn't exist, create an element from `id`, `className`, and `tagName` properties.
        var attrs = _.extend({}, _.result(this, 'attributes'));  
        if (this.id) attr.id = _.result(this, 'id');
        if (this.className) attrs.class = _.result(this, 'className');  
        this._setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      }
    },

    // Produce a DOM element to be assigned to the view.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Create `this.el` and `this.$el` references and delegate the view's events on the new element.
    _setElement: function(el) {
      this.$el = el instanceof $ ? el : $(el);
      this.el = this.$el[0];
      this.delegateEvents();
    },

    // Set attributes from a hash on the view's element.
    _setAttributes: function(attrs) {
      this.$el.attr(attrs);
    },

    // Iterate over events object {“event selector”: “callback”} and bind callbacks to the view.
    delegateEvents: function() {
      var events = _.result(this, 'events') || {};
      for (var key in events) {
        var method = events[key];
        // create array with DOM event and selector
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName, selector, listener);
    }

  });


  // ## HELPER FUNCTIONS

  // `extend` returns a subclass (ex: Guest class) with a prototype object that contains 
  // user-specified properties, which delegates to the Model class. 
  // This is how the `initialize` method passed to the BAREBONE.Model.extend function
  // masks the default empty `initialize` method stored on BAREBONE.Model.prototype.
  
  // Helper functions to correctly set up prototype chain for subclasses. Examples below are for BAREBONE.Model and a Fish Model class.
  var extend = function(protoProps) {

    // `this` is bound to a class, such as the BAREBONE.Model constructor function.
    var Parent = this; 
    // Constructor function for the new subclass (ex: Fish) to be returned. Simply calls the Parent's constructor (ex: BAREBONE.Model).
    var Child = function() {
      return Parent.apply(this, arguments); 
    };

    // Add static properties (those attached directly to the constructor function).
    _.extend(Child, Parent);

    // Set the prototype chain to inherit from `Parent` without calling the `Parent` constructor function.
    // The Child.prototype object (ex: Fish.prototype) delegates to the Parent.prototype (ex: Model.prototype).
    Child.prototype = Object.create(Parent.prototype);
    Child.prototype.constructor = Child;

    // Decorate subclass prototype (ex: Fish.prototype) with supplied prototype properties (instance properties).
    // Properties on Child.prototype will mask properties on Parent.prototype (such as the user-defined `initialize` method, or `tagName` on Views). 
    if (protoProps) _.extend(Child.prototype, protoProps);
    return Child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = View.extend = extend;

  // Attach BAREBONE library to window object, creating a closure.
  window.BAREBONE = BAREBONE;

})();





