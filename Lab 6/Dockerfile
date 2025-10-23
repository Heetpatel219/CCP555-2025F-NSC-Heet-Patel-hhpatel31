FROM node:22.11.0

LABEL maintainer = "Heet Patel <hhpatel31@myseneca.ca>"
LABEL description = "Course: CCP555 Lab: Lab 5"
LABEL "Lab"="Lab 5"
LABEL "Date"="October 20, 2025"

# We default to use port 8080 in our service
ENV PORT=8080
 
# Reduce npm spam when installing within Docker
# [URL documentation]
ENV NPM_CONFIG_LOGLEVEL=warn
 
# Disable colour when run inside Docker
# [URL documentation]
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json /app/

RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy the .htpasswd file for authentication
COPY ./.htpasswd ./.htpasswd

# Set the environment variable for the htpasswd file
ENV HTPASSWD_FILE=/app/.htpasswd

# Set DOCKER environment variable to disable pretty logging
ENV DOCKER=true

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080