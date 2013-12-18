
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

- **duration**: transform duration for scrolling, default is `800`.
- **timingFunction**: function for transform, default is `ease`.
- **wheelDelta**: min wheelDelta value for scrolling, default is `100`.
- **pagination**: create pagination or not, default is `true`.
- **keyboard**: bind keyboard control or not, default is `true`.
- **loop**: loop control, default is `down`, other options are: `up` and `both`.

### events

Onepage can trigger events. You can subscribe an event by:

```js
onepage.on('move', function(page) {
  console.log(page);
});
```

- **move(page)**: when page moves
- **end(page)**: when animation end

You can subscribe events with: `on`, `once`. You can remove an event with
`off`.

Learn more about event emitter at [component/emitter](https://github.com/component/emitter).

### .move(page)

Move to the the given page number. Page begin with 0.

```js
onepage.move(2)
// move to the 3rd page.
```

### .page

Current active page number.

### .element

The container element.

### .pages

Array of pages in the container.

### .pagination

Pagination element.

### .transitioned

Last animation time.

## License

MIT
