Table "public.reviews"
Column        |  Type   | Collation | Nullable | Default 
----------------------+---------+-----------+----------+---------
id                   | integer |           | not null | 
date                 | text    |           | not null | 
sentence             | text    |           | not null | 
accuracy_rating      | integer |           | not null | 
communication_rating | integer |           | not null | 
cleanliness_rating   | integer |           | not null | 
location_rating      | integer |           | not null | 
check_in_rating      | integer |           | not null | 
value_rating         | integer |           | not null | 
overall_rating       | integer |           | not null | 
user_id              | integer |           | not null | 
room_id              | integer |           | not null | 
Indexes:
"reviews_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
"room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
"user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.users"
Column     |  Type   | Collation | Nullable | Default 
---------------+---------+-----------+----------+---------
id            | integer |           | not null | 
name          | text    |           | not null | 
profilepicnum | integer |           | not null | 
Indexes:
"users_pkey" PRIMARY KEY, btree (id)
Referenced by:
TABLE "reviews" CONSTRAINT "user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.rooms"
Column |  Type   | Collation | Nullable | Default 
--------+---------+-----------+----------+---------
id     | integer |           | not null | 
Indexes:
   "rooms_pkey" PRIMARY KEY, btree (id)
Referenced by:
   TABLE "reviews" CONSTRAINT "room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 0;
                                                                 QUERY PLAN                                                                 
--------------------------------------------------------------------------------------------------------------------------------------------
 Gather  (cost=1000.43..4932024.12 rows=1647 width=268) (actual time=179426.567..304609.329 rows=18 loops=1)
   Workers Planned: 2
   Workers Launched: 2
   ->  Nested Loop  (cost=0.43..4930859.42 rows=686 width=268) (actual time=262874.542..304601.081 rows=6 loops=3)
         ->  Parallel Seq Scan on reviews r  (cost=0.00..4925180.96 rows=686 width=257) (actual time=262874.523..304601.039 rows=6 loops=3)
               Filter: (room_id = 0)
               Rows Removed by Filter: 40000440
         ->  Index Scan using users_pkey on users u  (cost=0.43..8.28 rows=1 width=15) (actual time=0.004..0.004 rows=1 loops=18)
               Index Cond: (id = r.user_id)
 Planning Time: 0.526 ms
 Execution Time: 304609.432 ms
(11 rows)

Time: 304625.588 ms (05:04.626)

3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
3bb-reviews-# ON u.id = r.user_id WHERE r.room_id = 0;

Time: 277524.269 ms (04:37.524)

3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 4589325;

Time: 243106.440 ms (04:03.106)

3bb-reviews=# SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9784999;

Time: 250303.737 ms (04:10.304)


/*
  ROUND 2
*/

// Setup
Table "public.reviews"
Column        |  Type   | Collation | Nullable | Default 
----------------------+---------+-----------+----------+---------
id                   | integer |           | not null | 
date                 | text    |           | not null | 
sentence             | text    |           | not null | 
accuracy_rating      | integer |           | not null | 
communication_rating | integer |           | not null | 
cleanliness_rating   | integer |           | not null | 
location_rating      | integer |           | not null | 
check_in_rating      | integer |           | not null | 
value_rating         | integer |           | not null | 
overall_rating       | integer |           | not null | 
user_id              | integer |           | not null | 
room_id              | integer |           | not null | 
Indexes:
"reviews_pkey" PRIMARY KEY, btree (id)
"room_id_btree" btree (room_id)
Foreign-key constraints:
"room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
"user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.users"
Column     |  Type   | Collation | Nullable | Default 
---------------+---------+-----------+----------+---------
id            | integer |           | not null | 
name          | text    |           | not null | 
profilepicnum | integer |           | not null | 
Indexes:
"users_pkey" PRIMARY KEY, btree (id)
Referenced by:
TABLE "reviews" CONSTRAINT "user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.rooms"
Column |  Type   | Collation | Nullable | Default 
--------+---------+-----------+----------+---------
id     | integer |           | not null | 
Indexes:
   "rooms_pkey" PRIMARY KEY, btree (id)
Referenced by:
   TABLE "reviews" CONSTRAINT "room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE


// EXPLAIN ANALYZE
3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
3bb-reviews-# ON u.id = r.user_id WHERE r.room_id = 9784990;
                                                              QUERY PLAN                                                              
--------------------------------------------------------------------------------------------------------------------------------------
 Nested Loop  (cost=1.00..13745.66 rows=1647 width=268) (actual time=0.034..0.040 rows=2 loops=1)
   ->  Index Scan using room_id_btree on reviews r  (cost=0.57..112.39 rows=1647 width=257) (actual time=0.010..0.011 rows=2 loops=1)
         Index Cond: (room_id = 9784990)
   ->  Index Scan using users_pkey on users u  (cost=0.43..8.28 rows=1 width=15) (actual time=0.011..0.011 rows=1 loops=2)
         Index Cond: (id = r.user_id)
 Planning Time: 2.611 ms
 Execution Time: 0.082 ms
