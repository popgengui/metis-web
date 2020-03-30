/* 2019_11_07.  Ted substitures a new genome creator
 * that uses an init allele freq, instead of the
 * integrated_create_randomized_genome
 */
import {
    gn_generate_unlinked_genome,
    gn_MicroSatellite,
    gn_SNP,
    i_assign_random_sex,
    integrated_create_freq_genome_snp_or_microsat,
    integrated_generate_individual_with_genome,
    p_generate_n_inds,
    sp_Species
} from '@tiagoantao/metis-sim'


export const create_unlinked_species = (num_markers, marker_type) => {
    const genome_size = num_markers

    const unlinked_genome = gn_generate_unlinked_genome(
      genome_size, () => {
        return marker_type === 'SNP'?
               new gn_SNP() :
               new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))
      })
    return new sp_Species('unlinked', unlinked_genome)
}

/* 2019_11_07. Ted adds a frequency value to the args used in creating a genome.
 * This is used by the new genome creator in metis-sim's all.js module that accepts
 * a frequcney value and chooses alleles for either SNPs or microsats.
 */
export const create_sex_population = (species, num_individuals, freq_start ) => {
    return p_generate_n_inds(
        num_individuals, () =>
            i_assign_random_sex(integrated_generate_individual_with_genome(
                species, 0, (ind) => integrated_create_freq_genome_snp_or_microsat( freq_start/100, ind ))))
}

/*
 * const individuals = p_generate_n_inds(pop_size, () =>
 *    i_assign_random_sex(integrated_generate_individual_with_genome(
 * species, 0,
 *  (ind) => integrated_create_freq_genome(freq_start / 100, ind))))
*/
