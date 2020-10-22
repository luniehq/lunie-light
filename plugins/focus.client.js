import Vue from 'vue'

const focusElement = {
  inserted: (el) => {
    el.focus()
  },
}

// Directive to Focus an element, but only if a child does not have focus
const focusParentLast = {
  inserted: (el) => {
    if (!el.contains(document.activeElement)) {
      el.focus()
    }
  },
}

Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)
