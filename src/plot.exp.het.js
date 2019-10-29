/* 
 * 2019_10_21
 * This module is simply a copy of plot.js,
 * modified to divide the expected het plots
 * into the exp vals vs the mean.
 */

import {div} from '@cycle/dom'

import * as vg from 'vega'
import * as vl from 'vega-lite'


const plot_spec = conf => {
    const cf = Object.assign({}, conf)
    cf.desc = cf.desc || ''
    cf.title = cf.title || ''
    cf.x_label = cf.x_label || 'Generations'
    cf.y_label = cf.y_label || ''
    return `
    {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "description": "${cf.desc}",
        "title": "${cf.title}",
	"config": { "legend":{ "columns" : 3, "symbolType":"circle" } },
        "data": {
            "name": "lines"
        },
        "layer": [
	{
		"mark": { "type":"line", "strokeDash": [6,4] },
		"encoding": {
		    "x": {"field": "x",
			  "axis": {"title": "${cf.x_label}"},
			  "type": "quantitative",
			  "bandSize": "fit"},
		    "y": {"field": "y",
			  "axis": {"title": "${cf.y_label}"},
			  "type": "quantitative"},
		    "color": {"field": "marker", "type": "nominal"}
		}
	},
	{
		"mark": { "type":"line", "strokeDash":[], "strokeWidth":3.0 },
		"encoding":{
			"x":{ "field": "x", "type": "quantitative" },
			"y":{ "field": "hemean", "type":"quantitative" },
			"color":{ "field" : "marker", "type":"nominal" }}
	}
    ]
    }`}


const prepare_plot = (vl_text, conf, points, cb) => {
    const vl_json = JSON.parse(vl_text)
    vl_json.width = conf.width || 600
    vl_json.height = vl_json.width - vl_json.width / 4
    const vg_spec = vg.parse(vl.compile(vl_json).spec)

    const view = new vg.View(vg_spec)
    view.renderer('canvas')
    
    const id_ = document.querySelector('#' + conf.id)
    view.initialize(id_)
    view.insert('lines', points)
    view.run()
    return view
}


const update_plot = (view, points) => {
    view.insert('lines', points).run()
    //document.getElementById('vega').style.display = 'none'
}


const clean_plot = (view) => {
    view.remove('lines', _ => true).run()
}


export const PlotExpHet = (conf, sources) => {
    const where = conf.id
    const clean = conf.clean === undefined ? true : conf.clean
    const dom = sources.DOM
    const vals$ = sources.vals.startWith([])

    let view = null

    let max_cycle = -1 // XXX state

    dom.select('#' + where).elements().take(1).subscribe(x => {
        view = prepare_plot(plot_spec(conf), conf)
    })

    const state$ = vals$
          .map(val => {
              return val.map(p => {return {x: p.x, y: p.y, marker: p.marker, hemean:p.hemean}})
          })

    state$.subscribe(poses => {
        let points = []
        for (let x_point of poses) {
            if (x_point.x < max_cycle && clean) {
                clean_plot(view)
            }
            max_cycle = x_point.x

            points.push(x_point)
        }
        if (view) {
            update_plot(view, points)
        }
    })

    const vdom$ = state$.map(state => div(
        {attrs: {
            id: conf.id,
            style: 'margin: auto'
        }}))

    const sinks = {
        update: state$.startWith(null),
        DOM: vdom$
    }
    
    return sinks
}
