
# onepage

Onepage scroll webpage in component, inspired by Apple iPhone-5c page.

## Installation

Install with [component(1)](http://component.io):

    $ component install lepture/onepage

## API

```js
var Onepage = require('onepage')
var onepage = new Onepage(document.getElementById('container'));
```

`Onepage` accepts two parameters: `element` and `options`. The given
element is the father node of each page. For example:

```html
<div class="container">
  <div class="page"></div>
  <div class="page"></div>
  <div class="page"></div>
</div>
```

`div.container` is a good element, and every `div.page` will be one page.

### options

You can control the animation by options.

- duration: transform duration for scrolling, default is 800.
- timingFunction: function for transform, default is ease.
- wheelDelta: min wheelDelta value for scrolling, default is 100.

### events

Onepage can trigger events. You can subscribe an event by:

```js
onepage.on('move', function(page) {
  console.log(page);
});
```

- move: when page moves
- end: when animation end

### .move(page)

Move the the given page number. Page begin with 0.

```js
onepage.move(2)
// move to the 3rd page.
```

## License

MIT
