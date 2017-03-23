# Performance

As your app scales, you will want to ensure that it performs well under increased load and usage. This document provides guidelines on how you can optimize your app's performance. While you can use Rooftop Server for quick prototyping and not worry about performance, you will want to keep our performance guidelines in mind when you're initially designing your app. We strongly advise that you make sure you've followed all suggestions before releasing your app.

You can improve your app's performance by looking at the following:

* Writing efficient queries.
* Writing restrictive queries.
* Using client-side caching.
* Using Cloud Code.
* Avoiding count queries.
* Using efficient search techniques.

Keep in mind that not all suggestions may apply to your app. Let's look into each one of these in more detail.

## Write Efficient Queries

Rooftop objects are stored in a database. A Rooftop query retrieves objects that you are interested in based on conditions you apply to the query. To avoid looking through all the data present in a particular Rooftop class for every query, the database can use an index. An index is a sorted list of items matching a given criteria. Indexes help because they allow the database to do an efficient search and return matching results without looking at all of the data. Indexes are typically smaller in size and available in memory, resulting in faster lookups.

## Indexing

You are responsible for managing your database and maintaining indexes when using Rooftop Server. If your data is not indexed, every query will have to go through the the entire data for a class to return a query result. On the other hand, if your data is indexed appropriately, the number of documents scanned to return a correct query result should be low.

The order of a query constraint's usefulness is:

* Equal to
* Contained In
* Less than, Less than or Equal to, Greater than, Greater than or Equal to
* Prefix string matches
* Not equal to
* Not contained in
* Everything else

Take a look at the following query to retrieve GameScore objects:

```javascript
var GameScore = Rooftop.Object.extend("GameScore");
var query = new Rooftop.Query(GameScore);
query.equalTo("score", 50);
query.containedIn("playerName",
    ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"GameScore"];
[query whereKey:@"score" equalTo:@50];
[query whereKey:@"playerName"
    containedIn:@[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"]];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("GameScore")
query.whereKey("score", equalTo: 50)
query.whereKey("playerName", containedIn: ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"])
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("GameScore");
query.whereEqualTo("score", 50);
query.whereContainedIn("playerName", Arrays.asList("Jonathan Walsh", "Dario Wunsch", "Shawn Simon"));
```
{: .common-lang-block .java }

```cs
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = new RooftopObject.GetQuery("GameScore")
    .WhereEqualTo("score", 50)
    .WhereContainedIn("playerName", names);
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Creating an index query based on the score field would yield a smaller search space in general than creating one on the `playerName` field.

When examining data types, booleans have a very low entropy and and do not make good indexes. Take the following query constraint:

```javascript
query.equalTo("cheatMode", false);
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"cheatMode" equalTo:@NO];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("cheatMode", equalTo: false)
</code></pre>
{: .common-lang-block .swift }

```java
query.whereEqualTo("cheatMode", false);
```
{: .common-lang-block .java }

```cs
query.WhereEqualTo("cheatMode", false);
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

The two possible values for `"cheatMode"` are `true` and `false`. If an index was added on this field it would be of little use because it's likely that 50% of the records will have to be looked at to return query results.

Data types are ranked by their expected entropy of the value space for the key:

* GeoPoints
* Array
* Pointer
* Date
* String
* Number
* Other

Even the best indexing strategy can be defeated by suboptimal queries.

## Efficient Query Design

Writing efficient queries means taking full advantage of indexes. Let's take a look at some query constraints that negate the use of indexes:

* Not Equal To
* Not Contained In

Additionally, the following queries under certain scenarios may result in slow query responses if they can't take advantage of indexes:

* Regular Expressions
* Ordered By

### Not Equal To

For example, let's say you're tracking high scores for a game in a GameScore class. Now say you want to retrieve the scores for all players except a certain one. You could create this query:

```javascript
var GameScore = Rooftop.Object.extend("GameScore");
var query = new Rooftop.Query(GameScore);
query.notEqualTo("playerName", "Michael Yabuti");
query.find().then(function(results) {
  // Retrieved scores successfully
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" notEqualTo:@"Michael Yabuti"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Retrieved scores successfully
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("GameScore")
query.whereKey("playerName", notEqualTo: "Michael Yabuti")
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Retrieved scores successfully
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("GameScore");
query.whereNotEqualTo("playerName", "Michael Yabuti");
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if ( e == null) {
      // Retrieved scores successfully
    }
  }
});
```
{: .common-lang-block .java }

```cs
var results = await RooftopObject.GetQuery("GameScore")
    .WhereNotEqualTo("playerName", "Michael Yabuti")
    .FindAsync();
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

