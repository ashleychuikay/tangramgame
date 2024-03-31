#' @export
normalized_lv <- function(s1, s2) {
    lv_dist = stringdist::stringdist(s1, s2, method = 'lv')
    s1_len <- stringr::str_length(s1)
    s2_len <- stringr::str_length(s2)
    maxlength = pmax(s1_len, s2_len)
    return(lv_dist / maxlength)
}

check_overlap <- function(df, x1, x2) {
  x1 <- enquo(x1)
  x2 <- enquo(x2)
  df %>%
    filter(!!x1 > 0) %>%
    mutate(prop = !!x1 / sum(!!x1)) %>%
    filter(!!x2 > 0) %>%
    summarise(overlap = sum(prop))
}

flip_target_competitior <- function(df, x1, x2) {
  x1 <- enquo(x1)
  x2 <- enquo(x2)
  df %>%
    mutate(tmp = !!x1, !!x1 := !!x2, !!x2 := tmp) %>%
    select(-tmp)
}

#' @export
get_average_overlap <- function(input_data) {
  flipped_pairs <- pairs %>%
    mutate(data = map(data, ~flip_target_competitior(.x, tangram1, tangram2)))
  
  symmetric_overlap <- pairs %>%
    bind_rows(flipped_pairs) %>%
    ungroup() %>%
    mutate(overlap = map(data, ~ {
      get_pair_data(input_data, .x$tangram1, .x$tangram2) %>%
        check_overlap(., target_n, comparison_n)
    })) %>%
    select(-data) %>%
    unnest(cols = overlap)
  
  symmetric_overlap %>%
    group_by(target_id, comparison_id) %>%
    summarise(overlap = mean(overlap), n= n())
}