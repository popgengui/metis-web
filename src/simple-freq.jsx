import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'
import {Table} from './table.js'

/*20200307 Ted adds a new fx that 
 * provides a holder for cumulative
 * marker stats (i.e. for now only 
 * time-to-fixation. */

import {
  gn_generate_unlinked_genome,
  gn_make_cum_marker_stats_holder,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_freq_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_FreqAl,
  //ops_stats_TimeFix,
  ops_stats_NumAl,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, freq_start) => {
  const genome_size = num_markers

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return new gn_SNP()})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_FreqAl(),
 //   new ops_stats_TimeFix(),
    new ops_stats_hz_ExpHe()
  ])
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0,
      (ind) => integrated_create_freq_genome(freq_start / 100, ind))))

  /*Ted adds 20200307 to fix bug in the time-to-fixation updating*/
  const cum_marker_stats=gn_make_cum_marker_stats_holder( num_markers )

  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1, cum_stats:cum_marker_stats  }
  return state
}


export const SimpleFreqApp = (sources) => {
  const tag = 'simple-freq'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const freqal$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle - 1, y: freqal, marker: 'M' + cnt++}})
  })

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle - 1, y: numal, marker: 'M' + cnt++}})
  })

  /*const timefix$ = my_metis$.map(state => {
    console.log( "in timefix$..." )
    var cnt = 1
    return state.global_parameters.TimeFix.unlinked.map(tf => {
      console.log( "tf: " + tf )
      return {
        cycle: tf, marker: 'M' + cnt++}})
  })*/
   /*Ted adds 20200307.  This replaces the  timefix$ assigment,
    * to thet data for the time-to-fixation 
    * table*/
   const currfix$=my_metis$.map( state => {
	  return state.cum_stats.cycle_at_fix } )

  const exphe_timefix$ = exphe$
    .combineLatest(currfix$, (exp_he, time_fix) => {
      const comb = []
      
      for (let i=0; i < exp_he.length; i++) {

       var this_exp_he=Math.round(100 * exp_he[i].y) / 100
       var this_cycle=""       
       //If exp_he is zero, the marker is fixed:
        if ( this_exp_he === 0 ){
	      //If this marker already fixed, 
	      //we use the prev cycle number:
	      if ( time_fix[i] != -1 )
	      {
		      this_cycle=time_fix[i]
	      }else{
		      //else we use the current
		      //cycle number, and record it
		      //in our cum stats array:
		      this_cycle=exp_he[i].x
		      time_fix[i] = this_cycle
	      }
        }


        comb.push({
          marker: exp_he[i].marker,
          cycle: this_cycle,
          exp_he: this_exp_he
        })
      }
      return comb
    })

  const freq_start_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-freq_start',
     label: 'Starting frequency of the allele (%)',
     step: 1, min: 1, value: 50, max: 99})
  let freq_start
  freq_start_c.value.subscribe(v => freq_start = v)
  
  const pop_size_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-pop_size', label: 'Population size',
     step: 10, min: 10, value: 50, max: 1000})
  let pop_size
  pop_size_c.value.subscribe(v => pop_size = v)
  
  const num_cycles_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_cycles', label: 'Generations',
     step: 10, min: 2, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_markers',
     label: 'Number of markers',
     step: 1, min: 1, value: 4, max: 100})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const freqal_plot = Plot(
    {id: tag + '-freqal', y_label: 'Allele Frequency'},
    {DOM: sources.DOM, vals: freqal$})

  const timefix_table = Table(
    {DOM: sources.DOM,
     data: exphe_timefix$.startWith([])},
    {fields: ['marker', 'cycle', 'exp_he'],
     headers: ['Marker', 'Fixation generation', 'Expected Heterozygosity']}
  )
  
  const exphe_plot = Plot(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity'},
    {DOM: sources.DOM, vals: exphe$})

  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles'},
    {DOM: sources.DOM, vals: numal$})

  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  //simulate$.subscribe((x) => console.log(2123, x))
  
  const metis$ = simulate$.map(_ => {
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, pop_size,
                               num_markers, 100 - freq_start)
    }
    return init
  })

  const vdom$ = Rx.Observable.combineLatest(
    freq_start_c.DOM, pop_size_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    timefix_table.DOM,
    freqal_plot.DOM,
    exphe_plot.DOM, numal_plot.DOM)
                  .map(([freq_start, pop_size, num_cycles, num_markers,
                         time_html,
                         freqal, exphe, numal]
                  ) =>
                    <div>
			  <h2>Drift at Multiple Loci</h2>
                      <div style="text-align: center">
                        {freq_start}
                        {pop_size}
                        {num_cycles}
                        {num_markers}
                        <br/>
                        <div style="text-align: center">
                          <button id={tag} value="1">Simulate</button>
                        </div>
                      </div>
                      <h3><center>Time to fixation and Expected Heterozygosity</center></h3>
                      {time_html}
                      {freqal}
                      {exphe}
                      {numal}
                    </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
