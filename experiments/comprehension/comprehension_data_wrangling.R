
library(jsonlite)
library(dplyr)
library(plyr)
library(ggplot2)
library(tidyr)
library(lubridate)

filenames <- list.files("mturk/production-results/", pattern="*.json", full.names = TRUE)
ldf <- lapply(filenames, fromJSON)
ldf2 <- lapply(ldf, data.frame)

cdata <- rbind.fill(ldf2) %>%
  select(-c(1:8, 185:360)) %>%
  write.csv("data/turkdata.csv", na = "")
