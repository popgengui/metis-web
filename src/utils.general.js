

export const get_something = something  => { return something + 1; }

export const do_x_axis_text_and_unit_shift = num_cycles =>
{
    var x_axis_text_offset_percentage = 0.0
    var x_axis_unit_shift = 0.0
    //var proportion_x_units_needed_for_text=0.090 
    //var extra_x_units_needed = num_cycles * proportion_x_units_needed_for_text
    

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
    
    return { unit_shift:x_axis_unit_shift, offset_perc: x_axis_text_offset_percentage }
}//end do_x_axis_text_and_unit_shift


export const do_x_axis_text_and_unit_shift_freqal_plot = num_cycles =>
{
    var x_axis_text_offset_percentage = 0.0
    var x_axis_unit_shift = 0.0

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
    
    return { unit_shift:x_axis_unit_shift, offset_perc: x_axis_text_offset_percentage }
}//end do_x_axis_text_and_unit_shift


export const get_exphe_plot_data_and_update_fixed_loci_info = ( het_list, fixed_loci_object ) => 
{

      const exphe_info=[] 

      for (let i=0; i < het_list.length; i++) {
	       var this_het=Math.round(100 * het_list[i].y) / 100
	       var this_cycle=""       
	       //If het_list is zero, the marker is fixed:
		if ( this_het === 0 ){
		      //If this marker already fixed, 
		      //we use the prev cycle number:
		      if ( fixed_loci_object.cycle_at_fix_per_exphe[i] != -1 )
		      {
			      this_cycle=fixed_loci_object.cycle_at_fix_per_exphe[i]
		      }else{
			      //else we use the current
			      //cycle number, and record it
			      //in our cum stats array:
			      this_cycle=het_list[i].x
			      fixed_loci_object.cycle_at_fix_per_exphe[i] = this_cycle
			      fixed_loci_object.total_fixed_exphe++ 
		      }//end if already fixed, else record fixed cycle number
		}//end if exp het is zero

	       exphe_info.push({
		  marker: het_list[i].marker,
		  cycle: this_cycle,
		  exp_he: this_het
        	})

      }//end for each exp_he value

      return exphe_info
}//end get_exphe_plot_data_and_update_fixed_loci_info

export const update_cum_loci_stats_per_exphe = ( cycle_number, het_list, fixed_loci_object  ) =>
{

	for (let i=0; i < het_list.length; i++) {
	       var this_het=Math.round(100 * het_list[i] ) / 100
	       var this_cycle=cycle_number       
	       //If het is zero, the marker is fixed:
		if ( this_het === 0 ){
		      //If this marker already fixed, 
		      //we use the prev cycle number:
		      if ( fixed_loci_object.cycle_at_fix_per_exphe[i] != -1 )
		      {
			      this_cycle=fixed_loci_object.cycle_at_fix_per_exphe[i]
		      }else{
			      //else we use the current
			      //cycle number, and record it
			      //in our cum stats array:
			      fixed_loci_object.cycle_at_fix_per_exphe[i] = this_cycle
			      fixed_loci_object.total_fixed_exphe++ 
		      }//end if already fixed, else record fixed cycle number
		}//end if exp het is zero
	}//end for each het value
}//end update_cum_loci_stats

export const update_cum_loci_stats_per_freqal = ( cycle_number, freq_list, fixed_loci_object  ) =>
{

	for (let i=0; i < freq_list.length; i++) {

	       var this_freq=Math.round(100 * freq_list[i] ) / 100

	       //If freq is zero, the marker is fixed:
		if ( this_freq === 0.0 )
		{
		      if ( fixed_loci_object.cycle_at_loss_per_freqal[i] === -1 )
		      {
			        fixed_loci_object.cycle_at_loss_per_freqal[i] = cycle_number
			        console.log( "at cycle " + cycle_number + ", incrementing freqal lost total..." )
				fixed_loci_object.total_lost_freqal++
		      }//end if this is the cycle at which it was lost
		}
		else if ( this_freq === 1.0 ) 
		{
		      if ( fixed_loci_object.cycle_at_fix_per_freqal[i] === -1 )
		      {
			        fixed_loci_object.cycle_at_fix_per_freqal[i] = cycle_number
			        console.log(  "at cycle " + cycle_number + ", incrementing freqal fix total..." )
				fixed_loci_object.total_fixed_freqal++
		      }//end if this is the cycle at which it was fixed		

		}//end if freq is zero, else if freq is 1.0

	}//end for each freq value
}//end update_cum_loci_stats_per_freqal


