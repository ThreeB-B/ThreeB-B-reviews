# ThreeB&&B Reviews Component

[](Welcome to ThreeB&&B Reviews!  This page serves as the landing page for the reviews component of the ThreeB&&B app.  The reviews component was derived from the open source Hacker Home reviews component.  While the original component provided the React component I needed, I found that the back end didn't meet my performance needs.  It was only capable of roughly **400 request per second** once deployed, which meant it was going to struggle to keep up with spikes in traffic resulting in long load times or timed out requests from our users.  Not exactly the user experience I wanted to deliver.  So, I decided to review the back end of the service and find a way to optimize the performance with a goal of the service being able to handle **1000 requests per second**.  I also wanted to try to design the back end in a way that would allow it to be scaled horizontally so that when traffic slowed we could scale back deployment to reduce operating costs.)

[](Thus, the ThreeB&&B Reviews component was born.  All of the front end code is derived from the original Hacker Home reviews component with only minor changes to ensure compatibility with the back end.  The bulk of my work was on the back end, which can be found in the server and database directories.  As part of the overhaul, I swapped out the MongoDB database for a Postgres database, which had better query speeds and allowed me to reshape the data so user data was more accessible.  The server had some unnecessary middleware removed and its routes optimized to reduce the amount of work being performed on each request.  From there I deployed the service to AWS utilizing EC2 instances for the database and service server.  The service's server image was then configured so that I could launch as many new instances of the server as I needed to help distribute traffic.  A redis cache was connected to the service between the load balancer and server which improved performance on repeat requests.  Overall, with all the changes I was able to make I was able to produce a back end capable of 2000 requests per second.  That was **double my original goal** and **500% faster than the legacy back end**.)

So... I gave a brief overview above that covers the end results, but how did I accomplish that?  What work went into those decisions?  If you'd like to find out more, just keep on scrolling down!  I go into detail about my decision making process and the metrics I used to inform those decisions.

If you got your TL:DR itch scratched by the overview, then thank you for taking the time to check out my work.  I hope you found it useful!

# How I did it

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

#### Postgres
As the service has only got a single API I was able to utilize a single query: 
> SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u ON u.id = r.user_id WHERE r.room_id = ${room_id}

In addition to the above schema, the "room_id" column of the reviews table was also indexed, as I would be utilizing it for my query.

I performed 3 rounds of tests targeting indexes in the first 10% of our data set, the middle of our data set, and finally the last 10% of our data set.  In each round of tests I performed 9 queries spread out across a couple of room ids.

Initial 10%:
```Javascript
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 100784;
1: Time: 46.075 ms
2: Time: 8.401 ms
3: Time: 3.065 ms
 
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 1007082;
1: Time: 3.143 ms
2: Time: 2.135 ms
3: Time: 0.406 ms
 
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 2;
1: Time: 5.197 ms
2: Time: 6.931 ms
3: Time: 5.772 ms
```

Middle:
```Javascript
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 5555555;
1: Time: 5.783 ms
2: Time: 0.429 ms
3: Time: 0.379 ms
 
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 5555510;
1: Time: 2.763 ms
2: Time: 0.726 ms
3: Time: 0.747 ms
 
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 4545410;
1: Time: 3.501 ms
2: Time: 0.773 ms
3: Time: 0.621 ms
```

Final 10%:
```Javascript
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9784999;
 
1: Time: 23.597 ms
2: Time: 0.449 ms
3: Time: 5.667 ms
4: Time: 0.631 ms
5: Time: 0.379 ms
6: Time: 2.265 ms
 
3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9784990;
 
1: Time: 2.197 ms
2: Time: 2.251 ms
3: Time: 0.505 ms
```

Overall the queries were pretty consistent.  There were two outliers, one query at 46ms and one at 23ms.  Outside of that, we were seeing an averaged non-cached query time of ~4-5ms and an average cached query time of ~0.55ms.

#### ArangoDB
Our schema for Arango is simpler as we're leveraging its capability as a document store, which helps simplify my query.  Just like with Postgres, I've indexed the room_id as that's going to be what our query is based off of.

The query I'll be using is:
> FOR doc IN reviews  FILTER doc.room_id == ${room_id}  RETURN doc

The tests are structured the same as the Postgres tests where I'll be querying data in the first 10%, middle, and final 10% of my data set.  The only difference is that I opted to run 6 queries per section instead of the 9 I ran with Postgres.

Initial 10%
```Javascript
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 999999  RETURN doc`, {}, {colors: false} );
1: Time: 2.87ms
2: Time: 0.28ms
3: Time: 0.29ms
 
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 999  RETURN doc`, {}, {colors: false} );
 
1: Time: 13.91ms
2: Time: 0.31ms
3: Time: 0.46ms
```

Middle
```Javascript
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 4999999  RETURN doc`, {}, {colors: false} );
 
