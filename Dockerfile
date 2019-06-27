FROM node:8.11.1

# Create app directory
RUN mkdir -p /usr/src/testproject
WORKDIR /usr/src/testproject

# Install app dependencies
COPY package.json /usr/src/testproject
RUN yarn

# Bundle app source
COPY . /usr/src/testproject

# Build arguments
ARG NODE_VERSION=8.11.1

# Environment
ENV NODE_VERSION $NODE_VERSION