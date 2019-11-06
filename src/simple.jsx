import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {PlotExpHet} from './plot.exp.het.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'
/*20191101 Ted adds a plot style*/
import './metisstyles.css'

import {
  create_sex_population,
  create_unlinked_species
} from './sim.js'

/* 2019_10_30. Ted adds allele frequency plot.*/
import {
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_FreqAl,
  ops_stats_NumAl,
  ops_stats_utils_SaveGenepop,
  ops_wrap_list
} from '@tiagoantao/metis-sim'

const prepare_sim_state = (tag, pop_size, num_markers, marker_type) => {
  const species = create_unlinked_species(num_markers, marker_type)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_FreqAl(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe( true )
  ])
  const individuals = create_sex_population(species, pop_size)
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SimpleApp = (sources) => {
  const tag = 'simple'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  /*Ted adds allele freq plot*/
  const freqal$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle - 1, y: freqal, marker: 'M' + cnt++}})
  })

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    var cnt2 = 0
    /*20191020--Ted added a mean exp het as the last entry
     * in the list of exp. hz values, computed in class
     * ops_stats_hz_ExpHe, so that now the
     * marker list has one more value than the total markers.
     * Also, the plot code has been modified to plot
     * the first through ssecond to last Het value
     * (representing the per-marker expected het vals),
     * versus the last value, which is the mean of the others,
     * to plot in different layers to allow custom line formatting
     * (i.e. dashed for the mean), which property "strokeDash"
     * (cannot be implemented using the "encoding" entry in the json 
     * (an issue with vega-lite), which would be the simpler solution.
     */
    var num_vals = state.global_parameters.ExpHe.unlinked.length  
    /* 2019_11_05.  Ted adds a third plot layer, which plots the
     * final values to the right of the line-ends
     */
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
    ///// temp
    console.log( "x-axis offset percentage: " + x_axis_text_offset_percentage )
    /////
	  
    var x_axis_text_offset= Math.round( x_axis_text_offset_percentage * num_cycles )

    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
	      x: state.cycle - 1, 
	      y: exphe,	 
	      marker: ( cnt == ( num_markers + 1 ) ? "Mean" :  'M' + cnt++ ), 
	      hemean: state.global_parameters.ExpHe.unlinked[ num_vals - 1 ],
	      xplus: ( state.cycle - 1 ) + x_axis_unit_shift + x_axis_text_offset,
	      ytext:  state.cycle === final_cycle_number ? 
	      				cnt2 === ( num_vals - 1 ) ?
	      					 "Mean: " + state.global_parameters.ExpHe.unlinked[ cnt2++ ].toFixed(2) 
	      					 : state.global_parameters.ExpHe.unlinked[ cnt2++ ].toFixed(2) 
	      				: ""
      }})
  })

  const sex_ratio$ = my_metis$.map(state => {
    const sr = state.global_parameters.SexRatio
    return [{x: state.cycle - 1,
             y: sr.males / sr.females, marker: 'Sex Ratio'}]
  })
  
  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle - 1, y: numal, marker: 'M' + cnt++}})
  })


  const marker_type_c = Selector(
    {DOM: sources.DOM},
    {className: '.' + tag + '-marker_type',
     label: 'Marker type'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)
  
  const pop_size_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-pop_size',
     label: 'Population Size',
     step: 10, min: 10, value: 50, max: 1000})
  let pop_size
  pop_size_c.value.subscribe(v => pop_size = v)
  
  const num_cycles_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_cycles',
     label: 'Generations',
     step: 1, min: 2, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_markers',
     label: 'Number of markers',
     step: 1, min: 1, value: 100, max: 1000})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const freqal_plot = Plot(
    {id: tag + '-freqal', y_label: 'Allele Frequency'},
    {DOM: sources.DOM, vals: freqal$})


  const exphe_plot = PlotExpHet(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity'},
    {DOM: sources.DOM, vals: exphe$})

  const sr_plot = Plot(
    {id: tag + '-sr', y_label: 'Sex Ratio'},
    {DOM: sources.DOM, vals: sex_ratio$})

  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles'},
    {DOM: sources.DOM, vals: numal$})

  const simulate$ = sources
    .DOM.select('#' + tag)
    .events('click')
    .map(ev => parseInt(ev.target.value))

  const save$ = sources
    .DOM.select('#' + tag + '_save')
    .events('click')
    .map(ev => parseInt(ev.target.value))
  
  const metis$ = simulate$.map(_ => {
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, pop_size, num_markers, marker_type)
    }
    return init
  })

  const save_gp$ = my_metis$.sample(save$)

  save_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', 'metis.txt')
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  

  /* 2019_10_30. Ted adds an allele-freq plot*/

  const vdom$ = Rx.Observable.combineLatest(
    marker_type_c.DOM, pop_size_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    freqal_plot.DOM, exphe_plot.DOM, sr_plot.DOM, numal_plot.DOM).map(
      ([marker_type, pop_size, num_cycles, num_markers,
        freqal_plot, exphe, sex_ratio, numal]) =>
	  <html>
	  <head>
	  </head>
          <body>
          <div>
	    <h2>Wright-Fisher with Sex</h2>
            <div style="text-align: center">
              {marker_type}
              {pop_size}
              {num_cycles}
              {num_markers}
              <br/>
              <button id={tag} value="1">Simulate</button>
	      <br/>
            </div>
	    <div>
	       <center>
	       <p className="plotstyle">
                 {freqal_plot}
	       </p>
	        </center>
	    </div>
	    <div>
	       <center>
	       <p className="plotstyle"> 
                    {exphe}
	       </p>
	       </center>
	    </div>
	    <div>
		    <center>
		       <p className="plotstyle">
			{sex_ratio}
		       </p>
		    </center>
	    </div>
	    <div>
	        <center>
	        <p className="plotstyle">
	          {numal}
	        </p>
	        </center>
	     </div>
            <br/>
            <div style="text-align: center">
              <button id={tag + '_save'} value="1">Save Genepop</button>
            </div>
          </div>
	  </body>
	 </html>
    )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
	return sinks
}