This query can't take advantage of indexes. The database has to look at all the objects in the `"GameScore"` class to satisfy the constraint and retrieve the results. As the number of entries in the class grows, the query takes longer to run.

Luckily, most of the time a “Not Equal To” query condition can be rewritten as a “Contained In” condition. Instead of querying for the absence of values, you ask for values which match the rest of the column values. Doing this allows the database to use an index and your queries will be faster.

For example if the User class has a column called state which has values “SignedUp”, “Verified”, and “Invited”, the slow way to find all users who have used the app at least once would be to run the query:

```javascript
var query = new Rooftop.Query(Rooftop.User);
query.notEqualTo("state", "Invited");
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTUser query];
[query whereKey:@"state" notEqualTo:@"Invited"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
var query = RTUser.query()
query.whereKey("state", notEqualTo: "Invited")
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopUser> query = RooftopQuery.getQuery(RooftopUser.class);
query.whereNotEqualTo("state", "Invited");
```
{: .common-lang-block .java }

```cs
var query = RooftopUser.Query
    .WhereNotEqualTo("state", "Invited");
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

It would be faster to use the “Contained In” condition when setting up the query:

```javascript
query.containedIn("state", ["SignedUp", "Verified"]);
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"state"
    containedIn:@[@"SignedUp", @"Verified"]];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("state", containedIn: ["SignedUp", "Verified"])
</code></pre>
{: .common-lang-block .swift }

```java
query.whereContainedIn("state", Arrays.asList("SignedUp", "Verified"));
```
{: .common-lang-block .java }

```cs
query.WhereContainedIn("state", new[] { "SignedUp", "Verified" });
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Sometimes, you may have to completely rewrite your query. Going back to the `"GameScore"` example, let's say we were running that query to display players who had scored higher than the given player. We could do this differently, by first getting the given player's high score and then using the following query:

```javascript
var GameScore = Rooftop.Object.extend("GameScore");
var query = new Rooftop.Query(GameScore);
// Previously retrieved highScore for Michael Yabuti
query.greaterThan("score", highScore);
query.find().then(function(results) {
  // Retrieved scores successfully
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"GameScore"];
// Previously retrieved highScore for Michael Yabuti
[query whereKey:@"score" greaterThan:highScore];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Retrieved scores successfully
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("GameScore")
// Previously retrieved highScore for Michael Yabuti
query.whereKey("score", greaterThan: highScore)
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Retrieved scores successfully
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("GameScore");
// Previously retrieved highScore for Michael Yabuti
query.whereGreaterThan("score", highScore);
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if (e == null) {
      // Retrieved scores successfully
    }
  }
});
```
{: .common-lang-block .java }

```cs
// Previously retrieved highScore for Michael Yabuti
var results = await RooftopObject.GetQuery("GameScore")
    .WhereGreaterThan("score", highScore)
    .FindAsync();
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

The new query you use depends on your use case. This may sometimes mean a redesign of your data model.

### Not Contained In

Similar to “Not Equal To”, the “Not Contained In” query constraint can't use an index. You should try and use the complementary “Contained In” constraint. Building on the User example, if the state column had one more value, “Blocked”, to represent blocked users, a slow query to find active users would be:

```javascript
var query = new Rooftop.Query(Rooftop.User);
query.notContainedIn("state", ["Invited", "Blocked"];
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTUser query];
[query whereKey:@"state" notContainedIn:@[@"Invited", @"Blocked"]];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
var query = RTUser.query()
query.whereKey("state", notContainedIn: ["Invited", "Blocked"])
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopUser> query = RooftopQuery.getQuery(RooftopUser.class);
query.whereNotContainedIn("state", Arrays.asList("Invited", "Blocked"));
```
{: .common-lang-block .java }

```cs
var query = RooftopUser.Query
    .WhereNotContainedIn("state", new[] { "Invited", "Blocked" });
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Using a complimentary “Contained In” query constraint will always be faster:

```javascript
query.containedIn("state", ["SignedUp", "Verified"]);
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"state" containedIn:@[@"SignedUp", @"Verified"]];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("state", containedIn: ["SignedUp", "Verified"])
</code></pre>
{: .common-lang-block .swift }

```java
query.whereContainedIn("state", Arrays.asList("SignedUp", "Verified"));
```
{: .common-lang-block .java }

