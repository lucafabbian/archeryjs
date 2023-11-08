import '../node_modules/runcss/dist/runcss.css' 
import { parse } from 'regexparam';

import { createApp as createVueApp, reactive, nextTick, watchEffect} from 'pico-vue'
import RunCSS, {extendRunCSS } from 'runcss'



const extractLiterals = (s :string) => {
  let result = ''

  const delimiters = '\'"`'.split('') // delimiters of string literals in js

  let currentDelimiter = ''
  let openBrackets = 0

  for(let i = 0; i < s.length -1; i++){
    const c = s.charAt(i)
    const nextC = s.charAt(i + 1)
    if(c === '\\'){
      i++;
      continue;
    }

    if(currentDelimiter === ''){
      if(openBrackets > 0 && c === '}'){
        currentDelimiter = '`';
        openBrackets-= 1;
        continue;
      }
      if(delimiters.includes(c)){
        currentDelimiter = c
      }
      continue;
    }

    if(currentDelimiter === '`' && c === '$' && nextC === '{'){
      currentDelimiter = ''
      openBrackets += 1
      continue
    }

    if(currentDelimiter === c){
        currentDelimiter = ''
        result+= ' '
        continue
    }

    result += c
  }
  console.log(result)
  return result
}



extendRunCSS(({states}) => {
  states.modifiers['onscreen'] = '.onscreen'
  console.log(states)
})


const execPath = (path, result)  => {
  let i=0, out={};
  let matches = result.pattern.exec(path);
  if(matches == null) return null
  while (i < result.keys.length) {
    out[ result.keys[i] ] = matches[++i] || null;
  }
  return out;
}



export const setupRouteStore = (routes : Record<string, string>) => {
  const store = reactive({
    page: '',
    args: {},
    update(){
      const currentLocation = location.hash.substring(1)
      const mappedRoutes = Object.fromEntries(Object.entries(routes).map( ([name, path]) => [name, parse(path)])) 
      for(let [page, route] of Object.entries(mappedRoutes)){
        const args = execPath(currentLocation, route)
        if(args != null){
          Object.assign(this, {
            page,
            args: {...args}
          })
          return
        }
      }
      Object.assign(this,{
        page: null,
        args: null
      })
    }
  })

  store.update()
  window.addEventListener('hashchange', () => store.update())

  return store
}


export const createApp = (initialData?: any, {
  runcssOptions = {},
  routes = window['routes'],
} = {}) => {

  if(window['store']){
    window['store'] = reactive(window['store'])
  }

  if(window['local']){
    const key = window['localkey'] ?? 'flyingjs-local'
    window['local'] = reactive({
      ...window['local'],
      ...JSON.parse(localStorage[key] || '{}')
    })

    watchEffect( () => {
      localStorage[key] = JSON.stringify(window['local'])
    })
  }

  const parsedRoutes = routes ? setupRouteStore(routes) : undefined

  const app = createVueApp({
    ...initialData,
    routes: parsedRoutes,
  })

  if(window['flyingPlugins']){
    for(const plugin of window['flyingPlugins']){
      const installFunction = (typeof plugin === 'object' && plugin.install) ? plugin.install : plugin
      installFunction({app, reactive, watchEffect, nextTick, extendRunCSS})
    }
  }





  const {processClasses} = RunCSS(runcssOptions)
  
  for(const element of document.querySelectorAll('*[class]')) {
    processClasses(element.getAttribute('class') ?? '')
  }

  for(const element of document.querySelectorAll('*[\\:class]')) {
    processClasses(extractLiterals(element.getAttribute(':class') ?? ''))
  }

  // Remove runcss-cloak attribute
  const hiddenNodes = document.querySelectorAll('*[runcss-cloak]')
  for(let node of hiddenNodes){
    node.removeAttribute('runcss-cloak')
  }


  return app

}

if(document.currentScript && document.currentScript.hasAttribute('load')) createApp().mount()


