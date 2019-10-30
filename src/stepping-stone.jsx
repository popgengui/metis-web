import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'


import {
  gn_generate_unlinked_genome,
  gn_MicroSatellite,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_p_MigrationSteppingStoneFixed,
  ops_rep_StructuredSexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_hz_ExpHeDeme,
  ops_stats_NumAl,
  ops_stats_utils_SaveGenepop,
  ops_wrap_list,
  p_assign_fixed_size_population,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, deme_size, d1, d2, num_migs,
                           num_markers, marker_type) => {
  const genome_size = num_markers
  const num_demes = d1 * d2
  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {
      return marker_type === 'SNP'?
             new gn_SNP() :
             new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))
    })
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_StructuredSexualReproduction(species, deme_size, num_demes),
    new ops_culling_KillOlderGenerations(),
    new ops_p_MigrationSteppingStoneFixed(num_migs, d1, d2),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_hz_ExpHe(),
    new ops_stats_hz_ExpHeDeme()
  ])
  const individuals = p_generate_n_inds(deme_size * num_demes, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome)))
  p_assign_fixed_size_population(individuals, num_demes)
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SteppingStoneApp = (sources) => {

  const tag = 'stepping-stone'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const pexphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.DemeExpHe[0].unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const cexphe$ = my_metis$.map(state => {
    var cnt = 1
    const y = Math.floor(d1/2)
    const x = Math.floor(d2/2)
    const cosmo = x + y*d2
    return state.global_parameters.DemeExpHe[cosmo].unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })
  
  const marker_type_c = Selector({DOM: sources.DOM},
                                 {className: '.' + tag + '-marker_type',
                                  label: 'Marker type'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)
  
  const deme_size_c = Slider({DOM: sources.DOM},
                             {className: '.' + tag + '-deme_size',
			      label: 'Deme size',
                              step: 10, min: 10, value: 50, max: 100})
  let deme_size
  deme_size_c.value.subscribe(v => deme_size = v)


  const d1_c = Slider({DOM: sources.DOM},
                      {className: '.' + tag + '-d1', label: 'Vertical dimension (demes in the y axis)',
                       step: 1, min: 1, value: 5, max: 6})
  let d1
  d1_c.value.subscribe(v => d1 = v)


  const d2_c = Slider({DOM: sources.DOM},
                       {className: '.' + tag + '-d2', label: 'Horizontal dimension (demes in the x axis)',
                              step: 1, min: 1, value: 5, max: 6})
  let d2
  d2_c.value.subscribe(v => d2 = v)

  const num_migs_c = Slider({DOM: sources.DOM},
                            {className: '.' + tag + '-num_migs', label: 'Number of migrants',
                             step: 1, min: 0, value: 1, max: 9})
  let num_migs
  num_migs_c.value.subscribe(v => num_migs = v)
  
  
  const num_cycles_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-num_cycles', label: 'Generations',
                               step: 10, min: 2, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider({DOM: sources.DOM},
                               {className: '.' + tag + '-num_markers', label: 'Number of markers',
                                step: 1, min: 1, value: 4, max: 100})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const exphe_plot = Plot(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity - Meta population'},
    {DOM: sources.DOM, vals: exphe$})

  const pexphe_plot = Plot(
    {id: tag + '-pexphe', y_label: 'Expected Heterozygosity - Peripheral Deme'},
    {DOM: sources.DOM, vals: pexphe$})

  const cexphe_plot = Plot(
    {id: tag + '-cexphe', y_label: 'Expected Heterozygosity - Cosmopolitan Deme'},
    {DOM: sources.DOM, vals: cexphe$})
  
  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  const save$ = sources
    .DOM.select('#' + tag + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))
  
  const metis$ = simulate$.map(_ => {
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, deme_size, d1, d2, num_migs,
                               num_markers, marker_type)
    }
    return init
  })

  const save_gp$ = my_metis$.sample(save$)

  save_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', 'structure.stepping.stone.txt')
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    marker_type_c.DOM,
                    deme_size_c.DOM, d1_c.DOM, d2_c.DOM, num_migs_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    exphe_plot.DOM, pexphe_plot.DOM, cexphe_plot.DOM)
                  .map(([marker_type,
                         deme_size, d1, d2, num_migs,
                         num_cycles, num_markers,
                         exphe, pexphe, cexphe]) =>
                           <div>
			      <h2>Structure, Stepping-stone</h2>
                             <div>
                               {marker_type}
                               {deme_size}
                               {d1}
			       {d2}
                               {num_migs}
                               {num_cycles}
                               {num_markers}
                               <br/>
                               <center><button id={tag} value="1">Simulate</button></center>
			       <br/>
                             </div>
                             {exphe}
                             {pexphe}
                             {cexphe}			     
                             <br/>
                             <div style="text-align: center">
                               <button id={tag + '_save'} value="1">Save Genepop</button>
                             </div>
                           </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
