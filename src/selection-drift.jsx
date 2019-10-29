import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'

import {create_unlinked_species} from './sim.js'

import {
  ops_culling_KillOlderGenerations,
  ops_rep_AutosomeSNPMater,
  ops_rep_SexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_FreqAl,
  ops_stats_TimeFix,
  ops_stats_NumAl,
  ops_wrap_list,
  ops_stats_utils_SaveGenepop,
  p_generate_n_inds,
  i_assign_random_sex,
  integrated_generate_individual_with_genome,
  integrated_create_freq_genome
} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, freq_start,
  sel, marker_name, feature_position) => {
    const species = create_unlinked_species(num_markers, 'SNP')
    const mater_factory = (reproductor, individuals) =>
      new ops_rep_AutosomeSNPMater(
        reproductor, individuals,
        sel, marker_name, feature_position)
    const operators = ops_wrap_list([
      new ops_rep_SexualReproduction(species, pop_size, [], mater_factory),
      new ops_culling_KillOlderGenerations(),
      new ops_stats_demo_SexStatistics(),
      new ops_stats_NumAl(),
      new ops_stats_FreqAl(),
      new ops_stats_TimeFix(),
      new ops_stats_hz_ExpHe()
  ])
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0,
      (ind) => integrated_create_freq_genome(freq_start / 100, ind))))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SelectionDriftApp = (sources) => {
  const tag = 'sel-drift'

  const dtag1 = 'dsel-drift1'
  const dtag2 = 'dsel-drift2'

  const rtag1 = 'rsel-drift1'
  const rtag2 = 'rsel-drift2'

  const htag1 = 'hsel-drift1'
  const htag2 = 'hsel-drift2'

  const hntag1 = 'hnsel-drift1'
  const hntag2 = 'hnsel-drift2'

  
  const my_dmetis1$ = sources.metis.filter(
    state => state.global_parameters.tag === dtag1)
  const my_dmetis2$ = sources.metis.filter(
    state => state.global_parameters.tag === dtag2)
  const my_rmetis1$ = sources.metis.filter(
    state => state.global_parameters.tag === rtag1)
  const my_rmetis2$ = sources.metis.filter(
    state => state.global_parameters.tag === rtag2)
  const my_hmetis1$ = sources.metis.filter(
    state => state.global_parameters.tag === htag1)
  const my_hmetis2$ = sources.metis.filter(
    state => state.global_parameters.tag === htag2)
  const my_hnmetis1$ = sources.metis.filter(
    state => state.global_parameters.tag === hntag1)
  const my_hnmetis2$ = sources.metis.filter(
    state => state.global_parameters.tag === hntag2)

  const dfreqal1$ = my_dmetis1$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const dfreqal2$ = my_dmetis2$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const rfreqal1$ = my_rmetis1$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const rfreqal2$ = my_rmetis2$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const hfreqal1$ = my_hmetis1$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const hfreqal2$ = my_hmetis2$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const hnfreqal1$ = my_hnmetis1$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })
  const hnfreqal2$ = my_hnmetis2$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })

  
  const s_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-s', label: 'Selection coefficient s:',
     step: 1, min: 0, value: 10, max: 20, print: (x) => x / 100})
  let s
  s_c.value.subscribe(v => s = v / 100)

  
  const freq_start_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-freq_start',
     label: 'Starting frequency of the derived (selected) allele (%)',
     step: 1, min: 1, value: 50, max: 99})
  let freq_start
  freq_start_c.value.subscribe(v => freq_start = v)
  
  const pop_size1_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-pop_size1',
     label: 'Population size',
     step: 10, min: 10, value: 50, max: 300})
  let pop_size1
  pop_size1_c.value.subscribe(v => pop_size1 = v)
  const pop_size2_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-pop_size2',
     label: 'Population size',
     step: 10, min: 10, value: 300, max: 300})
  let pop_size2
  pop_size2_c.value.subscribe(v => pop_size2 = v)

  const num_cycles_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_cycles', label: 'generations:',
     step: 10, min: 2, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_markers', label: 'markers:',
     step: 1, min: 1, value: 4, max: 20})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const dfreqal1_plot = Plot(
    {id: tag + '-dfreqal1', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: dfreqal1$})
  const dfreqal2_plot = Plot(
    {id: tag + '-dfreqal2', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: dfreqal2$})
  const rfreqal1_plot = Plot(
    {id: tag + '-rfreqal1', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: rfreqal1$})
  const rfreqal2_plot = Plot(
    {id: tag + '-rfreqal2', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: rfreqal2$})
  const hfreqal1_plot = Plot(
    {id: tag + '-hfreqal1', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: hfreqal1$})
  const hfreqal2_plot = Plot(
    {id: tag + '-hfreqal2', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: hfreqal2$})
  const hnfreqal1_plot = Plot(
    {id: tag + '-hnfreqal1', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: hnfreqal1$})
  const hnfreqal2_plot = Plot(
    {id: tag + '-hnfreqal2', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: hnfreqal2$})

  
  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

   const save_dmetis1$ = sources
    .DOM.select('#' + 'dmetis1' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_dmetis2$ = sources
    .DOM.select('#' + 'dmetis2' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_rmetis1$ = sources
    .DOM.select('#' + 'rmetis1' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_rmetis2$ = sources
    .DOM.select('#' + 'rmetis2' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_hmetis1$ = sources
    .DOM.select('#' + 'hmetis1' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_hmetis2$ = sources
    .DOM.select('#' + 'hmetis2' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_hnmetis1$ = sources
    .DOM.select('#' + 'hnmetis1' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))

    const save_hnmetis2$ = sources
    .DOM.select('#' + 'hnmetis2' + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))



  const dmetis1$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        dtag1, pop_size1, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const dmetis2$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        dtag2, pop_size2, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const rmetis1$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1 - s, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        rtag1, pop_size1, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const rmetis2$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1 - s, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        rtag2, pop_size2, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const hmetis1$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1 - s}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        htag1, pop_size1, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const hmetis2$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1 - s}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        htag2, pop_size2, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const hnmetis1$ = simulate$.map(_ => {
    const sel = {0: 1, 1: 1 - s, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        hntag1, pop_size1, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  const hnmetis2$ = simulate$.map(_ => {
    const sel = {0: 1, 1: 1 - s, 2: 1}
    const init = {
      num_cycles,
      state: prepare_sim_state(
        hntag2, pop_size2, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    return init
  })
  
   const save_dmetis1_gp$ = my_dmetis1$.sample(save_dmetis1$)
   const save_dmetis2_gp$ = my_dmetis2$.sample(save_dmetis2$)
   const save_rmetis1_gp$ = my_rmetis1$.sample(save_rmetis1$)
   const save_rmetis2_gp$ = my_rmetis2$.sample(save_rmetis2$)
   const save_hmetis1_gp$ = my_hmetis1$.sample(save_hmetis1$)
   const save_hmetis2_gp$ = my_hmetis2$.sample(save_hmetis2$)
   const save_hnmetis1_gp$ = my_hnmetis1$.sample(save_hnmetis1$)
   const save_hnmetis2_gp$ = my_hnmetis2$.sample(save_hnmetis2$)

   save_dmetis1_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "dom.select.1.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })


   save_dmetis2_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download',"dom.select.2.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })


   save_rmetis1_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "recess.select.1.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

   save_rmetis2_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download',  "recess.select.2.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

   save_hmetis1_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "het.advantage.1.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

   save_hmetis2_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "het.advantage.2.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

   save_hnmetis1_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "het.disadvantage.1.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

   save_hnmetis2_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', "het.disadvantage.2.txt")
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  const vdom$ = Rx.Observable.combineLatest(
    s_c.DOM, freq_start_c.DOM, pop_size1_c.DOM, pop_size2_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    dfreqal1_plot.DOM, dfreqal2_plot.DOM,
    rfreqal1_plot.DOM, rfreqal2_plot.DOM,
    hfreqal1_plot.DOM, hfreqal2_plot.DOM,
    hnfreqal1_plot.DOM, hnfreqal2_plot.DOM).map(
      ([s, freq_start, pop_size1, pop_size2,
        num_cycles, num_markers,
        dfreqal1, dfreqal2,
        rfreqal1, rfreqal2,
        hfreqal1, hfreqal2,
        hnfreqal1, hnfreqal2]) =>
          <div>
	    <h2>Interactions, Selection and Drift</h2>
            <div>
              {s}
              {freq_start}
              {num_cycles}
              {num_markers}
              <br/>
              <div style="text-align: center">
                <button id={tag} value="1">Simulate</button>
              </div>
            </div>
            <div style="margin: auto">
              <table>
                <tr>
                  <td>{pop_size1}</td>
                  <td>{pop_size2}</td>
                </tr>

                <tr><td colSpan="2">
                  <h2>Dominant selection</h2></td></tr>
                <tr>
                  <td>
	               {dfreqal1}
                       <div style="text-align: center">
                         <button id={'dmetis1_save'} value="1">Save Genepop</button>
                       </div>
	          </td>

                  <td>
	                 {dfreqal2}
                          <div style="text-align: center">
                            <button id={'dmetis2_save'} value="1">Save Genepop</button>
                          </div>
	          </td>
                </tr>

                <tr><td colSpan="2">
                  <h2>Recessive selection</h2></td></tr>
                <tr>
                  <td>
	    	        {rfreqal1}
                          <div style="text-align: center">
                            <button id={'rmetis1_save'} value="1">Save Genepop</button>
                          </div>
	          </td>

                  <td>
	                {rfreqal2}
                          <div style="text-align: center">
                            <button id={'rmetis2_save'} value="1">Save Genepop</button>
                          </div>
	          </td>
                </tr>

                <tr><td colSpan="2">
                  <h2>Heterozygote advantage</h2></td></tr>
                <tr>
                  <td>
	                 {hfreqal1}
                          <div style="text-align: center">
                            <button id={'hmetis1_save'} value="1">Save Genepop</button>
                          </div>
	          </td>

                  <td>
	                 {hfreqal2}
                          <div style="text-align: center">
                            <button id={'hmetis2_save'} value="1">Save Genepop</button>
                          </div>
	          </td>
                </tr>

                <tr><td colSpan="2">
                  <h2>Heterozygote disadvantage</h2></td></tr>
                <tr>
                  <td>
	                 {hnfreqal1}
                          <div style="text-align: center">
                            <button id={'hnmetis1_save'} value="1">Save Genepop</button>
                          </div>
	          </td>

                  <td>
	                 {hnfreqal2}
                          <div style="text-align: center">
                            <button id={'hnmetis2_save'} value="1">Save Genepop</button>
                          </div>
	          </td>
                </tr>

              </table>
            </div>
          </div>
    )

  const sinks = {
    DOM: vdom$,
    metis: Rx.Observable.merge(
      hnmetis1$, hnmetis2$, hmetis1$, hmetis2$,
      rmetis1$, rmetis2$, dmetis1$, dmetis2$)
  }
  
  return sinks
}
