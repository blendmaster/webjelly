# Web G-ell-y

`webjelly` dynamically renders 3d models from a simple input
format, allowing rotation, zooming, and shading mode switching. `webjelly`
should run on all modern browsers with WebGL enabled.

This is Steven Ruppert's Project 2 for the fall 2012 **CSCI441 Computer
Graphics** class at the Colorado School of Mines.

# Viewing Models

`webjelly` runs in any modern web browser with WebGL support. It was tested on
Firefox 16 and Chrome 22, but Firefox >=4, Chrome >18 or so, and even Opera
>=12 will work. No Internet Explorer. If you don't have a very good graphics
card or you're not running regular drivers, WebGL may be disabled even though
the browser supports it. Try googling around to figure out how to force enable
it.

Open `index.html` in your chosen browser, or browse to the [hosted version][]
and open a file in the format:

```
{# of triangles} {# of vertices}
{triangles, by indices of the vertices...}
{vertices, 3 coordinates each...}
```

Then, use the mouse to rotate the model around in the viewport. You can mess
with the buttons above the canvas too.

[hosted version]: http://blendmaster.github.com/webjelly
