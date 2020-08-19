
dprime = function(df_in) {
  d <- df_in %>% 
    group_by(source) %>%
    summarize(m = mean(empirical_stat), v = var(empirical_stat)) %>%
    gather(quantity, val, m, v) %>%
    unite(source,quantity, source) %>%
    spread(source, val)
  num = d$m_across - d$m_within
  denom = sqrt(.5 * (d$v_across + d$v_within))
  return(num / denom)  
}

# note: cor expects featurs to be in columns so we transpose
get_sim_matrix = function(df, F_mat, method = 'cosine') {
  feats = F_mat[df$feature_ind,]
  if(method == 'cor') {
    return(cor(t(feats), method = 'pearson'))
  } else if (method == 'euclidean') {
    return(as.matrix(dist(feats, method = 'euclidean')))
  } else if (method == 'cosine') {
    return(as.matrix(lsa::cosine(t(feats))))
  } else {
    stop(paste0('unknown method', method))
  }
}

flatten_sim_matrix <- function(cormat, ids) {
  ut <- upper.tri(cormat)
  data.frame(
    dim1 = ids[row(cormat)[ut]],
    dim2 = ids[col(cormat)[ut]],
    sim  = as.numeric(cormat[ut])
  ) %>%
    mutate(dim1 = as.character(dim1),
           dim2 = as.character(dim2))
}

make_within_df <- function(M_mat, F_mat, method) {
  M_mat %>%
    do(flatten_sim_matrix(get_sim_matrix(., F_mat, method = method),
                          .$rep_num)) %>%
    mutate(rep1 = as.numeric(dim1), 
           rep2 = as.numeric(dim2)) 
}

compute_within_convergence <- function(M_mat, F_mat, id, 
                                       method = 'cor', nboot = 1) {
  #cat('\r', id, '/100')
  make_within_df(M_mat, F_mat, method) %>%   
    filter(rep2 == rep1 + 1) %>%
    group_by(rep1, rep2) %>%
    tidyboot_mean(col = sim, na.rm = T, nboot = nboot) %>%
    unite(repdiff, rep1, rep2, sep = '->') %>%
    mutate(sample_id = id) %>%
    rename(IV = repdiff)
}

compute_within_drift <- function(M_mat, F_mat, id, 
                                 method = 'cor', nboot = 1) {
  #cat('\r', id, '/100')
  make_within_df(M_mat, F_mat, method) %>%   
    filter(rep1 == 1) %>%
    group_by(rep1, rep2) %>%
    tidyboot_mean(col = sim, na.rm = T, nboot = nboot) %>%
    unite(repdiff, rep1, rep2, sep = '->') %>%
    mutate(sample_id = id) %>%
    rename(IV = repdiff)
}

make_across_df <- function(M_mat, F_mat, method) {
  M_mat %>%
    group_by(target, rep_num) %>%
    do(flatten_sim_matrix(get_sim_matrix(., F_mat, method = method),
                          as.character(.$subid)))
}

compute_across_similarity <- function(M_mat, F_mat, id,
                                      method = 'cor', nboot = 1) {
  make_across_df(M_mat, F_mat, 'cor') %>%
    group_by(rep_num) %>%
    tidyboot_mean(col = sim, nboot, na.rm = T) %>%
    mutate(sample_id = id) %>%
    rename(IV = rep_num)
}

compute_within_vs_across <- function(M_mat, F_mat) {
  withinGames <- M_mat %>%
    group_by(target, subid) %>%
    do(flatten_sim_matrix(get_sim_matrix(., F_mat, method = 'cosine'),
                          .$rep_num)) %>%
    summarize(empirical_stat = mean(sim, na.rm = T)) %>%
    filter(!is.na(empirical_stat)) %>%
    mutate(source = 'within')
  
  acrossGames <- M_mat %>%
    group_by(target) %>%
    unite(combo_id, subid, rep_num) %>%
    do(flatten_sim_matrix(get_sim_matrix(., F_mat, method = 'cosine'),
                          .$combo_id)) %>%
    separate(dim1, into = c('gameid1', 'repnum1'), sep = '_') %>%
    separate(dim2, into = c('gameid2', 'repnum2'), sep = '_') %>%
    filter(gameid1 != gameid2)
  
  acrossGames$sim[is.nan(acrossGames$sim)] <- NA
  return(acrossGames %>%
           group_by(target, gameid1) %>%
           summarize(empirical_stat = mean(sim, na.rm = TRUE)) %>%
           rename(subid = gameid1) %>%
           mutate(subid = as.numeric(subid)) %>%
           mutate(source = 'across') %>%
           bind_rows(withinGames))
}

