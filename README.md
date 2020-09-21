# ThreeB&&B Reviews Component

Welcome to ThreeB&&B!  This page serves as the landing page for the reviews component of the ThreeB&&B app.  The reviews component is responsible for rendering user submitted reviews of the current room.  The original This particular fork of the original Hacker Home reviews component has a prototype back end built to handle a much higher amount of traffic.  The original back end wasn't very well optimized, so when the ThreeB&&B team took on the project we opted to rebuild the back ends of each of the services so that they'd be capable of handling production level traffic.

For the reviews component, there were two main goals.
1. Examine the original data shape and the database choice to determine if there was a more efficient option.
2. Optimize the server code and design the back end so that it could be scaled horizontally with minimal issues.

## The Database
The legacy code was utilizing MongoDB with an object oriented data shape.  Each room had an object that contained the room ID and an array with all of the reviews stored inside.  

## How to run this projects

```sh
1. //install all libraries
  npm install
2. //seed the data(please make sure you have mongoDB installed on your device)
  npm run bulbasaur
3. //start the server
  npm start
```


## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)

## Usage

> Some usage instructions

## Requirements

An `nvmrc` file is included if using [nvm](https://github.com/creationix/nvm).

- Node 6.13.0
- etc

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install -g webpack
npm install
```