1: Time: 5.03ms
2: Time: 0.29ms
3: Time: 0.30ms
 
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 5999999  RETURN doc`, {}, {colors: false} );
 
1: Time: 20.08ms
2: Time: 0.29ms
3: Time: 0.31ms
```

Final 10%
```Javascript
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 9999999  RETURN doc`, {}, {colors: false} );
 
1: Time: 11.54ms
2: Time: 0.28ms
3: Time: 2.64ms
 
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 9599999  RETURN doc`, {}, {colors: false} );
 
1: Time: 41.95ms
2: Time: 0.29ms
3: Time: 0.29ms
```

There were two big takeaways from the Arango tests.  The first was that there was a much bigger variance in non-cached query speeds.  I was seeing anywhere from 2.64ms - 41.95ms with an average of 14ms which was roughly 300% slower than Postgres was with a much wider variance in query speeds.  The one area it did ourpace Postgres was with cached queries which averaged ~0.3ms as opposed to Postgres' ~0.55ms.

#### Final Database Choice
Ultimately, Postgres fit the service's needs better than Arango did.  Normalizing our data shape to separate room and user data from our revews data opens up options for more efficient access to that data down the road.  More importantly though, even after normalizing the data Postgres outperformed Arango in non-cached queries.  Even though Arango performed better with cached queries, I'm planning on implementing a redis cache on the service which will handle all of our cached queries anyway.  While Postgres is a little clunkier to scale than Arango is, streaming replication would still be an excellent option if we need it.

Overall, because of the faster query speeds and increased access to user data, Postgres was a better fit for the service.

## Server Optimization and Scaling the Service
With my database decided, I was in a great position to start designing the back end.  The basic plan was to build out the back end with horizontal scaling in mind.

<INSERT DIAGRAM>
  
As you can see from the diagram, the basic plan is to scale the service servers before scaling the database.  My hope is that a single database instance will keep up with the traffic of at least a couple of service instances.  The service instances will be behind a load balancer, and will have a shared redis cache between the load balancer and service instances to help serve cached data.  I'm planning to deploy using **AWS**, with the service, database, and redis instances hosted on **EC2 t2.micro** instances.  That'll allow me to use the **AWS load balancer** for a quick, easy load balancer solution

#### Local Stress Testing
With this basic structure in mind, I started with getting the service connected to the new Postgres database and run some local stress tests to see if there were any bottlenecks in the server code I could address before deploying to AWS.  Local stress testing was performed with **K6** and the **New Relic** dashboard to monitor service performance all the way through deployment.

The initial stress tests were indicating the service could handle ~600 requests per second locally.  I was able to make some server optimizations, cutting out unnecessary middleware and streamlining route handling and was able to bump that up to ~1050 requests per second.  That was encouraging, as I was sure that I'd lose some performance moving the service to the t2.micro instances, but felt that with horizontal scaling I should be able to reach my 1000 requests per second goal while deployed.

## Final Deployment Stress Testing
The next step was fairly straight forward, deploy to AWS!  Once the service was up on the EC2 instance, I made one final change the service's code, plugging in the **redis** cache as middleware on my GET routes so that repeat traffic could be served without taxing the server or database.  With the service, cache, and database now deployed to AWS, it was time for another round of stress testing.  To handle my cloud based stress testing, I switched from K6 to **loaderio**.  The loaderio stress test was configured to consider any request that took longer than 2s to receive a response a failure, and an overall failed test if there was more than a 1% failure rate on the requests.  With that set, it was time to establish a base line for a single service instance.

With a single service running I was seeing about 600 request per second before the service hit a bottleneck.  Performance data on the database indicated that it wasn't being taxed too heavily at this point, so I believed I'd be able to break through my 1000 request per second goal by adding another service instance.  I began scaling the service, initially with 2 service instances running, then 4, then 6.

The sweet spot was 4 instances, providing a final performance of **2000 requests per second**.  With a single instance performance of 600 requests per second that could be quickly scaled to handle spikes in traffic up to 2000 requests per second without degradation of service for our users, my work on the project was complete.  Not only was I able to meet my goal of 1000 requests per second, but I was able to provide a back end that could handle twice that much traffic, all while being capable of scaling back down as traffic decreases to minimize operation costs.

## How to run this projects


## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#Requirements)
1. [Development](#Development)

## Usage

> Some usage instructions

## Requirements

## Development

### Installing Dependencies

