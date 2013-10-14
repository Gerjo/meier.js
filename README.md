meier.js
========

After copy-pasting my own code around so many times, it seemed prudent to  derive a library *of sorts*.

Structure
=========

**/examples/**
*<br>Contains typical usage examples:*
<br> online demo: [Animation and textures](http://gerjo.github.io/meier.js/examples/helloworld/helloworld.html)
<br> online demo: [The coordinate system](http://gerjo.github.io/meier.js/examples/grid/grid.html)
<br> online demo: [Adriaan's peculiar game](http://gerjo.github.io/meier.js/examples/countermoon/game.html) [a <s>kidney</s> gunner that shoots pink bullets, wip]

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
** Texture transformations **
<br> Textures are commonly manipulated by the following operations: _resize_, _translate_, _skew_, _clip_, _rotate_. The current implementation doesn't support everything yet, nor is it very structured. Mostlikely an optional 3 by 3 matrix will be introduced to allow for most transformations. A matrix also works tightly with the scheduled Web GL renderer.

** Abstract game object **
<br>Useful for any engine is a game object that contains some commonly used logic. Probably introduce a collision shape, mass, drag, rotation and a position, to allow for rigid body physics.

**Audio**
<br>An efficient means to play short samples and background music.


**Web Sockets**
<br>The client side is easy, but further study needs to be done for a generic server implementation, e.g., a server that simply forwards all messages to all clients is open for abuse - some form of authentication needs to be performed.