(7 rows)

Time: 3.709 ms

// < 10%
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

// ~50%
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

// > 90%
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

/*
Hash indexed room_id tests
*/

// Setup

Table "public.reviews"
Column        |  Type   | Collation | Nullable | Default 
----------------------+---------+-----------+----------+---------
id                   | integer |           | not null | 
date                 | text    |           | not null | 
sentence             | text    |           | not null | 
accuracy_rating      | integer |           | not null | 
communication_rating | integer |           | not null | 
cleanliness_rating   | integer |           | not null | 
location_rating      | integer |           | not null | 
check_in_rating      | integer |           | not null | 
value_rating         | integer |           | not null | 
overall_rating       | integer |           | not null | 
user_id              | integer |           | not null | 
room_id              | integer |           | not null | 
Indexes:
"reviews_pkey" PRIMARY KEY, btree (id)
"reviews_room_id_idx" hash (room_id)
Foreign-key constraints:
"room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
"user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.users"
Column     |  Type   | Collation | Nullable | Default 
---------------+---------+-----------+----------+---------
id            | integer |           | not null | 
name          | text    |           | not null | 
profilepicnum | integer |           | not null | 
Indexes:
"users_pkey" PRIMARY KEY, btree (id)
Referenced by:
TABLE "reviews" CONSTRAINT "user_id" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

Table "public.rooms"
Column |  Type   | Collation | Nullable | Default 
--------+---------+-----------+----------+---------
id     | integer |           | not null | 
Indexes:
   "rooms_pkey" PRIMARY KEY, btree (id)
Referenced by:
   TABLE "reviews" CONSTRAINT "room_id" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE

// EXPLAIN ANALYZE

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9784990;
                                                                 QUERY PLAN                                                                  
---------------------------------------------------------------------------------------------------------------------------------------------
 Gather  (cost=1041.20..15729.91 rows=1647 width=268) (actual time=4.832..8.279 rows=2 loops=1)
   Workers Planned: 1
   Workers Launched: 1
   ->  Nested Loop  (cost=41.20..14565.21 rows=969 width=268) (actual time=1.293..1.298 rows=1 loops=2)
         ->  Parallel Bitmap Heap Scan on reviews r  (cost=40.76..6544.18 rows=969 width=257) (actual time=1.090..1.091 rows=1 loops=2)
               Recheck Cond: (room_id = 9784990)
               Rows Removed by Index Recheck: 7
               Heap Blocks: exact=2
               ->  Bitmap Index Scan on reviews_room_id_idx  (cost=0.00..40.35 rows=1647 width=0) (actual time=0.105..0.105 rows=16 loops=1)
                     Index Cond: (room_id = 9784990)
         ->  Index Scan using users_pkey on users u  (cost=0.43..8.28 rows=1 width=15) (actual time=0.202..0.202 rows=1 loops=2)
               Index Cond: (id = r.user_id)
 Planning Time: 0.131 ms
 Execution Time: 8.303 ms
(14 rows)

Time: 8.707 ms

// < 10%
3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 1;

1: Time: 9.840 ms
2: Time: 7.144 ms
3: Time: 7.627 ms
4: Time: 7.829 ms
5: Time: 9.391 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 100000;

1: Time: 45.354 ms
2: Time: 8.593 ms
3: Time: 9.777 ms
4: Time: 7.743 ms
5: Time: 7.015 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 1000000;

1: Time: 8.510 ms
2: Time: 9.781 ms
3: Time: 7.671 ms
4: Time: 6.919 ms
5: Time: 9.074 ms


// ~50%
3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 4678901;

1: Time: 8.701 ms
2: Time: 7.404 ms
3: Time: 7.213 ms
4: Time: 6.972 ms
5: Time: 8.941 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 5000000;

1: Time: 7.105 ms
2: Time: 8.414 ms
3: Time: 8.285 ms
4: Time: 7.182 ms
5: Time: 8.515 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 5555555;

1: Time: 7.958 ms
2: Time: 8.648 ms
3: Time: 6.924 ms
4: Time: 9.608 ms
5: Time: 7.987 ms


// > 90%
3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9784990;

1: Time: 8.595 ms
2: Time: 8.757 ms
3: Time: 11.724 ms
4: Time: 9.471 ms
5: Time: 13.498 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9999999;

1: Time: 14.926 ms
2: Time: 9.750 ms
3: Time: 7.183 ms
4: Time: 8.259 ms
5: Time: 8.289 ms