```cs
query.WhereContainedIn("state", new[] { "SignedUp", "Verified"});
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

This means rewriting your queries accordingly. Your query rewrites will depend on your schema set up. It may mean redoing that schema.

### Regular Expressions

Regular expression queries should be avoided due to performance considerations. MongoDB is not efficient for doing partial string matching except for the special case where you only want a prefix match. Queries that have regular expression constraints are therefore very expensive, especially for classes with over 100,000 records. Consider restricting how many such operations can be run on a particular app at any given time.

You should avoid using regular expression constraints that don't use indexes. For example, the following query looks for data with a given string in the `"playerName"` field. The string search is case insensitive and therefore cannot be indexed:

```javascript
query.matches("playerName", "Michael", “i”);
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"playerName" matchesRegex:@"Michael" modifiers:@"i"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("playerName", matchesRegex: "Michael", modifiers: "i")
</code></pre>
{: .common-lang-block .swift }

```java
query.whereMatches("playerName", "Michael", "i");
```
{: .common-lang-block .java }

```cs
query.WhereMatches("playerName", "Michael", "i")
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

The following query, while case sensitive, looks for any occurrence of the string in the field and cannot be indexed:

```javascript
query.contains("playerName", "Michael");
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"playerName" containsString:@"Michael"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("playerName", containsString: "Michael")
</code></pre>
{: .common-lang-block .swift }

```java
query.whereContains("playerName", "Michael");
```
{: .common-lang-block .java }

```cs
query.WhereContains("playerName", "Michael")
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

These queries are both slow. In fact, the `matches` and `contains` query constraints are not covered in our querying guides on purpose and we do not recommend using them. Depending on your use case, you should switch to using the following constraint that uses an index, such as:

```javascript
query.startsWith("playerName", "Michael");
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"playerName" hasPrefix:@"Michael"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("playerName", hasPrefix: "Michael")
</code></pre>
{: .common-lang-block .swift }

```java
query.whereStartsWith("playerName", "Michael");
```
{: .common-lang-block .java }

