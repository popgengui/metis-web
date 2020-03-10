import Rx from 'rxjs/Rx'

import {
  create_sex_population,
  create_unlinked_species
} from './sim.js'

import {Plot} from './plot.js'
import {PlotExpHet} from './plot.exp.het.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'
import {Table} from './table.js'

import {
  ops_culling_KillOlderGenerations,
  ops_p_MigrationIslandFixed,
  ops_rep_StructuredSexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_hz_ExpHeDeme,
  ops_stats_NumAl,
  ops_stats_utils_SaveGenepop,
  ops_wrap_list,
  p_assign_fixed_size_population
} from '@tiagoantao/metis-sim'

const prepare_sim_state = (
  tag, num_demes, deme_size, num_migs,
  num_markers, marker_type) => {
    const species = create_unlinked_species(num_markers, marker_type)
    const operators = ops_wrap_list([
      new ops_rep_StructuredSexualReproduction(species, deme_size, num_demes),
      new ops_culling_KillOlderGenerations(),
      new ops_p_MigrationIslandFixed(num_migs),
      new ops_stats_demo_SexStatistics(),
      new ops_stats_hz_ExpHe( true ),
      new ops_stats_hz_ExpHeDeme( true )
    ])
    const individuals = create_sex_population(species, deme_size*num_demes)
    p_assign_fixed_size_population(individuals, num_demes)
    const state = {
      global_parameters: {tag, stop: false},
      individuals, operators, cycle: 1}
    return state
  }


export const IslandApp = (sources) => {

  const tag = 'island'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {

    var cnt = 1
    var cnt2 = 0
    /* 2019_11_11 -- Ted revising to match the exp het plotting
     * implemented in the simple.jsx module.
     */

    var num_vals=state.global_parameters.ExpHe.unlinked.length
    var mean_val=state.global_parameters.ExpHe.unlinked[ num_vals - 1 ]

    var final_cycle_number = num_cycles + 2
    var x_axis_text_offset_percentage = 0.0
    var x_axis_unit_shift = 0

    if ( num_cycles < 5 )
    {
      x_axis_text_offset_percentage = 0.0
      x_axis_unit_shift = 0.5
    }
    else if ( num_cycles < 10 )
    {
      x_axis_text_offset_percentage=0.0
      x_axis_unit_shift = 0.8
    }
    else if ( num_cycles < 50 )
    {
      x_axis_text_offset_percentage=0.0
      x_axis_unit_shift = 4.0
    }
    else if ( num_cycles < 100 )
    {
      x_axis_text_offset_percentage = 0.05
      x_axis_unit_shift = 4.0
    }
    else if ( num_cycles < 250 )
    {
      x_axis_text_offset_percentage = 0.10
      x_axis_unit_shift = 6.0
    }
    else if ( num_cycles < 300 )
    { 
      x_axis_text_offset_percentage = 0.12
      x_axis_unit_shift = 8
    }
    else
    {
      x_axis_unit_shift=10
      x_axis_text_offset_percentage = 0.15
    }
	  
    var x_axis_text_offset = Math.round( x_axis_text_offset_percentage * num_cycles )


    return state.global_parameters.ExpHe.unlinked.map(exphe => {
     /*20200309.  Ted added a new return field, yfixed, simply the
      * exphe value formatted to show only 2 decimal places */
      return {
	      x: state.cycle - 1, 
	      y: exphe,
	      yfixed: exphe.toFixed(2),
	      hemean: mean_val=state.global_parameters.ExpHe.unlinked[ num_vals - 1 ],
	      marker: cnt === num_markers + 1 ? 'Mean': 'M' + cnt++,
	      xplus: ( state.cycle - 1 ) + x_axis_unit_shift + x_axis_text_offset,
	      ytext:  state.cycle === final_cycle_number ? 
	      				cnt2 === ( num_vals - 1 ) ?
	      					 "Mean: " + state.global_parameters.ExpHe.unlinked[ cnt2++ ].toFixed(2) 
	      					 : state.global_parameters.ExpHe.unlinked[ cnt2++ ].toFixed(2) 
	      				: ""

      
      }})
  })

  const dexphe$ = my_metis$.map(state => {
    /* 2019_11_11. Ted adds revisions to match the exphe prep above, which
     * matches the latest version as seen in module simple.jsx
     */
    
    var cnt = 1
    var cnt2 = 0

    var num_vals=state.global_parameters.DemeExpHe[0].unlinked.length

    var final_cycle_number = num_cycles + 2
    var x_axis_text_offset_percentage = 0.0
    var x_axis_unit_shift = 0

    if ( num_cycles < 5 )
    {
      x_axis_text_offset_percentage = 0.0
      x_axis_unit_shift = 0.5
    }
    else if ( num_cycles < 10 )
    {
      x_axis_text_offset_percentage=0.0
      x_axis_unit_shift = 0.8
    }
    else if ( num_cycles < 50 )
    {
      x_axis_text_offset_percentage=0.0
      x_axis_unit_shift = 4.0
    }
    else if ( num_cycles < 100 )
    {
      x_axis_text_offset_percentage = 0.05
      x_axis_unit_shift = 4.0
    }
    else if ( num_cycles < 250 )
    {
      x_axis_text_offset_percentage = 0.10
      x_axis_unit_shift = 6.0
    }
    else if ( num_cycles < 300 )
    { 
      x_axis_text_offset_percentage = 0.12
      x_axis_unit_shift = 8
    }
    else
    {
      x_axis_unit_shift=10
      x_axis_text_offset_percentage = 0.15
    }
	  
    var x_axis_text_offset= Math.round( x_axis_text_offset_percentage * num_cycles )

    return state.global_parameters.DemeExpHe[0].unlinked.map(exphe => {
      /*20200309 Ted added yfixed field, so table can output exphe only to 2 decimal places*/
      return {
	      x: state.cycle - 1, 
	      y: exphe, 
	      yfixed: exphe.toFixed(2),
	      marker: cnt === num_markers + 1 ? 'Mean' : 'M' + cnt++,
              hemean: state.global_parameters.DemeExpHe[0].unlinked[ num_vals - 1 ],
	      xplus: ( state.cycle - 1 ) + x_axis_unit_shift + x_axis_text_offset,
	      ytext:  state.cycle === final_cycle_number ? 
	      				cnt2 === ( num_vals - 1 ) ?
	      					 "Mean: " + state.global_parameters.DemeExpHe[0].unlinked[ cnt2++ ].toFixed(2) 
	      					 : state.global_parameters.DemeExpHe[0].unlinked[ cnt2++ ].toFixed(2) 
	      				: ""


      }})
  })
    
  const marker_type_c = Selector(
    {DOM: sources.DOM},
    {className: '.' + tag + '-marker_type', label: 'Marker type'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)
  
  const deme_size_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-deme_size', label: 'Deme size',
     step: 10, min: 10, value: 50, max: 100})
  let deme_size
  deme_size_c.value.subscribe(v => deme_size = v)


  const num_demes_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_demes', label: 'Number of demes',
     step: 1, min: 2, value: 2, max: 10})
  let num_demes
  num_demes_c.value.subscribe(v => num_demes = v)

  const num_migs_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_migs', label: 'Number of migrants',
     step: 1, min: 0, value: 1, max: 9})
  let num_migs
  num_migs_c.value.subscribe(v => num_migs = v)
  
  
  const num_cycles_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_cycles', label: 'Generations',
     step: 10, min: 2, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_markers', label: 'Number of markers',
     step: 1, min: 1, value: 4, max: 20})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

 /*20200309 Ted added yfixed field to the exphe$ output, 
 * above, to format output limit 2 decimal places */ 
  const ht_table = Table(
    {DOM: sources.DOM,
     data: exphe$.startWith([])},
    {fields: ['yfixed', 'marker'],
     headers: ['Expected Heterozygosity', 'Marker']}
  )
