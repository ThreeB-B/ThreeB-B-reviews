# ThreeB&&B Reviews Component

Welcome to ThreeB&&B!  This page serves as the landing page for the reviews component of the ThreeB&&B app.  The reviews component is responsible for rendering user submitted reviews of the current room.  The original This particular fork of the original Hacker Home reviews component has a prototype back end built to handle a much higher amount of traffic.  The original back end wasn't very well optimized, so when the ThreeB&&B team took on the project we opted to rebuild the back ends of each of the services so that they'd be capable of handling production level traffic.  In particular, we wanted to ensure that the services would be capable of handling spikes in traffic without reducing our quality of service for the user.

< Round out the overview with results and benchmark data >



For the reviews component, there were two main goals.
1. Examine the original data shape and the database choice to determine if there was a more efficient option.
2. Optimize the server code and design the back end so that it could be scaled horizontally with minimal issues.

## The Database
The legacy code was utilizing MongoDB with an object oriented data shape.  Each room had an object that contained the room ID and an array with all of the reviews stored inside.

The original schema looked like this:
```Javascript
{
  "room_id": "int",
  "reviews": [
    {
      "name": "string",
      "profileNumPic": "int",
      "date": "string",
      "sentence": "string",
      "accuracy_rating": "int",
      "communication_rating": "int",
      "cleanliness_rating": "int",
      "location_rating": "int",
      "check_in_rating": "int",
      "value_rating": "int",
      "overall_rating": "int"
    }
  ]
}
```

While this data shape made it easy to quickly add and retrieve reviews for a room, it made it much more difficult to retrieve and update user information as that information was embedded and repeated in each review.  The data was also very uniform, so I had a suspicion that a SQL based DB would suit our data really well.

With that in mind, I broke down the data and designed a new schema with a SQL database in mind.  The new schema was split into 3 tables:
![](https://i.imgur.com/gEPFvJl.png)

The room data is split into its own table, reviews data is in another, and user data is in a third table.  The big advantage is that it allows us to manage user data independently of the reviews, which would make processing updates to user names and profile pictures significantly easier.

So, with the schema laid out, I did some research on good database options for both the original document based schema and the SQL schema.  I opted to go with Arango to benchmark the document based schema as is a multi-modal database which could be beneficial in the long run.  For the SQL schema I opted to use Postgres as it offered great options for scaling and that was a concern for this project.

#### Database Benchmarking
Once I had an idea of which databases I wanted to benchmark, I seeded them with 10mil primary records (rooms) and ~170mil secondary records (1-21 reviews per room) so that we could properly benchmark performance across a broad range of indexes.

**Postgres**
As the service has only got a single API I was able to utilize a single query: _SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u ON u.id = r.user_id WHERE r.room_id = ${room_id}_
In addition to the above schema, the "room_id" column of the reviews table was also indexed, as we would be utilizing it for our query.

PLACEHOLDER RESUME HERE

#### Final Database Choice

## Server Optimization and Scaling the Service

#### Local Stress Testing

## Final Deployment Stress Testing

## How to run this projects

```sh

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

```

