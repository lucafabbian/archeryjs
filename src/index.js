import '../node_modules/runcss/dist/runcss.css' 

import { createApp as createVueApp} from 'petite-vue'
import RunCSS from 'runcss'


const {processClasses} = RunCSS()

const extractLiterals = (s ) => {
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


for(const element of document.querySelectorAll('*[class]')) {
  processClasses(element.getAttribute('class'))
}

for(const element of document.querySelectorAll('*[\\:class]')) {
  processClasses(extractLiterals(element.getAttribute(':class')))
}


export { processClasses }

export const createApp = (...args) => createVueApp(...args).directive()


if(document.currentScript && document.currentScript.hasAttribute('init')){
  createApp().mount()
}