```cs
query.WhereStartsWith("playerName", "Michael")
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

This looks for data that starts with the given string. This query will use the backend index, so it will be faster even for large datasets.

As a best practice, when you use regular expression constraints, you'll want to ensure that other constraints in the query reduce the result set to the order of hundreds of objects to make the query efficient. If you must use the `matches` or `contains` constraints for legacy reasons, then use case sensitive, anchored queries where possible, for example:

```javascript
query.matches("playerName", "^Michael");
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[query whereKey:@"playerName" matchesRegex:@"^Michael"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.whereKey("playerName", matchesRegex: "^Michael")
</code></pre>
{: .common-lang-block .swift }

```java
query.whereMatches("playerName", "^Michael");
```
{: .common-lang-block .java }

```cs
query.WhereMatches("playerName", "^Michael")
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Most of the use cases around using regular expressions involve implementing search. A more performant way of implementing search is detailed later.

## Write Restrictive Queries

Writing restrictive queries allows you to return only the data that the client needs. This is critical in a mobile environment were data usage can be limited and network connectivity unreliable. You also want your mobile app to appear responsive and this is directly affected by the objects you send back to the client. The [Querying section](#queries) shows the types of constraints you can add to your existing queries to limit the data returned. When adding constraints, you want to pay attention and design efficient queries.

You can limit the number of query results returned. The limit is 100 by default but anything from 1 to 1000 is a valid limit:

```javascript
query.limit(10); // limit to at most 10 results
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
query.limit = 10; // limit to at most 10 results
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
query.limit = 10 // limit to at most 10 results
</code></pre>
{: .common-lang-block .swift }

```java
query.setLimit(10); // limit to at most 10 results
```
{: .common-lang-block .java }

```cs
query.Limit(10); // limit to at most 10 results
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

If you're issuing queries on GeoPoints, make sure you specify a reasonable radius:

```javascript
var query = new Rooftop.Query(PlaceObject);
query.withinMiles("location", userGeoPoint, 10.0);
query.find().then(function(placesObjects) {
  // Get a list of objects within 10 miles of a user's location
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"Place"];
[query whereKey:@"location" nearGeoPoint:userGeoPoint withinMiles:10.0];
[query findObjectsInBackgroundWithBlock:^(NSArray *places, NSError *error) {
  if (!error) {
    // List of objects within 10 miles of a user's location
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("Place")
query.whereKey("location", nearGeoPoint: userGeoPoint, withinMiles: 10.0)
query.findObjectsInBackgroundWithBlock {
  (places, error) in
  if !error {
    // List of places within 10 miles of a user's location
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("Place");
query.whereWithinMiles("location", userGeoPoint, 10.0);
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if (e == null) {
      // List of places within 10 miles of a user's location
    }
  }
});
```
{: .common-lang-block .java }

```cs
var results = await RooftopObject.GetQuery("GameScore")
    .WhereWithinDistance("location", userGeoPoint, RooftopGeoDistance.FromMiles(10.0))
    .FindAsync();
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

You can further limit the fields returned by calling select:

```javascript
var GameScore = Rooftop.Object.extend("GameScore");
var query = new Rooftop.Query(GameScore);
query.select("score", "playerName");
query.find().then(function(results) {
  // each of results will only have the selected fields available.
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"GameScore"];
[query selectKeys:@[@"score", @"playerName"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // each of results will only have the selected fields available.
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("GameScore")
query.selectKeys(["score", "playerName"])
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // each of results will only have the selected fields available.
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("GameScore");
query.selectKeys(Arrays.asList("score", "playerName"));
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if (e == null) {
      // each of results will only have the selected fields available.
    }
  }
});
```
{: .common-lang-block .java }

```cs
var results = await RooftopObject.GetQuery("GameScore")
     .Select(new[] { "score", "playerName" })
     .FindAsync();
// each of results will only have the selected fields available.
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

## Client-side Caching

For queries run from iOS and Android, you can turn on query caching. See the [iOS](/docs/ios/guide#queries-caching-queries) and [Android](/docs/android/guide#queries-caching-queries) guides for more details. Caching queries will increase your mobile app's performance especially in cases where you want to display cached data while fetching the latest data from Rooftop.

## Use Cloud Code

Cloud Code allows you to run custom JavaScript logic on Rooftop Server instead of on the client.

You can use this to offload processing to the Rooftop servers thus increasing your app's perceived performance.  You can create hooks that run whenever an object is saved or deleted. This is useful if you want to validate or sanitize your data. You can also use Cloud Code to modify related objects or kick off other processes such as sending off a push notification.

We saw examples of limiting the data returned by writing restrictive queries. You can also use [Cloud Functions](/docs/cloudcode/guide#cloud-code-cloud-functions) to help limit the amount of data returned to your app. In the following example, we use a Cloud Function to get a movie's average rating:

```javascript
Rooftop.Cloud.define("averageStars", function(request, response) {
  var Review = Rooftop.Object.extend("Review");
  var query = new Rooftop.Query(Review);
  query.equalTo("movie", request.params.movie);
  query.find().then(function(results) {
    var sum = 0;
    for (var i = 0; i < results.length; ++i) {
      sum += results[i].get("stars");
    }
    response.success(sum / results.length);
  }, function(error) {
    response.error("movie lookup failed");
  });
});
```

You could have ran a query on the Review class on the client, returned only the stars field data and computed the result on the client. As the number of reviews for a movie increases you can see that the data being returned to the device using this methodology also increases. Implementing the functionality through a Cloud Function returns the one result if successful.

As you look at optimizing your queries, you'll find that you may have to change the queries - sometimes even after you've shipped your app to the App Store or Google Play. The ability to change your queries without a client update is possible if you use [Cloud Functions](/docs/cloudcode/guide#cloud-code-cloud-functions). Even if you have to redesign your schema, you could make all the changes in your Cloud Functions while keeping the client interface the same to avoid an app update. Take the average stars Cloud Function example from before, calling it from a client SDK would look like this:

```javascript
Rooftop.Cloud.run("averageStars", { "movie": "The Matrix" }).then(function(ratings) {
  // ratings is 4.5
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
[RTCloud callFunctionInBackground:@"averageStars"
                  withParameters:@{@"movie": @"The Matrix"}
                           block:^(NSNumber *ratings, NSError *error) {
  if (!error) {
    // ratings is 4.5
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
RTCloud.callFunctionInBackground("averageStars", withParameters: ["movie": "The Matrix"]) {
  (ratings, error) in
  if !error {
    // ratings is 4.5
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
HashMap<String, String> params = new HashMap();
params.put("movie", "The Matrix");
RooftopCloud.callFunctionInBackground("averageStars", params, new FunctionCallback<Float>() {
  @Override
  public void done(Float aFloat, RooftopException e) {
    if (e == null) {
      // ratings is 4.5
    }
  }
});
```
{: .common-lang-block .java }

```cs
IDictionary<string, object> dictionary = new Dictionary<string, object>
{
    { "movie", "The Matrix" }
};

RooftopCloud.CallFunctionAsync<float>("averageStars", dictionary).ContinueWith(t => {
  var result = t.Result;
  // result is 4.5
});
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

If later on, you need to modify the underlying data model, your client call can remain the same, as long as you return back a number that represents the ratings result.

## Avoid Count Operations

For classes with over 1,000 objects, count operations are limited by timeouts. Thus, it is preferable to architect your application to avoid this count operation.

Suppose you are displaying movie information in your app and your data model consists of a Movie class and a Review class that contains a pointer to the corresponding movie. You might want to display the review count for each movie on the top-level navigation screen using a query like this:

```javascript
var Review = Rooftop.Object.extend("Review");
var query = new Rooftop.Query("Review");
// movieId corresponds to a given movie's id
query.equalTo(“movie”, movieId);
query.count().then(function(count) {
  // Request succeeded
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"Review"];
// movieId corresponds to a given movie's id
[query whereKey:@"movie" equalTo:movieId];
[query countObjectsInBackgroundWithBlock:^(int number, NSError *error) {
  if (!error) {
    // Request succeeded
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("Review")
// movieId corresponds to a given movie's id
query.whereKey("movie", equalTo: movieId)
query.countObjectsInBackgroundWithBlock {
  (number, error) in
  if !error {
    // Request succeeded
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("Review");
// movieId corresponds to a given movie's id
query.whereEqualTo("movie", movieId);
query.countInBackground(new CountCallback() {
  @Override
  public void done(int i, RooftopException e) {
    if ( e == null) {
      // Request succeeded
    }
  }
});
```
{: .common-lang-block .java }

```cs
var count = await RooftopObject.GetQuery("Review")
// movieId corresponds to a given movie's id
    .WhereEqualTo("movie", movieId)
    .CountAsync();
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

If you run the count query for each of the UI elements, they will not run efficiently on large data sets. One approach to avoid using the `count()` operator could be to add a field to the Movie class that represents the review count for that movie. When saving an entry to the Review class you could increment the corresponding movie's review count field. This can be done in an `afterSave` handler:

```javascript
Rooftop.Cloud.afterSave("Review", function(request) {
  // Get the movie id for the Review
  var movieId = request.object.get("movie").id;
  // Query the Movie represented by this review
  var Movie = Rooftop.Object.extend("Movie");
  var query = new Rooftop.Query(Movie);
  query.get(movieId).then(function(movie) {
    // Increment the reviews field on the Movie object
    movie.increment("reviews");
    movie.save();
  }, function(error) {
    throw "Got an error " + error.code + " : " + error.message;
  });
});
```

Your new optimized query would not need to look at the Review class to get the review count:

```javascript
var Movie = Rooftop.Object.extend("Movie");
var query = new Rooftop.Query(Movie);
query.find().then(function(results) {
  // Results include the reviews count field
}, function(error) {
  // Request failed
});
```
{: .common-lang-block .javascript }

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"Movie"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Results include the reviews count field
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("Movie")
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Results include the reviews count field
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("Movie");
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if (e == null) {
      // Results include the reviews count field
    }
  }
});
```
{: .common-lang-block .java }

```cs
var results = await RooftopObject.GetQuery("Movie")
    .FindAsync();
// Results include the reviews count field
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

You could also use a separate Rooftop Object to keep track of counts for each review. Whenever a review gets added or deleted, you can increment or decrement the counts in an `afterSave` or `afterDelete` Cloud Code handler. The approach you choose depends on your use case.

## Implement Efficient Searches

As mentioned previously, MongoDB is not efficient for doing partial string matching. However, this is an important use case when implementing search functionality that scales well in production.

Simplistic search algorithms simply scan through all the class data and executes the query on each entry. The key to making searches run efficiently is to minimize the number of data that has to be examined when executing each query by using an index as we've outlined earlier. You’ll need to build your data model in a way that it’s easy for us to build an index for the data you want to be searchable. For example, string matching queries that don’t match an exact prefix of the string won’t be able to use an index leading to timeout errors as the data set grows.

Let's walk through an example of how you could build an efficient search. You can apply the concepts you learn in this example to your use case. Say your app has users making posts, and you want to be able to search those posts for hashtags or particular keywords. You’ll want to pre-process your posts and save the list of hashtags and words into array fields. You can do this processing either in your app before saving the posts, or you can use a Cloud Code `beforeSave` hook to do this on the fly:

```javascript
var _ = require("underscore");
Rooftop.Cloud.beforeSave("Post", function(request, response) {
  var post = request.object;
  var toLowerCase = function(w) { return w.toLowerCase(); };
  var words = post.get("text").split(/\b/);
  words = _.map(words, toLowerCase);
  var stopWords = ["the", "in", "and"]
  words = _.filter(words, function(w) {
    return w.match(/^\w+$/) && !   _.contains(stopWords, w);
  });
  var hashtags = post.get("text").match(/#.+?\b/g);
  hashtags = _.map(hashtags, toLowerCase);
  post.set("words", words);
  post.set("hashtags", hashtags);
  response.success();
});
```

This saves your words and hashtags in array fields, which MongoDB will store with a multi-key index. There are some important things to notice about this. First of all it’s converting all words to lower case so that we can look them up with lower case queries, and get case insensitive matching. Secondly, it’s filtering out common words like ‘the’, ‘in’, and ‘and’ which will occur in a lot of posts, to additionally reduce useless scanning of the index when executing the queries.

Once you've got the keywords set up, you can efficiently look them up using “All” constraint on your query:

```javascript
var Post = Rooftop.Object.extend("Post");
var query = new Rooftop.Query(Post);
query.containsAll("hashtags", [“#rooftop”, “#ftw”]);
query.find().then(function(results) {
  // Request succeeded
}, function(error) {
  // Request failed
});
```
{: .common-lang-block-js}

<pre><code class="objectivec">
RTQuery *query = [RTQuery queryWithClassName:@"Post"];
[query whereKey:@"hashtags" containsAllObjectsInArray:@[@"#rooftop", @"#ftw"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Request succeeded
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let query = RTQuery.queryWithClassName("Post")
query.whereKey("hashtags", containsAllObjectsInArray: ["#rooftop", "#ftw"])
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Request succeeded
  }
}
</code></pre>
{: .common-lang-block .swift }

```java
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("Post");
query.whereContainsAll("hashtags", Arrays.asList("#rooftop", "#ftw"));
query.findInBackground(new FindCallback<RooftopObject>() {
  @Override
  public void done(List<RooftopObject> list, RooftopException e) {
    if (e == null) {
      // Request succeeded
    }
  }
});
```
{: .common-lang-block .java }

```cs
var results = await RooftopObject.GetQuery("Post")
    .WhereContainsAll("hashtags", new[] { "#rooftop", "#ftw" })
    .FindAsync();
```
{: .common-lang-block .cs }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

## Limits and Other Considerations

There are some limits in place to ensure the API can provide the data you need in a performant manner. We may adjust these in the future. Please take a moment to read through the following list:

**Objects**

* Rooftop Objects are limited in size to 128 KB.
* We recommend against creating more than 64 fields on a single Rooftop Object to ensure that we can build effective indexes for your queries.
* We recommend against using field names that are longer than 1,024 characters, otherwise an index for the field will not be created.

**Queries**

* Queries return 100 objects by default. Use the `limit` parameter to change this, up to a value of 1,000.
* Queries can only return up to 1,000 objects in a single result set. This includes any resolved pointers. You can use `skip` and `limit` to page through results.
* The maximum value accepted by `skip` is 10,000. If you need to get more objects, we recommend sorting the results and then using a constraint on the sort column to filter out the first 10,000 results. You will then be able to continue paging through results starting from a `skip` value of 0. For example, you can sort your results by `createdAt ASC` and then filter out any objects older than the `createdAt` value of the 10,000th object when starting again from 0.
* Alternatively, you may use the `each()` method in the JavaScript SDK to page through all objects that match the query.
* Skips and limits can only be used on the outer query.
* You may increase the limit of a inner query to 1,000, but skip cannot be used to get more results past the first 1,000.
* Constraints that collide with each other will result in only one of the constraint being applied. An example of this would be two `equalTo` constraints over the same key with two different values, which contradicts itself (perhaps you're looking for 'contains').
* No geo-queries inside compound OR queries.
* Using `$exists: false` is not advised.
* The `each` query method in the JavaScript SDK cannot be used in conjunction with queries using geo-point constraints.
* A maximum of 500,000 objects will be scanned per query. If your constraints do not successfully limit the scope of the search, this can result in queries with incomplete results.  
* A `containsAll` query constraint can only take up to 9 items in the comparison array.

**Push Notifications**

* [Delivery of notifications is a “best effort”, not guaranteed](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html#//apple_ref/doc/uid/TP40008194-CH100-SW1). It is not intended to deliver data to your app, only to notify the user that there is new data available.

**Cloud Code**

* The `params` payload that is passed to a Cloud Function is limited to 50 MB.
