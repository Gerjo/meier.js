meier.js
========

After copy-pasting my own code around so many times, it seemed prudent to  derive a library *of sorts*.




Structure
=========

**/examples/**
*<br>Contains typical usage examples:*
<br> online demo: [Animation and textures](http://gerjo.github.io/meier.js/examples/helloworld/helloworld.html);
<br> online demo: [The coordinate system](http://gerjo.github.io/meier.js/examples/grid/grid.html);
<br> online demo: [Audio](http://gerjo.github.io/meier.js/examples/audio/audio.html) [wip];
<br> online demo: [Entities](http://gerjo.github.io/meier.js/examples/entities/entities.html) [the build-in entity system];
<br> online demo: [Adriaan's peculiar game](http://gerjo.github.io/meier.js/examples/countermoon/game.html) [wip].

**/src/engine/** 
<br>*An actual engine, of sorts. Ties a few components together.*

**/src/math/**
<br>*Math oriented features.*

**/src/aux/**
<br>*Optional files. You won't need them, I do.*

**/src/contrib/**
<br>*Code sourced from open source projects. Each file contains more details about its origin.*



Work in progress
==========
**Texture transformations**
<br> Textures are commonly manipulated by the following operations: _resize_, _translate_, _skew_, _clip_, _rotate_. The current implementation doesn't support everything yet, nor is it very structured. Mostlikely an optional 3 by 3 matrix will be introduced to allow for most transformations. A matrix also works tightly with the scheduled Web GL renderer.

**Physics**
<br>Extend the entity with physics and refined collision shapes - or defer to, say, box2D.

**Audio**
<br>More thorough testing and iPad support. It runs fine in Firefox and webkit derivatives.

**Crossplatform testing**
<br>This lot has never been tested in IE.

**Muli-touch controls**
<br>This API has yet to be exposed.

**Web Sockets**
<br>The client side is easy, but further study needs to be done for a generic server implementation, e.g., a server that simply forwards all messages to all clients is open for abuse - some form of authentication needs to be performed.