3bb-reviews=# EXPLAIN ANALYZE SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
ON u.id = r.user_id WHERE r.room_id = 9000000;

1: Time: 15.668 ms
2: Time: 9.547 ms
3: Time: 7.762 ms
4: Time: 9.276 ms
5: Time: 8.951 ms



/* =========================================================================================================

ARANGO DB TESTS

========================================================================================================= */

/*
NON INDEXED
*/

// Profile Query
Query String (62 chars, cacheable: false):
  FOR doc IN reviews  FILTER doc.room_id == 1000000  RETURN doc

Execution plan:
 Id   NodeType                  Calls   Items   Runtime [s]   Comment
  1   SingletonNode                 1       1       0.00001   * ROOT
  2   EnumerateCollectionNode       1       1     188.69632     - FOR doc IN reviews   /* full collection scan */   FILTER (doc.`room_id` == 1000000)   /* early pruning */
  5   ReturnNode                    1       1       0.00001       - RETURN doc

Indexes used:
 none

Optimization rules applied:
 Id   RuleName
  1   move-filters-into-enumerate

Query Statistics:
 Writes Exec   Writes Ign   Scan Full   Scan Index   Filtered   Exec Time [s]
           0            0    10000000            0    9999999       188.71145

Query Profile:
 Query Stage           Duration [s]
 initializing               0.00000
 parsing                    0.00004
 optimizing ast             0.00000
 loading collections        0.00001
 instantiating plan         0.00002
 optimizing plan            0.00856
 executing                188.69636
 finalizing                 0.00647

// < 10%
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 1000000  RETURN doc`, {}, {colors: false} );
1: Time: 188.71145s

// ~50%
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 5000000  RETURN doc`, {}, {colors: false} );
1: Time: 177.49236s

// > 90%
127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 99999999  RETURN doc`, {}, {colors: false} );
1: Time: 183.18148s

ID	      Type	        Unique	    Sparse	Extras	            Selectivity Est.	Fields	  Name	
0	        primary	      true	      false		                    100.00%	          _key	    primary	
10163785	persistent	  true	      false	  deduplicate: false	100.00%	          room_id	  room_id_persistent

/*
Persistent Index on room_id
*/

// Query profile

Query String (63 chars, cacheable: false):
  FOR doc IN reviews  FILTER doc.room_id == 99999999  RETURN doc

Execution plan:
 Id   NodeType        Calls   Items   Runtime [s]   Comment
  1   SingletonNode       1       1       0.00001   * ROOT
  6   IndexNode           1       0       0.00004     - FOR doc IN reviews   /* persistent index scan */    
  5   ReturnNode          1       0       0.00001       - RETURN doc

Indexes used:
 By   Name                 Type         Collection   Unique   Sparse   Selectivity   Fields          Ranges
  6   room_id_persistent   persistent   reviews      true     false       100.00 %   [ `room_id` ]   (doc.`room_id` == 99999999)

Optimization rules applied:
 Id   RuleName
  1   use-indexes
  2   remove-filter-covered-by-index
  3   remove-unnecessary-calculations-2

Query Statistics:
 Writes Exec   Writes Ign   Scan Full   Scan Index   Filtered   Exec Time [s]
           0            0           0            0          0         0.00632

Query Profile:
 Query Stage           Duration [s]
 initializing               0.00000
 parsing                    0.00004
 optimizing ast             0.00000
 loading collections        0.00001
 instantiating plan         0.00001
 optimizing plan            0.00615
 executing                  0.00006
 finalizing                 0.00005

 // < 10%
 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 999999  RETURN doc`, {}, {colors: false} );
 
 1: Time: 2.87ms
 2: Time: 0.28ms
 3: Time: 0.29ms

 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 999  RETURN doc`, {}, {colors: false} );

 1: Time: 13.91ms
 2: Time: 0.31ms
 3: Time: 0.46ms

 // ~50%
 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 4999999  RETURN doc`, {}, {colors: false} );

 1: Time: 5.03ms
 2: Time: 0.29ms
 3: Time: 0.30ms

 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 5999999  RETURN doc`, {}, {colors: false} );

 1: Time: 20.08ms
 2: Time: 0.29ms
 3: Time: 0.31ms

 // > 90%
 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 9999999  RETURN doc`, {}, {colors: false} );

 1: Time: 11.54ms
 2: Time: 0.28ms
 3: Time: 2.64ms

 127.0.0.1:8529@reviews> db._profileQuery(` FOR doc IN reviews  FILTER doc.room_id == 9599999  RETURN doc`, {}, {colors: false} );

 1: Time: 41.95ms
 2: Time: 0.29ms
 3: Time: 0.29ms