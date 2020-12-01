# ThreeB&&B Reviews Service

Welcome to the Reviews service of the ThreeB&&B App!  This project is a little different from anything else on my GitHub as it was back-end focused, so a lot of the work isn't really represented in the GitHub repo.  It's also based on a legacy code base, so my work was largely confined to the database/server directories.  If you're interested in checking out my front end work, take a look at [Halvsy Gallery](https://github.com/teamchupacabramcthundercats/Halvsy-Gallery)!  A stand alone gallery service I designed from the ground up.


ThreeB&&B, pronounced ThreeB-and-B (*because software engineers are hilarious*) is an open source room reservation web app designed with service oriented architecture in mind.  ThreeB&&B and its services are built off of legacy code provided from the [Hacker Home](https://github.com/hacker-home) project.


The ThreeB&&B Reviews service utilizes the legacy code base from the [Hacker Home Reviews Service](https://github.com/hacker-home/Airbnb-reviews) to provide a stand alone reviews component for the ThreeB&&B app.  The front end of the service met my needs well enough, but I was concerned with how robust the back end was.  It was only capable of roughly **400 request per second** once deployed, which meant it was going to struggle to keep up with spikes in traffic resulting in long load times or timed out requests from our users.  Not exactly the user experience I wanted to deliver.  So, I decided to review the back end of the service and find a way to optimize the performance with a goal of the service being able to handle **1000 requests per second**.  I also wanted to try to design the back end in a way that would allow it to be scaled horizontally so that could not only ramp up to handle spikes in traffic, but could also scale down to reduce operating costs when traffic slowed.


Thus, the ThreeB&&B Reviews component was born!  The original Hacker Home Reviews front end with a slick, new, streamlined back-end.  After a bit of performance testing, I replaced the original MongoDB database for a Postgres database.  Postgres had better query speeds and allowed me to reshape the data so user data was more accessible.  The server had some unnecessary middleware removed and its routes optimized to reduce the amount of work being performed on each request.  From there I deployed the service to AWS utilizing EC2 instances for the database and service server.  The service's server image was then configured so that I could launch as many new instances of the server as I needed to help distribute traffic.  A redis cache was connected to the service between the load balancer and server which improved performance on repeat requests.  Overall, with all the changes I was able to make I was able to produce a back end capable of processing 2000 requests per second.  That was **double my original goal** and **500% faster than the legacy back end**.


Want to see all of that in a fancy graph?  Me too!

![Benchmark Graph](https://github-resources.s3-us-west-2.amazonaws.com/3bb-reviews-benchmark.png)

So... I'm sure you're wondering: Is that everything?  Heck no it's not, that was just an overview!  If you scroll just a little further down, I go over the process I utilized to design and implement the new back end.  If you're not interested in the technical jargon and were content with the overview, then I'd just like to say thank you for taking the time to check out the work I did on the ThreeB&&B Reviews service.  I hope you'll take some time to check out my other work as well.


# Table of Contents
* [The Database](#the-database)
  + [Database Benchmarking](#database-benchmarking)
    - [Postgres](#postgres)
    - [ArangoDB](#arangodb)
    - [Final Database Choice](#final-database-choice)
* [Server Optimization and Scaling the Service](#server-optimization-and-scaling-the-service)
  + [Local Stress Testing](#local-stress-testing)
  + [Final Deployment Stress Testing](#final-deployment-stress-testing)
* [Results](#results)
  

# How I did it

Alright!  On to the good stuff.  From the start, I had two primary goals:
1. Examine the original data shape and the database choice to determine if there was a more efficient option.
2. Optimize the server code and design the back end so that it could be scaled horizontally quickly and efficiently to match fluctuating traffic demands.

Since I would need to have my database selection and optimizations completed before I could begin optimizing the server performance, that was where I started!

<sub>[^Back to top](#table-of-contents)</sub>
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

<sub>[^Back to top](#table-of-contents)</sub>
### Database Benchmarking
Once I had an idea of which databases I wanted to benchmark, I seeded them with 10 million primary records (rooms) and ~170 million secondary records (1-21 reviews per room) so that we could properly benchmark performance across a broad range of indexes.

<sub>[^Back to top](#table-of-contents)</sub>
#### Postgres
As the service has only got a single API I was able to utilize a single query: 
> SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u ON u.id = r.user_id WHERE r.room_id = ${room_id}

In addition to the above schema, the "room_id" column of the reviews table was also indexed, as I would be utilizing it for my query.

I performed 3 rounds of tests targeting indexes in the first 10% of our data set, the middle of our data set, and finally the last 10% of our data set.  In each round of tests I performed 9 queries spread out across a couple of room ids.

![pg-queries-initial](https://github-resources.s3-us-west-2.amazonaws.com/pg-queries-initial.png)

<!--Initial 10%:
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
```-->

![postgres-queries-middle](https://github-resources.s3-us-west-2.amazonaws.com/pg-queries-middle.png)

<!--Middle:
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
```-->

![postgres-queries-final](https://github-resources.s3-us-west-2.amazonaws.com/pg-queries-middle.png)

<!--Final 10%:
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
```-->

Overall the queries were pretty consistent.  There were two outliers, one query at 46ms and one at 23ms.  Outside of that, we were seeing an averaged non-cached query time of ~4-5ms and an average cached query time of ~0.55ms.

<sub>[^Back to top](#table-of-contents)</sub>
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

There were two big takeaways from the Arango tests.  The first was that there was a much bigger variance in non-cached query speeds.  I was seeing anywhere from 2.64ms - 41.95ms with an average of 14ms which was roughly 300% slower than Postgres was with a much wider variance in query speeds.  The one area it did outpace Postgres was with cached queries which averaged ~0.3ms as opposed to Postgres' ~0.55ms.

<sub>[^Back to top](#table-of-contents)</sub>
#### Final Database Choice
Ultimately, Postgres fit the service's needs better than Arango did.  Normalizing our data shape to separate room and user data from our revews data opens up options for more efficient access to that data down the road.  More importantly though, even after normalizing the data Postgres outperformed Arango in non-cached queries.  Even though Arango performed better with cached queries, I'm planning on implementing a redis cache on the service which will handle all of our cached queries anyway.  While Postgres is a little clunkier to scale than Arango is, streaming replication would still be an excellent option if we need it.

Overall, because of the faster query speeds and increased access to user data, Postgres was a better fit for the service.

<sub>[^Back to top](#table-of-contents)</sub>
## Server Optimization and Scaling the Service
With my database decided, I was in a great position to start designing the back end.  The basic plan was to build out the back end with horizontal scaling in mind.

![Back-end Architecture Diagram](https://github-resources.s3-us-west-2.amazonaws.com/3bb-reviews-backend-diagram.png)
  
As you can see from the diagram, the basic plan is to scale the service servers before scaling the database.  My hope is that a single database instance will keep up with the traffic of at least a couple of service instances.  The service instances will be behind a load balancer, and will have a shared redis cache between the load balancer and service instances to help serve cached data.  I'm planning to deploy using **AWS**, with the service, database, and redis instances hosted on **EC2 t2.micro** instances.  That'll allow me to use the **AWS load balancer** for a quick, easy load balancer solution

<sub>[^Back to top](#table-of-contents)</sub>
### Local Stress Testing
With this basic structure in mind, I started with getting the service connected to the new Postgres database and run some local stress tests to see if there were any bottlenecks in the server code I could address before deploying to AWS.  Local stress testing was performed with **K6** and the **New Relic** dashboard to monitor service performance all the way through deployment.

The initial stress tests were indicating the service could handle ~600 requests per second locally.  I was able to make some server optimizations, cutting out unnecessary middleware and streamlining route handling and was able to bump that up to ~1050 requests per second.  That was encouraging, as I was sure that I'd lose some performance moving the service to the t2.micro instances, but felt that with horizontal scaling I should be able to reach my 1000 requests per second goal while deployed.

<sub>[^Back to top](#table-of-contents)</sub>
### Final Deployment Stress Testing
The next step was fairly straight forward, deploy to AWS!  Once the service was up on the EC2 instance, I made one final change the service's code, plugging in the **redis** cache as middleware on my GET routes so that repeat traffic could be served without taxing the server or database.  With the service, cache, and database now deployed to AWS, it was time for another round of stress testing.  To handle my cloud based stress testing, I switched from K6 to **loaderio**.  Since I wanted to ensure the service maintained a good user experience, even under heavy load I configured the loaderio tests as follows:
> Requests are considered a fail if it takes longer than 2 seconds to get a response.  If more than 1% of the requests fail, then the test fails.

With a single service running I was seeing about 600 request per second before the service hit a bottleneck.  Performance data on the database indicated that it wasn't being taxed too heavily at this point, so I believed I'd be able to break through my 1000 request per second goal by adding another service instance.  I began scaling the service, initially with 2 service instances running, then 4, then 6.

The sweet spot was 4 instances, providing a final performance of **2000 requests per second**.  With a single instance performance of 600 requests per second that could be quickly scaled to handle spikes in traffic up to 2000 requests per second without degradation of service for our users, I felt I had squeezed as much performance out of the back end as I could without replicating the database.

<sub>[^Back to top](#table-of-contents)</sub>
## Results

After a lot of work benchmarking and testing databases and back-end configuration, I was ultimately able to produce a back end for the service which was almost 500% faster than the legacy back end.  Not only that, but it's able to achieve that performance while allowing me to scale performance down as traffic decreases, allowing me to reduce operating costs for the service.  Not only that, but the final performance figure of 2000 requests per second was **double** my initial target of 1000 requests per second.  That means more users able to interact with our app while limiting costs during slow periods without impacting the quality of our service.  Overall, I was really happy with the results I was able to achieve.

Once more, thank you for taking the time to look through my work.  As I mentioned way up at the top of the readme, if you'd like to see some of my front end work, check out [Halvsy Gallery](https://github.com/teamchupacabramcthundercats/Halvsy-Gallery)!  Otherwise, I'm always looking to connect with people in the industry, so please don't hesitate to reach out on LinkedIn.

<a href="https://www.linkedin.com/in/joelc/" target="_blank">
  <img src="https://img.shields.io/badge/-JOEL%20CARPENTER-blue?style=for-the-badge&logo=Linkedin&logoColor=white"/>
</a>