export const get_freq_allele_data_for_plot = ( state, num_cycles, num_markers ) =>
{
	/*20200323.  Ted modifies the data gathered for an allele freq plot, to resemble
	 * the modifications made for the expected het plot (see below )
	 */

	var cnt = 1
	var cnt2 = 0

	var num_vals = state.global_parameters.ExpHe.unlinked.length  
    	var final_cycle_number = num_cycles + 2
    	var x_axis_text_offset_percentage = 0.0
    	var x_axis_unit_shift = 0
    	var o_offsets=do_x_axis_text_and_unit_shift( num_cycles )

    	x_axis_unit_shift=o_offsets.unit_shift

    	x_axis_text_offset_percentage=o_offsets.offset_perc
    	  
    	var x_axis_text_offset= Math.round( x_axis_text_offset_percentage * num_cycles )


        update_cum_loci_stats_per_freqal( state.cycle, 
					state.global_parameters.FreqAl.unlinked, 
					state.cum_stats )  

    	return state.global_parameters.FreqAl.unlinked.map(freqal => {
      		return {
			x: state.cycle - 1, 
			y: freqal, 
			marker: ( cnt == ( num_markers + 1 ) ? "Mean" :  'M' + cnt++ ), 
	     		hemean: state.global_parameters.FreqAl.unlinked[ num_vals - 1 ],
			//( state.cycle - 1 ) + x_axis_unit_shift + x_axis_text_offset,
	      		xplus:( state.cycle - 1 ) + x_axis_unit_shift + x_axis_text_offset, 
	      		ytext:  state.cycle === final_cycle_number ? 
	      				cnt2 === ( num_vals - 1 ) ?
	      					 "Mean: " + state.global_parameters.FreqAl.unlinked[ cnt2++ ].toFixed(2) 
	      					 : state.global_parameters.FreqAl.unlinked[ cnt2++ ].toFixed(2) 
	      				: "",
	      		meantext: state.cycle === final_cycle_number ?  
	      		cnt2 === ( num_vals - 1 ) ?  
	       		"Mean: " + state.global_parameters.FreqAl.unlinked[ cnt2 ].toFixed(2) 
	       		: "" :"",
	      		yvalfixed:1.0,
			yvallost:0.0,
	      		totfixed: state.cycle === final_cycle_number ?
	      		cnt2 === ( num_vals - 1 ) ?
	      		"Total Fixed: " + state.cum_stats.total_fixed_freqal
	      		:"" : "",
			totlost: state.cycle === final_cycle_number ?
	      		cnt2 === ( num_vals - 1 ) ?
	      		"Total Lost: " + state.cum_stats.total_lost_freqal
	      		:"" : ""
		}})
  

}//end get_freq_allele_data_for_plot

export const get_exphe_data_for_plot = ( state, num_cycles, num_markers ) =>
{
    var cnt = 1
    var cnt2 = 0
    /*20191020--Ted added a mean exp het as the last entry
     * in the list of exp. hz values, computed in class
     * ops_stats_hz_ExpHe, so that now the
     * marker list has one more value than the total markers.
     * Also, the plot code has been modified to plot
     * the first through second-to-last Het value
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
    var o_offsets=do_x_axis_text_and_unit_shift( num_cycles )

    update_cum_loci_stats_per_exphe( state.cycle, 
				state.global_parameters.ExpHe.unlinked, 
							state.cum_stats )  

    x_axis_unit_shift=o_offsets.unit_shift

    x_axis_text_offset_percentage=o_offsets.offset_perc
    	  
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
	      				: "",
	      meantext: state.cycle === final_cycle_number ?  
	      		cnt2 === ( num_vals - 1 ) ?  
	       		"Mean: " + state.global_parameters.ExpHe.unlinked[ cnt2 ].toFixed(2) 
	       		: "" :"",
	      yvalfixed:0.0,
	      totfixed: state.cycle === final_cycle_number ?
	      		cnt2 === ( num_vals - 1 ) ?
	      		"Total Fixed Loci: " + state.cum_stats.total_fixed_exphe
	      		:"" : ""
	      					
      }})
}//end get_exphe_data_for_plot
