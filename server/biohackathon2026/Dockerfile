FROM r-base:4.4.2

# System libraries required by plumber and xgboost
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN Rscript -e "install.packages(c('plumber','xgboost','jsonlite'), repos='https://cloud.r-project.org')"

WORKDIR /api
COPY . .

EXPOSE 8000

CMD ["Rscript", "-e", \
  "plumber::plumb('plumber.R')$run(host='0.0.0.0', port=as.integer(Sys.getenv('PORT','8000')))"]
