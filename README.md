meier.js
========

After copy-pasting my own code around so many times, it seemed prudent to derive a library *of sorts*. I use this codebase to quickly hack an experiment together. I consider it to be the equivalent of a notepad.



Structure
=========

**/examples/**
*<br>Contains typical usage examples:*
<br> online demo: [Classic Flocking Behaviours](http://gerardmeier.com/flocking-behaviour);
<br> online demo: [Color Similarity Heatmap](http://gerardmeier.com/skin-detection);
<br> online demo: [Curve Smoothing](http://gerardmeier.com/moving-least-squares);
<br> online demo: [Voronoi diagrams](http://gerardmeier.com/play/cluster-detection/);
<br> online demo: [Neural networks](http://gerardmeier.com/play/neural-network-classification/);
<br> online demo: [Polynomials](http://gerardmeier.com/play/curve-fitting/);
<br> online demo: [Vollyball Game ] (http://gerardmeier.com/volleyball);
<br> many more at: [http://gerardmeier.com/lab/](http://gerardmeier.com/lab/).



**/src/engine/** 
<br>*An actual engine, of sorts. Ties a few components together.*

**/src/prefab/** 
<br>*Some useful pre-made entities. Components frequently used, but not part of the core*

**/src/math/**
<br>*Math oriented features.*

**/src/collections/**
<br>*Several datastructures.*

**/src/aux/**
<br>*Optional files. You won't need them, I do.*

**/src/contrib/**
<br>*Code sourced from open source projects. Each file contains more details about its origin.*



Work in progress
==========
**Texture transformations**
<br> Textures are commonly manipulated by the following operations: _resize_, _translate_, _skew_, _clip_, _rotate_. The current implementation doesn't support everything yet, nor is it very structured. Mostlikely an optional 3 by 3 matrix will be introduced to allow for most transformations. A matrix also works tightly with the scheduled Web GL renderer.

**Physics**
<br>Extend the entity with physics and refined collision shapes - or defer to, say, box2D. (will never happen)

**Audio**
<br>IE and iPad support are lacking. Also "audio sprites" must be implemented. 

**Muli-touch controls**
<br>This API has yet to be exposed. I have plans.

**Threading**
<br>This API has yet to be exposed. I have plans.

**Web Sockets**
<br>The client side is easy, but further study needs to be done for a generic server implementation, e.g., a server that simply forwards all messages to all clients is open for abuse - some form of authentication needs to be performed.

License
==========

Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>

N.B. I cannot quite agree with any pre-made license thus far - until I figure this out, a default copyright is to be assumed. Most code is very poorly structured, so I can imagine as a whole this project has little use. I certainly don't use it for production code.
