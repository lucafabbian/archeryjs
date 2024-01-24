# archeryjs
*A tiny framework for making webapps with simple templates + tailwindcss without a build step!*

`archeryjs` lets you annotate your html with styles and simple macros, in order to make it reactive with little effort. With `archeryjs` you may build your webpage in a matter of seconds, and the result is easier to understand to people who lacks experience with modern web building.

`archeryjs` is also very lightweigh, only ~14kb after minification. It's mainly based on the powerful [arrow-js](https://www.arrow-js.com/) JavaScript framework and the [RunCSS](https://github.com/mudgen/runcss) engine for evaluating Tailwind on the fly.


## Quick start
Add to `<head>`:
```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/archeryjs/dist/archery.min.css">
  <script src="https://cdn.jsdelivr.net/npm/archeryjs/dist/archery.min.js" mount></script>
```
Done!

If you wish, you may remove the `mount` specifier and initialize `archeryjs` manually by calling the `mountApp()` function at the end of your JavaScript code.

Let's say you want to create a counter with two buttons to increment and decrement it. You can do it with:

```html
<script>
  window.store = reactive({ count: 50 })
</script>

<div class="text-xl m-10">
  <button @click="{{store.count--}}" class="bg-red-500 p-2 text-white">-</button>
  {{store.count}}
  <button @click="{{store.count++}}" class="bg-red-500 p-2 text-white">+</button>
</div>
```
Check `examples/index.html` for a full example.

## Usage

### Tailwind styles
`archeryjs` lets you use the [Tailwind framework](https://tailwindcss.com/docs/utility-first) to style your html. For example:
```html
<p class="text-red-600 font-bold hover:text-red-400">My red text</p>
```

Those shortcuts are very useful, especially while dealing with status such as `hover`.


### Templates

`archeryjs` lets you add some annotations to your html, such as:
- `{{someVariable}}`: this will be avaluated to the value of that variable
- `{#if myVariable == 'hello world'} <p>html</p> {/if}`: add an if to your html
- `{#for elem of array} <p>{{elem}}</p> {/for}`: add a for loop
- listeners like `@click={{console.log("hello!")}}` to add event listeners

Note: you may use `\{` and `\}` to escape {} inside your html templates

### Reactive stores

What if you want to automatically update your html to match the content of a variable?
This is possible thanks to reactive stores.
```js
window.store = reactive({
  variable: 'hello world',
})
```
Then, you can just reference it in the html:
```html
<p>{{store.variable}}</p>
```
Now, every time you do `store.variable = 'new value'`, the html will be updated automagically.


If you wish, you may save a store to the persistent browser data, so it will persist even when the users close their devices. In order to do that, you need to assign each store an unique id, so it could be loaded at the next reload:
```js
window.store2 = persistent('uniqueId', {
  persistentVar: 'value',
})
```

For advanced usage, such as watching data, check the guide on [arrow-js](https://www.arrow-js.com/docs/#watching-data)

### Router
If you want to develop a webpage with many subpages, you can do it thanks to [hash based routing](https://upmostly.com/tutorials/what-is-hash-routing). `archeryjs` as an utility to help you achieve that:
```html
<script>
  window.routes = router({
    home: '/',
    subpages: '/subpage/:subpageParam'
  })
</script>

<nav class="w-full p-5 mb-10 bg-slate-300 space-x-4">
  <a href="#/">Home</a>
  <a href="#/subpage/1">Subpage1</a>
  <a href="#/subpage/2">Subpage2</a>
  <a href="#/subpage/3">Subpage3</a>
</nav>

<div class="m-5">
{#if routes.page == 'home'} You are on the home page! {/if}
{#if routes.page == 'subpages'} You are on the subpage {{routes.args.subpageParam}} {/if}

{#if routes.page == ''} Page not found! {/if}
</div>

```
For advanced usage and patterns, check the [regexparam](https://github.com/lukeed/regexparam) library guide.

That's all! Have fun!

## Authors and License

Main developer: <luca.fabbian.1999@gmail.com>

Distributed under MIT License