/*202000309 Ted added yfixed field (see above)*/
  const hs_table = Table(
    {DOM: sources.DOM,
     data: dexphe$.startWith([])},
    {fields: ['yfixed', 'marker'],
     headers: ['Expected Heterozygosity', 'Marker']}
  )

  

  const exphe_plot = PlotExpHet(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity - Meta population'},
    {DOM: sources.DOM, vals: exphe$})

  const dexphe_plot = PlotExpHet(
    {id: tag + '-dexphe', y_label: 'Expected Heterozygosity - A Deme'},
    {DOM: sources.DOM, vals: dexphe$})

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
      state: prepare_sim_state(tag, num_demes, deme_size, num_migs,
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
    a.setAttribute('download', 'structure.island.txt')
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })


  const vdom$ = Rx.Observable.combineLatest(
    marker_type_c.DOM,
    deme_size_c.DOM, num_demes_c.DOM, num_migs_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    hs_table.DOM, ht_table.DOM,
    exphe_plot.DOM, dexphe_plot.DOM).map(
      ([marker_type,
        num_demes, deme_size, num_migs,
        num_cycles, num_markers,
        hs_html, ht_html,
        exphe, dexphe]) =>
          <div>
	    <h2>Structure, Island</h2>
            <div>
              {marker_type}
              {num_demes}
              {num_migs}
              {deme_size}
              {num_cycles}
              {num_markers}
              <br/>
              <div style="text-align: center">
                <button id={tag} value="1">Simulate</button>
              </div>
	      <br/>
            </div>
              <table align="center">
                <tr>
                  <td>First deme</td>
                  <td>Total population</td>
                </tr>
                <tr>
                  <td>{hs_html}</td>
                  <td>{ht_html}</td>
                </tr>
              </table>
              {exphe}
              {dexphe}
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
