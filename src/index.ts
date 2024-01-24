import '../node_modules/runcss/dist/runcss.css' 
import { parse } from 'regexparam';
import { reactive, html, watch } from '@arrow-js/core';
import RunCSS from 'runcss'

/** Create a reactive store that is synced to the browser
 * persistent localStorage.  */
const persistent = (key : string, obj: Record<string, any>) => {
  const store = reactive({
    ...obj,
    ...JSON.parse(localStorage[key] ?? '{}')
  })

  watch( () => localStorage[key] = JSON.stringify(store))
  return store
}


/** Utility to exec regexs and get the results */
const execRegexResult = (path: string, result: any) => {
  let i = 0,
    out: Record<string, string> = {}
  let matches = result.pattern.exec(path)
  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null
  }
  return out
}


/** Create a router store. This store is automatically
 * updated everytime the #/haspath changes */
const router = (routes: Record<string, string>) => {

  const store = reactive({
    page: '',
    args: {} as Record<string, string>
  })

  const updateRouter = () => {
    const path = location.hash.replace("#", "")
    for(const [page, route] of Object.entries(routes)){
      const routeRegex = parse(route)
      if (routeRegex.pattern.test(path)) {
        store.page = page 
        store.args = execRegexResult(path, routeRegex) as any
        return
      }
    }
    store.page = ''
    store.args = {} as any
    return
  }

  updateRouter()
  window.addEventListener("hashchange", () => updateRouter())
  return store
}


const extractTemplate = (template : string) => {
    let a = 'html`' + template + '`'

  const replacements = [
    ['&gt;', '>'],
    ['&lt;', '<'],
    ['&amp;', '&'],

    [/{#if(.*?)}/g, (_, a) => '${ () => '+ a + ' && html`'],
    ['{/if}', '`}'],

    [/{#for(.*?)of(.*?)}/g, (_, b, a) => '${ () =>'+ a + '.map( (' + b + ') => html`'],
    ['{/for}', '`)}'],


    ['{{', '${()=>'],
    ['}}', '}'],
    ['\\{', '{'],
    ['\\}', '}'],
  ]

  for( const [old,replace] of replacements){ // @ts-ignore
    a = a.replaceAll(old, replace)
  }
  
  return window.eval(a);
}


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
  return result
}





const mountApp = () => {

  const {processClasses, startWatching} = RunCSS()
  for(const element of document.querySelectorAll('*[class]')) {
    const clazz = element.getAttribute('class') ?? ''
      processClasses(clazz.includes('${') ? extractLiterals('`' + clazz + '`'): clazz)
  }

  const hiddenNodes = document.querySelectorAll('*[runcss-cloak]')
  for(let node of hiddenNodes){
    node.removeAttribute('runcss-cloak')
  }

  startWatching(document.body)

  const template = extractTemplate(document.body.innerHTML)
  document.body.innerHTML = ''  
  template(document.body)

}


Object.assign(window, {html, reactive, persistent, router, extractTemplate, mountApp})


if(document.currentScript && document.currentScript.hasAttribute('mount')){
   document.addEventListener('DOMContentLoaded', mountApp)
}




/*
//import { createApp as createVueApp, reactive, nextTick, watchEffect} from '../node_modules/pico-vue/src/index'
import RunCSS, {extendRunCSS } from 'runcss'






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
*/

