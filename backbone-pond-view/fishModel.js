var Fish = Barebone.Model.extend({
  defaults: {
    name: "Larry",
    image: "http://www.google.com"
  },
  initialize: function() {
    this.on('change', function(fish) {
      console.log('hello from Model', fish);
    });
  }
});

