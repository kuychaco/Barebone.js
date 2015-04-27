# Barebone.js #

<!-- 
> This material was originally posted [here](http://www.quora.com/What-is-Amazons-approach-to-product-development-and-product-management). It is reproduced here for posterities sake.

There is an approach called "working backwards" that is widely used at Amazon. They work backwards from the customer, rather than starting with an idea for a product and trying to bolt customers onto it. While working backwards can be applied to any specific product decision, using this approach is especially important when developing new products or features.

For new initiatives a product manager typically starts by writing an internal press release announcing the finished product. The target audience for the press release is the new/updated product's customers, which can be retail customers or internal users of a tool or technology. Internal press releases are centered around the customer problem, how current solutions (internal or external) fail, and how the new product will blow away existing solutions.

If the benefits listed don't sound very interesting or exciting to customers, then perhaps they're not (and shouldn't be built). Instead, the product manager should keep iterating on the press release until they've come up with benefits that actually sound like benefits. Iterating on a press release is a lot less expensive than iterating on the product itself (and quicker!).

If the press release is more than a page and a half, it is probably too long. Keep it simple. 3-4 sentences for most paragraphs. Cut out the fat. Don't make it into a spec. You can accompany the press release with a FAQ that answers all of the other business or execution questions so the press release can stay focused on what the customer gets. My rule of thumb is that if the press release is hard to write, then the product is probably going to suck. Keep working at it until the outline for each paragraph flows. 

Oh, and I also like to write press-releases in what I call "Oprah-speak" for mainstream consumer products. Imagine you're sitting on Oprah's couch and have just explained the product to her, and then you listen as she explains it to her audience. That's "Oprah-speak", not "Geek-speak".

Once the project moves into development, the press release can be used as a touchstone; a guiding light. The product team can ask themselves, "Are we building what is in the press release?" If they find they're spending time building things that aren't in the press release (overbuilding), they need to ask themselves why. This keeps product development focused on achieving the customer benefits and not building extraneous stuff that takes longer to build, takes resources to maintain, and doesn't provide real customer benefit (at least not enough to warrant inclusion in the press release).
 -->
 
## What is it? ##
  > A super barebone reimplementation of Backbone.js.

## What for? ##
  > A library inspired by Backbone.js for basic MV* app architecture that can also be used as an education resource for those who want to understand what's happening under the hood in Backbone.js

## Summary ##
  > Barebone.js gives structure to web applications by providing models with key-value binding, collections with a rich API of enumerable functions, and views with declarative event handling.  

* summary adapted from http://backbonejs.org/

## Problem ##
  > When working on a web application, you'll find that tying your data to the DOM could result in tangled piles of jQuery selectors and callbacks, all trying to keep the data in sync between the UI, your javascript logic, and database. For rich client-side apps, a more structured approach is often helpful.

## Solution ##
  > With Barebone.js, you represent your data as Models. Whenever a UI action causes an attribute of a model to change, the model triggers a 'change' event and all the Views listening to that model are notified of the change and can re-render accordingly. 
  > 
  > Barebone.js frees you from having to write the glue code that looks into the DOM to find an element with a specific id and update the DOM manually. When the data in a model changes, the view simply updates itself. 
  > 
  > Philosophically, Barebone.js is an attempt to discover the minimal set of data-structuring (models and collections) and user interface (views and URLs) primitives that are generally useful when building web applications with JavaScript. In an ecosystem where overarching, decides-everything-for-you frameworks are commonplace, and many libraries require your site to be reorganized to suit their look, feel, and default behavior, Barebone should continue to be a tool that gives you the freedom to design the full experience of your web application. 

## Quote from You ##
  > "MV* frameworks may seem like magic... in reality, under the hood it's all logic and you may be surprised at how much you can understand with relative ease based on your knowledge of JavaScript fundamentals."

## How to Get Started ##
  > Simply download the Barebone.js source code and include it in your app.

## Customer Quote ##
  > "Wow! I can see the light! The darkness in the black box of MV* frameworks is receding!"

## Closing and Call to Action ##
  > If you're curious to learn more and dive deeper into the guts of MV* frameworks, checkout the Backbone.js source code [here link](http://backbonejs.org/docs/backbone.html). 
