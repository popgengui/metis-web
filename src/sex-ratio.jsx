import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'


import {
  gn_generate_unlinked_genome,
  gn_MicroSatellite,
  gn_SNP,
  i_assign_perc_male,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_rep_random_mater_factory,
  ops_rep_sex_ratio_sexual_generator_factory,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_NumAl,
  ops_stats_utils_SaveGenepop,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, marker_type, perc_males) => {
  const genome_size = num_markers

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return marker_type === 'SNP'?
			       new gn_SNP() :
			       new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size, [],
				   ops_rep_random_mater_factory,
				   ops_rep_sex_ratio_sexual_generator_factory(perc_males / (100 - perc_males))),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe()
  ])
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_perc_male(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome), perc_males / 100))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SexRatioApp = (sources) => {

  const tag = 'sex-ratio'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const sex_ratio$ = my_metis$.map(state => {
    const sr = state.global_parameters.SexRatio
    return [{x: state.cycle - 1, y: sr.males / sr.females, marker: 'Sex Ratio'}]
  })

  const ne$ = my_metis$.map(state => {
    const sr = state.global_parameters.SexRatio
    const Nm = sr.males
    const Nf = sr.females
    const Ne = (4 * Nm * Nf) / (Nm + Nf)
    return [{x: state.cycle - 1, y: Ne, marker: 'Ne'}]
  })
  
  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle - 1, y: numal, marker: 'M' + cnt++}})
  })

  const marker_type_c = Selector({DOM: sources.DOM},
                                 {className: '.' + tag + '-marker_type',
                                  label: 'Marker type'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)

  const frac_males_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-fac_males', label: 'Fraction of males',
                               step: 5, min: 10, value: 90, max: 90})

  let frac_males
  frac_males_c.value.subscribe(v => frac_males = v)
  
  const pop_size_c = Slider({DOM: sources.DOM},
                            {className: '.' + tag + '-pop_size', label: 'Population size',
                             step: 10, min: 10, value: 300, max: 1000})
  let pop_size
  pop_size_c.value.subscribe(v => pop_size = v)
  
  const num_cycles_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-num_cycles', label: 'Generations',
                               step: 10, min: 2, value: 20, max: 200})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider({DOM: sources.DOM},
                               {className: '.' + tag + '-num_markers', label: 'Number of markers',
                                step: 1, min: 1, value: 4, max: 100})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const exphe_plot = Plot(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity'},
    {DOM: sources.DOM, vals: exphe$})

  const sr_plot = Plot(
    {id: tag + '-sr', y_label: 'Sex Ratio', yrange: 'auto' },
    {DOM: sources.DOM, vals: sex_ratio$})

  const ne_plot = Plot(
    {id: tag + '-ne', y_label: 'Ne', yrange: 'auto' },
    {DOM: sources.DOM, vals: ne$})
  
  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles', yrange: 'auto'},
    {DOM: sources.DOM, vals: numal$})

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
      state: prepare_sim_state(tag, pop_size, num_markers,
			       marker_type, frac_males)
    }
    return init
  })

  const save_gp$ = my_metis$.sample(save$)

  save_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', 'mating.sex.ratio.txt')
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    marker_type_c.DOM, frac_males_c.DOM,
		    pop_size_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    exphe_plot.DOM, sr_plot.DOM, ne_plot.DOM, numal_plot.DOM)
                  .map(([marker_type, frac_males, pop_size, num_cycles,
			 num_markers,
                         exphe, sex_ratio, ne, numal]) =>
                    <div>
			  <h2>Mating, Sex-ratio</h2>
                      <div>
                        {marker_type}
			{frac_males}
                        {pop_size}
                        {num_cycles}
                        {num_markers}
                        <br/>
                        <center><button id={tag} value="1">Simulate</button></center>
			<br/>
                      </div>
                      {exphe}
		      {sex_ratio}
		      {ne}
                      {numal}
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
