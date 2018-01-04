import {div, option, p, select, span} from '@cycle/dom'


export const Selector = (sources, props) => {
  const DOM = sources.DOM.select(props.className)

  const new_value$ = DOM
    .select('select')
    .events('input')
    .map(ev => ev.target.value)
    .startWith("SNP")

  const __conv_opts = (opts) => {
    return {selected: "SNP"}
  }

    new_value$.subscribe(x => console.log(1111, x))
  const opts = __conv_opts(props.opts)
  
  const vdom$ = new_value$
    .map(state =>
      div(props.className, [
	span('.label', [props.label]),
	select({attrs: {name}}, [
	  option('Microsat'),
	  option({attrs: {selected: 1}}, 'SNP')
	])
      ])
    )

  const sinks = {
    DOM: vdom$,
    value: new_value$
  }

  return sinks
}