scramble_within <- function(M_mat, F_mat) {
  # scrambles repetition
  return(M_mat %>% group_by(target, rep_num) %>% 
           mutate(subid = sample(subid)) %>% 
           ungroup() %>%
           arrange(subid, target, rep_num))
}

scramble_across <- function(M_mat, F_mat) {
  return(M_mat %>% group_by(target, subid) %>%
           mutate(rep_num = sample(rep_num, size = length(rep_num))) %>%
           ungroup() %>%
           arrange(subid, target, rep_num))
}

compute_permuted_estimates <- function(M_mat, F_mat, analysis_type, num_permutations) {
  # Note that tidy won't work with lmerTest
  pb <- progress_estimated(num_permutations)
  return(map_dbl(seq_len(num_permutations), ~{
    pb$tick()$print()
    if(analysis_type == 'across') {
      scrambled <- scramble_across(M_mat, F_mat) %>%
        group_by(target,rep_num) %>%
        do(flatten_sim_matrix(get_sim_matrix(., F_mat, method = 'cor'), .$subid)) %>%
        unite(col = 'gamepair', dim1, dim2) %>%
        mutate(rep = rep_num) 
    } else {
      scrambled <- scramble_within(M_mat, F_mat) %>%
        make_within_df(F_mat, 'cosine') %>% 
        mutate(rep = rep2)
      if(analysis_type == 'drift') {
        scrambled <- scrambled %>% filter(rep1 == 1)
      } else if(analysis_type == 'within') {
        scrambled <- scrambled %>% filter(rep2 == rep1 + 1)
      } else {
        stop('unknown analysis_type')
      }
    }
    
    model.in <- scrambled %>% 
      mutate(sample_id = 1) %>%
      split(.$sample_id)
    if(analysis_type == 'across') {
      model.out <- model.in %>% map(~ lmer(sim ~ poly(rep,2) + (1 | target), data = .))
    } else {
      model.out <- model.in %>% map(~ lmer(sim ~ poly(rep,2) + (1 | subid) + (1 | target), data = .))
    }
    model.out %>%
      map(~ (tidy(., effects = 'fixed') %>% filter(term == 'poly(rep, 2)1'))$estimate) %>%
      unlist()
  }))
}

combine_empirical_and_baselines <- function(M_mat, F_mat, analysis_type, num_permutations) {
  if(analysis_type == 'drift') {
    f <- compute_within_drift
  } else if (analysis_type == 'within') {
    f <- compute_within_convergence
  } else if (analysis_type == 'across') {
    f <- compute_across_similarity
  } else {
    stop('unknown analysis type')
  }
  empirical <- f(M_mat, F_mat, 'empirical', method = 'cosine', nboot = 100) %>% 
    select(-mean, -n) %>% mutate(sample_id = 'empirical')
  pb <- progress_estimated(num_permutations)
  baseline <- map_dfr(seq_len(num_permutations), ~{
    pb$tick()$print()
    if(analysis_type == 'across'){
      scrambled <- M_mat %>% scramble_across() 
    } else{
      scrambled <- M_mat %>% scramble_within()
    }
    f(scrambled, F_mat, .x, method = 'cosine') # this passes in the iteration number
  }) 
  
  baseline.out <- baseline %>%
    group_by(IV) %>%
    summarize(`ci_upper`=quantile(empirical_stat, probs=0.975),
              `ci_lower`=quantile(empirical_stat, probs=0.025),
              `empirical_stat`=quantile(empirical_stat, probs=0.5)) %>%
    mutate(sample_id = 'baseline')
  rbind(empirical, baseline.out)
}