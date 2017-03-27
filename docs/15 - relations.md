# Relations

There are three kinds of relationships. One-to-one relationships enable one object to be associated with another object. One-to-many relationships enable one object to have many related objects. Finally, many-to-many relationships enable complex relationships among many objects.

There are four ways to build relationships in Rooftop:

## One-to-Many

When you’re thinking about one-to-many relationships and whether to implement Pointers or Arrays, there are several factors to consider. First, how many objects are involved in this relationship? If the "many" side of the relationship could contain a very large number (greater than 100 or so) of objects, then you have to use Pointers. If the number of objects is small (fewer than 100 or so), then Arrays may be more convenient, especially if you typically need to get all of the related objects (the "many" in the "one-to-many relationship") at the same time as the parent object.

### Using Pointers

Let's say we have a game app. The game keeps track of the player's score and achievements every time he chooses to play. In Rooftop, we can store this data in a single `Game` object. If the game becomes incredibly successful, each player will store thousands of `Game` objects in the system. For circumstances like this, where the number of relationships can be arbitrarily large, Pointers are the best option.

Suppose in this game app, we want to make sure that every `Game` object is associated with a Rooftop User. We can implement this like so:

```java
RTObject game = new RTObject("Game");
game.put("createdBy", RTUser.getCurrentUser());
```
{: .common-lang-block .java }

<pre><code class="objectivec">
RTObject *game= [RTObject objectWithClassName:@"Game"];
[game setObject:[RTUser currentUser] forKey:@"createdBy"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let game = RTObject(className:"Game")
game["createdBy"] = RTUser.currentUser()
</code></pre>
{: .common-lang-block .swift }

```php
$game = RooftopObject::create("Game");
$game->set("createdBy", RooftopUser::getCurrentUser());
```
{: .common-lang-block .php }

```cs
var game = new RooftopObject("Game");
game["createdBy"] = RooftopUser.CurrentUser;
```
{: .common-lang-block .cs }

```js
var game = new Rooftop.Object("Game");
game.set("createdBy", Rooftop.User.current());
```
{: .common-lang-block .js }

We can obtain all of the `Game` objects created by a Rooftop User with a query:

```java
RTQuery<RTObject> gameQuery = RTQuery.getQuery("Game");
gameQuery.whereEqualTo("createdBy", RTUser.getCurrentUser());
```
{: .common-lang-block .java }

<pre><code class="objectivec">RTQuery *gameQuery = [RTQuery queryWithClassName:@"Game"];
[gameQuery whereKey:@"createdBy" equalTo:[RTUser currentUser]];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">let gameQuery = RTQuery(className:"Game")
if let user = RTUser.currentUser() {
  gameQuery.whereKey("createdBy", equalTo: user)
}
</code></pre>
{: .common-lang-block .swift }

```php
$gameQuery = new RooftopQuery("Game");
$gameQuery->equalTo("createdBy", RooftopUser::getCurrentUser());
```
{: .common-lang-block .php }

```cs
var query = RooftopObject.getQuery("Game").WhereEqualTo("createdBy", RooftopUser.CurrentUser);
```
{: .common-lang-block .cs }

```js
var query = new Rooftop.Query("Game");
query.equalTo("createdBy", Rooftop.User.current());
```
{: .common-lang-block .js }

And, if we want to find the Rooftop User who created a specific `Game`, that is a lookup on the `createdBy` key:

```java
// say we have a Game object
RTObject game = ...

// getting the user who created the Game
RTUser createdBy = game.getUser("createdBy");
```
{: .common-lang-block .java }

<pre><code class="objectivec">// say we have a Game object
RTObject *game = ...

// getting the user who created the Game
RTUser *createdBy = [game objectForKey@"createdBy"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// say we have a Game object
let game = ...

// getting the user who created the Game
let createdBy = game["createdBy"]
</code></pre>
{: .common-lang-block .swift }

```php
// say we have a Game object
$game = ...

// getting the user who created the Game
$user = $game["createdBy"];
```
{: .common-lang-block .php }

```cs
// say we have a Game object
RooftopObject game = ...

// getting the user who created the Game
RooftopUser user = game["createdBy"];
```
{: .common-lang-block .cs }

```js
// say we have a Game object
var game = ...

// getting the user who created the Game
var user = game.get("createdBy");
```
{: .common-lang-block .js }

For most scenarios, Pointers will be your best bet for implementing one-to-many relationships.

### Using Arrays

Arrays are ideal when we know that the number of objects involved in our one-to-many relationship are going to be small. Arrays will also provide some productivity benefit via the `includeKey` parameter. Supplying the parameter will enable you to obtain all of the "many" objects in the "one-to-many" relationship at the same time that you obtain the "one" object. However, the response time will be slower if the number of objects involved in the relationship turns out to be large.

Suppose in our game, we enabled players to keep track of all the weapons their character has accumulated as they play, and there can only be a dozen or so weapons. In this example, we know that the number of weapons is not going to be very large. We also want to enable the player to specify the order in which the weapons will appear on screen. Arrays are ideal here because the size of the array is going to be small and because we also want to preserve the order the user has set each time they play the game:

Let's start by creating a column on our Rooftop User object called `weaponsList`.

Now let's store some `Weapon` objects in the `weaponsList`:

```java
// let's say we have four weapons
RTObject scimitar = ...
RTObject plasmaRifle = ...
RTObject grenade = ...
RTObject bunnyRabbit = ...

// stick the objects in an array
ArrayList<RTObject> weapons = new ArrayList<RTObject>();
weapons.add(scimitar);
weapons.add(plasmaRifle);
weapons.add(grenade);
weapons.add(bunnyRabbit);

// store the weapons for the user
RTUser.getCurrentUser().put("weaponsList", weapons);
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// let's say we have four weapons
RTObject *scimitar = ...
RTObject *plasmaRifle = ...
RTObject *grenade = ...
RTObject *bunnyRabbit = ...

// stick the objects in an array
NSArray *weapons = @[scimitar, plasmaRifle, grenade, bunnyRabbit];

// store the weapons for the user
[[RTUser currentUser] setObject:weapons forKey:@weaponsList"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// let's say we have four weapons
let scimitar = ...
let plasmaRifle = ...
let grenade = ...
let bunnyRabbit = ...

// stick the objects in an array
let weapons = [scimitar, plasmaRifle, grenade, bunnyRabbit]

// store the weapons for the user
let user = RTUser.currentUser()
user["weaponsList"] = weapons
</code></pre>
{: .common-lang-block .swift }

```php
// let's say we have four weapons
$scimitar = ...
$plasmaRifle = ...
$grenade = ...
$bunnyRabbit = ...

// stick the objects in an array
$weapons = [$scimitar, $plasmaRifle, $grenade, $bunnyRabbit];

// store the weapons for the user
$user = RooftopUser::getCurrentUser();
$user->set("weaponsList", weapons);
```
{: .common-lang-block .php }

```cs
// let's say we have four weapons
var scimitar = ...
var plasmaRifle = ...
var grenade = ...
var bunnyRabbit = ...

// stick the objects in an array
var weapons = new List<RooftopObject>();
weapons.Add(scimitar);
weapons.Add(plasmaRifle);
weapons.Add(grenade);
weapons.Add(bunnyRabbit);

// store the weapons for the user
var user = RooftopUser.CurrentUser;
user.AddRangeToList("weaponsList", weapons);
```
{: .common-lang-block .cs }

```js
// let's say we have four weapons
var scimitar = ...
var plasmaRifle = ...
var grenade = ...
var bunnyRabbit = ...

// stick the objects in an array
var weapons = [scimitar, plasmaRifle, grenade, bunnyRabbit];

// store the weapons for the user
var user = Rooftop.User.current();
user.set("weaponsList", weapons);
```
{: .common-lang-block .js }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Later, if we want to retrieve the `Weapon` objects, it's just one line of code:

```java
ArrayList<RooftopObject> weapons = RooftopUser.getCurrentUser().get("weaponsList");
```
{: .common-lang-block .java }

<pre><code class="objectivec">
NSArray *weapons = [[RTUser currentUser] objectForKey:@"weaponsList"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let weapons = RTUser.currentUser()?.objectForKey("weaponsList")
</code></pre>
{: .common-lang-block .swift }

```php
$weapons = RooftopUser::getCurrentUser()->get("weaponsList");
```
{: .common-lang-block .php }

```cs
var weapons = RooftopUser.CurrentUser.Get<IList<Object>>("weaponsList");
```
{: .common-lang-block .cs }

```js
var weapons = Rooftop.User.current().get("weaponsList")
```
{: .common-lang-block .js }

Sometimes, we will want to fetch the "many" objects in our one-to-many relationship at the same time as we fetch the "one" object. One trick we could employ is to use the `includeKey` (or `include` in Android) parameter whenever we use a Rooftop Query to also fetch the array of `Weapon` objects (stored in the `weaponsList` column) along with the Rooftop User object:

```java
// set up our query for a User object
RTQuery<RTUser> userQuery = RTUser.getQuery();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you
// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery.include("weaponsList");

// execute the query
userQuery.findInBackground(new RTFindCallback<RTUser>() {
  public void done(List<RTUser> userList, RTException e) {
    // userList contains all of the User objects, and their associated Weapon objects, too
  }
});
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// set up our query for a User object
RTQuery *userQuery = [RTUser query];

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
[userQuery includeKey:@"weaponsList"];

// execute the query
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects contains all of the User objects, and their associated Weapon objects, too
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// set up our query for a User object
let userQuery = RTUser.query();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery?.includeKey("weaponsList");

// execute the query
userQuery?.findObjectsInBackgroundWithBlock {
    (objects: [AnyObject]?, error: NSError?) -> Void in
    // objects contains all of the User objects, and their associated Weapon objects, too
}
</code></pre>
{: .common-lang-block .swift }

```php
// set up our query for a User object
$userQuery = RooftopUser::query();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
$userQuery->includeKey("weaponsList");

// execute the query
$results = $userQuery->find();
// results contains all of the User objects, and their associated Weapon objects, too
```
{: .common-lang-block .php }

```cs
// set up our query for a User object
var userQuery = RooftopUser.Query;

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery = userQuery.Include("weaponsList");

// execute the query
IEnumerable<RooftopUser> results = await userQuery.FindAsync();
// results contains all of the User objects, and their associated Weapon objects, too
```
{: .common-lang-block .cs }

```js
// set up our query for a User object
var userQuery = new Rooftop.Query(Rooftop.User);

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery.include("weaponsList");

// execute the query
userQuery.find({
  success: function(results){
    // results contains all of the User objects, and their associated Weapon objects, too
  }
});
```
{: .common-lang-block .js }

You can also get the "one" side of the one-to-many relationship from the "many" side. For example, if we want to find all Rooftop User objects who also have a given `Weapon`, we can write a constraint for our query like this:

```java
// add a constraint to query for whenever a specific Weapon is in an array
userQuery.whereEqualTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery.whereEqualTo("weaponsList", arrayOfWeapons);
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// add a constraint to query for whenever a specific Weapon is in an array
[userQuery whereKey:@"weaponsList" equalTo:scimitar];

// or query using an array of Weapon objects...
[userQuery whereKey:@"weaponsList" containedIn:arrayOfWeapons];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// add a constraint to query for whenever a specific Weapon is in an array
userQuery?.whereKey("weaponsList", equalTo: scimitar);

// or query using an array of Weapon objects...
userQuery?.whereKey("weaponsList", containedIn: arrayOfWeapons)
</code></pre>
{: .common-lang-block .swift }

```php
// add a constraint to query for whenever a specific Weapon is in an array
$userQuery->equalTo("weaponsList", $scimitar);

// or query using an array of Weapon objects...
$userQuery->containedIn("weaponsList", $arrayOfWeapons);
```
{: .common-lang-block .php }

```cs
// add a constraint to query for whenever a specific Weapon is in an array
userQuery = userQuery.WhereEqualTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery = userQuery.WhereContainedIn("weaponsList", arrayOfWeapons);
```
{: .common-lang-block .cs }

```js
// add a constraint to query for whenever a specific Weapon is in an array
userQuery.equalTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery.containedIn("weaponsList", arrayOfWeapons);
```
{: .common-lang-block .js }

## Many-to-Many

Now let’s tackle many-to-many relationships. Suppose we had a book reading app and we wanted to model `Book` objects and `Author` objects. As we know, a given author can write many books, and a given book can have multiple authors. This is a many-to-many relationship scenario where you have to choose between Arrays, Rooftop Relations, or creating your own Join Table.

The decision point here is whether you want to attach any metadata to the relationship between two entities. If you don’t, Rooftop Relation or using Arrays are going to be the easiest alternatives. In general, using arrays will lead to higher performance and require fewer queries. If either side of the many-to-many relationship could lead to an array with more than 100 or so objects, then, for the same reason Pointers were better for one-to-many relationships, Rooftop Relation or Join Tables will be better alternatives.

On the other hand, if you want to attach metadata to the relationship, then create a separate table (the "Join Table") to house both ends of the relationship. Remember, this is information **about the relationship**, not about the objects on either side of the relationship. Some examples of metadata you may be interested in, which would necessitate a Join Table approach, include:

### Using Rooftop Relations

Using Rooftop Relations, we can create a relationship between a `Book` and a few `Author` objects. You can associate a few authors with this book:

```java
// let’s say we have a few objects representing Author objects
RTObject authorOne =
RTObject authorTwo =
RTObject authorThree =

// now we create a book object
RTObject book = new RTObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
RTRelation<RTObject> relation = book.getRelation("authors");
relation.add(authorOne);
relation.add(authorTwo);
relation.add(authorThree);

// now save the book object
book.saveInBackground();
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// let’s say we have a few objects representing Author objects
RTObject *authorOne = …
RTObject *authorTwo = …
RTObject *authorThree = …

// now we create a book object
RTObject *book= [RTObject objectWithClassName:@"Book"];

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
RTRelation *relation = [book relationForKey:@"authors"];
[relation addObject:authorOne];
[relation addObject:authorTwo];
[relation addObject:authorThree];

// now save the book object
[book saveInBackground];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// let’s say we have a few objects representing Author objects
let authorOne = ...
let authorTwo = ...
let authorThree = ...

// now we create a book object
let book = RTObject(className: "Book")

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
let relation = book.relationForKey("authors")
relation.addObject(authorOne)
relation.addObject(authorTwo)
relation.addObject(authorThree)

// now save the book object
book.saveInBackground()
</code></pre>
{: .common-lang-block .swift }

```php
// let’s say we have a few objects representing Author objects
$authorOne = ...
$authorTwo = ...
$authorThree = ...

// now we create a book object
$book = new RooftopObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
$relation = $book->getRelation("authors");
$relation->add($authorOne);
$relation->add($authorTwo);
$relation->add($authorThree);

// now save the book object
$book->save();
```
{: .common-lang-block .php }

```cs
// let’s say we have a few objects representing Author objects
var authorOne = ...
var authorTwo = ...
var authorThree = ...

// now we create a book object
var book = new RooftopObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
var relation = book.GetRelation<RooftopObject>("authors");
relation.Add(authorOne);
relation.Add(authorTwo);
relation.Add(authorThree);

// now save the book object
await book.SaveAsync();
```
{: .common-lang-block .cs }

```js
// let’s say we have a few objects representing Author objects
var authorOne = ...
var authorTwo = ...
var authorThree = ...

// now we create a book object
var book = new Rooftop.Object("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
var relation = book.relation("authors");
relation.add(authorOne);
relation.add(authorTwo);
relation.add(authorThree);

// now save the book object
book.save();
```
{: .common-lang-block .js }

To get the list of authors who wrote a book, create a query:

```java
// suppose we have a book object
RTObject book = ...

// create a relation based on the authors key
RTRelation relation = book.getRelation("authors");

// generate a query based on that relation
RTQuery query = relation.getQuery();

// now execute the query
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// suppose we have a book object
RTObject *book = ...

// create a relation based on the authors key
RTRelation *relation = [book relationForKey:@"authors"];

// generate a query based on that relation
RTQuery *query = [relation query];

// now execute the query
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// suppose we have a book object
let book = ...

// create a relation based on the authors key
let relation = book.relationForKey("authors")

// generate a query based on that relation
let query = relation.query()

// now execute the query
</code></pre>
{: .common-lang-block .swift }

```php
// suppose we have a book object
$book = ...

// create a relation based on the authors key
$relation = $book->getRelation("authors");

// generate a query based on that relation
$query = $relation->getQuery();

// now execute the query
```
{: .common-lang-block .php }

```cs
// suppose we have a book object
var book = ...

// create a relation based on the authors key
var relation = book.GetRelation<RooftopObject>("authors");

// generate a query based on that relation
var query = relation.Query;

// now execute the query
```
{: .common-lang-block .cs }

```js
// suppose we have a book object
var book = ...

// create a relation based on the authors key
var relation = book.relation("authors");

// generate a query based on that relation
var query = relation.query();

// now execute the query
```
{: .common-lang-block .js }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Perhaps you even want to get a list of all the books to which an author contributed. You can create a slightly different kind of query to get the inverse of the relationship:

```java
// suppose we have a author object, for which we want to get all books
RTObject author = ...

// first we will create a query on the Book object
RTQuery<RTObject> query = RTQuery.getQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query.whereEqualTo("authors", author);
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// suppose we have a author object, for which we want to get all books
RTObject *author = ...

// first we will create a query on the Book object
RTQuery *query = [RTQuery queryWithClassName:@"Book"];

// now we will query the authors relation to see if the author object
// we have is contained therein
[query whereKey:@"authors" equalTo:author];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// suppose we have a author object, for which we want to get all books
let author = ...

// first we will create a query on the Book object
let query = RTQuery(className: "Book")

// now we will query the authors relation to see if the author object
// we have is contained therein
query?.whereKey("authors", equalTo: author)
</code></pre>
{: .common-lang-block .swift }

```php
// suppose we have a author object, for which we want to get all books
$author = ...

// first we will create a query on the Book object
$query = new RooftopQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
$query->equalTo("authors", $author);
```
{: .common-lang-block .php }

```cs
// suppose we have a author object, for which we want to get all books
var author = ...

// first we will create a query on the Book object
var query = RooftopObject.GetQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query = query.WhereEqualTo("authors", author);
```
{: .common-lang-block .cs }

```js
// suppose we have a author object, for which we want to get all books
var author = ...

// first we will create a query on the Book object
var query = new Rooftop.Query("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query.equalTo("authors", author);
```
{: .common-lang-block .js }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

### Using Join Tables

There may be certain cases where we want to know more about a relationship. For example, suppose we were modeling a following/follower relationship between users: a given user can follow another user, much as they would in popular social networks. In our app, we not only want to know if User A is following User B, but we also want to know **when** User A started following User B. This information could not be contained in a Rooftop Relation. In order to keep track of this data, you must create a separate table in which the relationship is tracked. This table, which we will call `Follow`, would have a `from` column and a `to` column, each with a pointer to a Rooftop User. Alongside the relationship, you can also add a column with a `Date` object named `date`.

Now, when you want to save the following relationship between two users, create a row in the `Follow` table, filling in the `from`, `to`, and `date` keys appropriately:

```java
// suppose we have a user we want to follow
RTUser otherUser = ...

// create an entry in the Follow table
RTObject follow = new RTObject("Follow");
follow.put("from", RTUser.getCurrentUser());
follow.put("to", otherUser);
follow.put("date", Date());
follow.saveInBackground();
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// suppose we have a user we want to follow
RTUser *otherUser = ...

// create an entry in the Follow table
RTObject *follow = [RTObject objectWithClassName:@"Follow"];
[follow setObject:[RTUser currentUser]  forKey:@"from"];
[follow setObject:otherUser forKey:@"to"];
[follow setObject:[NSDate date] forKey@"date"];
[follow saveInBackground];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// suppose we have a user we want to follow
let otherUser = ...

// create an entry in the Follow table
let follow = RTObject(className: "Follow")
follow.setObject(RTUser.currentUser()!, forKey: "from")
follow.setObject(otherUser, forKey: "to")
follow.setObject(NSDate(), forKey: "date")
follow.saveInBackground()
</code></pre>
{: .common-lang-block .swift }

```php
// suppose we have a user we want to follow
$otherUser = ...

// create an entry in the Follow table
$follow = new RooftopObject("Follow");
$follow->set("from", RooftopUser::getCurrentUser());
$follow->set("to", $otherUser);
$follow->set("date", new DateTime());
$follow->save();
```
{: .common-lang-block .php }

```cs
// suppose we have a user we want to follow
RooftopUser otherUser = ...

// create an entry in the Follow table
var follow = new RooftopObject("Follow");
follow["from"] = RooftopUser.CurrentUser;
follow["to"] = otherUser;
follow["date"] = DateTime.UtcNow;
await follow.SaveAsync();
```
{: .common-lang-block .cs }

```js
var otherUser = ...

// create an entry in the Follow table
var follow = new Rooftop.Object("Follow");
follow.set("from", Rooftop.User.current());
follow.set("to", otherUser);
follow.set("date", Date());
follow.save();
```
{: .common-lang-block .js }

If we want to find all of the people we are following, we can execute a query on the `Follow` table:

```java
// set up the query on the Follow table
RTQuery<RTObject> query = RTQuery.getQuery("Follow");
query.whereEqualTo("from", RTUser.getCurrentUser());

// execute the query
query.findInBackground(new RTFindCallback<RTObject>() {
    public void done(List<RTObject> followList, RTException e) {

    }
});
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// set up the query on the Follow table
RTQuery *query = [RTQuery queryWithClassName:@"Follow"];
[query whereKey:@"from" equalTo:[RTUser currentUser]];

// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(RTObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the to key
    RTUser *otherUser = [o objectForKey@"to"];

    // to get the time when we followed this user, get the date key
    RTObject *when = [o objectForKey@"date"];
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// set up the query on the Follow table
let query = RTQuery(className: "Follow")
query.whereKey("from", equalTo: RTUser.currentUser()!)

// execute the query
query.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    if let objects = objects {
        for o in objects {
            // o is an entry in the Follow table
            // to get the user, we get the object with the to key
            let otherUse = o.objectForKey("to") as? RTUser

            // to get the time when we followed this user, get the date key
            let when = o.objectForKey("date") as? RTObject
        }
    }
}
</code></pre>
{: .common-lang-block .swift }

```php
// set up the query on the Follow table
$query = new RooftopQuery("Follow");
$query->equalTo("from", RooftopUser::getCurrentUser());

// execute the query
$results = $query->find();
```
{: .common-lang-block .php }

```cs
// set up the query on the Follow table
RooftopQuery<RooftopObject> query = RooftopQuery.getQuery("Follow");
query = query.WhereEqualTo("from", RooftopUser.CurrentUser);

// execute the query
IEnumerable<RooftopObject> results = await query.FindAsync();
```
{: .common-lang-block .cs }

```js
var query = new Rooftop.Query("Follow");
query.equalTo("from", Rooftop.User.current());
query.find({
  success: function(users){
    ...
  }
});
```
{: .common-lang-block .js }

It’s also pretty easy to find all the users that are following the current user by querying on the `to` key:

```java
// set up the query on the Follow table
RTQuery<RTObject> query = RTQuery.getQuery("Follow");
query.whereEqualTo("to", RTUser.getCurrentUser());

// execute the query
query.findInBackground(new RTFindCallback<RTObject>() {
    public void done(List<RTObject> followList, RTException e) {

    }
});
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// set up the query on the Follow table
RTQuery *query = [RTQuery queryWithClassName:@"Follow"];
[query whereKey:@"to" equalTo:[RTUser currentUser]];

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(RTObject *o in objects) {
     // o is an entry in the Follow table
     // to get the user, we get the object with the from key
    RTUser *otherUser = [o objectForKey@"from"];

    // to get the time the user was followed, get the date key
    RTObject *when = [o objectForKey@"date"];
  }
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// set up the query on the Follow table
let query = RTQuery(className: "Follow")
query.whereKey("to", equalTo: RTUser.currentUser()!)

query.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    if let objects = objects {
        for o in objects {
            // o is an entry in the Follow table
            // to get the user, we get the object with the to key
            let otherUse = o.objectForKey("to") as? RTUser

            // to get the time when we followed this user, get the date key
            let when = o.objectForKey("date") as? RTObject
        }

    }
}
</code></pre>
{: .common-lang-block .swift }

```php
// create an entry in the Follow table
$query = new RooftopQuery("Follow");
$query->equalTo("to", RooftopUser::getCurrentUser());
$results = $query->find();
```
{: .common-lang-block .php }

```cs
// create an entry in the Follow table
var query = RooftopObject.GetQuery("Follow")
    .WhereEqualTo("to", RooftopUser.CurrentUser);
IEnumerable<RooftopObject> results = await query.FindAsync();
```
{: .common-lang-block .cs }

```js
// create an entry in the Follow table
var query = new Rooftop.Query("Follow");
query.equalTo("to", Rooftop.User.current());
query.find({
  success: function(users){
    ...
  }
});
```
{: .common-lang-block .js }

### Using an Array

Arrays are used in Many-to-Many relationships in much the same way that they are for One-to-Many relationships. All objects on one side of the relationship will have an Array column containing several objects on the other side of the relationship.

Suppose we have a book reading app with `Book` and `Author` objects. The `Book` object will contain an Array of `Author` objects (with a key named `authors`). Arrays are a great fit for this scenario because it's highly unlikely that a book will have more than 100 or so authors. We will put the Array in the `Book` object for this reason. After all, an author could write more than 100 books.

Here is how we save a relationship between a `Book` and an `Author`.

```java
// let's say we have an author
RTObject author = ...

// and let's also say we have an book
RTObject book = ...

// add the author to the authors list for the book
book.put("authors", author);
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// let's say we have an author
RTObject *author = ...

// and let's also say we have an book
RTObject *book = ...

// add the author to the authors list for the book
[book addObject:author forKey:@"authors"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// let's say we have an author
let author = ...

// and let's also say we have an book
let book = ...

// add the author to the authors list for the book
book.addObject(author, forKey: "authors")
</code></pre>
{: .common-lang-block .swift }

```php
// let's say we have an author
$author = ...

// and let's also say we have an book
$book = ...

// add the author to the authors list for the book
$book->addUnique("authors", array($author));
```
{: .common-lang-block .php }

```cs
// let's say we have an author
var author = ...

// and let's also say we have an book
var book = ...

// add the author to the authors list for the book
book.AddToList("authors", author);
```
{: .common-lang-block .cs }

```js
// let's say we have an author
var author = ...

// and let's also say we have an book
var book = ...

// add the author to the authors list for the book
book.add("authors", author);
```
{: .common-lang-block .js }

Because the author list is an Array, you should use the `includeKey` (or `include` on Android) parameter when fetching a `Book` so that Rooftop returns all the authors when it also returns the book:

```java
// set up our query for the Book object
RTQuery bookQuery = RTQuery.getQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.findInBackground(new RTFindCallback<RTObject>() {
    public void done(List<RTObject> bookList, RTException e) {
    }
});
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// set up our query for the Book object
RTQuery *bookQuery = [RTQuery queryWithClassName:@"Book"];

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];

// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated
    // Author objects, too
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// set up our query for the Book object
let bookQuery = RTQuery(className: "Book")

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.includeKey("authors")

// execute the query
bookQuery.findObjectsInBackgroundWithBlock{
    (objects: [AnyObject]?, error: NSError?) -> Void in
    // objects is all of the Book objects, and their associated
    // Author objects, too
}
</code></pre>
{: .common-lang-block .swift }

```php
// set up our query for the Book object
$bookQuery = new RooftopQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
$bookQuery->includeKey("authors");

// execute the query
$books= $bookQuery->find();
```
{: .common-lang-block .php }

```cs
// set up our query for the Book object
var bookQuery = RooftopObject.GetQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery = bookQuery.Include("authors");

// execute the query
IEnumerable<RooftopObject> books= await bookQuery.FindAsync();
```
{: .common-lang-block .cs }

```js
// set up our query for the Book object
var bookQuery = new Rooftop.Query("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.find({
  success: function(books){
    ...
  }
});
```
{: .common-lang-block .js }

At that point, getting all the `Author` objects in a given `Book` is a pretty straightforward call:

```java
ArrayList<RTObject> authorList = book.getList("authors");
```
{: .common-lang-block .java }

<pre><code class="objectivec">
NSArray *authorList = [book objectForKey@"authors"];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
let authorList = book.objectForKey("authors") as? NSArray
</code></pre>
{: .common-lang-block .swift }

```php
$authorList = $book->get("authors");
```
{: .common-lang-block .php }

```cs
var authorList = book.Get<List<RooftopObject>>("authors");
```
{: .common-lang-block .cs }

```js
var authorList = book.get("authors")
```
{: .common-lang-block .js }

```bash
# No REST API example
```
{: .common-lang-block .bash }

```cpp
// No C++ example
```
{: .common-lang-block .cpp }

Finally, suppose you have an `Author` and you want to find all the `Book` objects in which she appears. This is also a pretty straightforward query with an associated constraint:

```java
// set up our query for the Book object
RTQuery bookQuery = RTQuery.getQuery("Book");

// configure any constraints on your query...
booKQuery.whereEqualTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.findInBackground(new RTFindCallback<RTObject>() {
    public void done(List<RTObject> bookList, RTException e) {

    }
});
```
{: .common-lang-block .java }

<pre><code class="objectivec">
// suppose we have an Author object
RTObject *author = ...

// set up our query for the Book object
RTQuery *bookQuery = [RTQuery queryWithClassName:@"Book"];

// configure any constraints on your query...
[bookQuery whereKey:@"authors" equalTo:author];

// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];

// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated Author objects, too
}];
</code></pre>
{: .common-lang-block .objectivec }

<pre><code class="swift">
// suppose we have an Author object
let author = ...

// set up our query for the Book object
let bookQuery = RTQuery(className: "Book")

// configure any constraints on your query...
bookQuery.whereKey("authors", equalTo: author)

// tell the query to fetch all of the Author objects along with the Book
bookQuery.includeKey("authors")

// execute the query
bookQuery.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    // objects is all of the Book objects, and their associated Author objects, too
}
</code></pre>
{: .common-lang-block .swift }

```php
// set up our query for the Book object
$bookQuery = new RooftopQuery("Book");

// configure any constraints on your query...
$bookQuery->equalTo("authors", $author);

// tell the query to fetch all of the Author objects along with the Book
$bookQuery->includeKey("authors");

// execute the query
$books = $bookQuery->find();
```
{: .common-lang-block .php }

```cs
// set up our query for the Book object
var bookQuery = RooftopObject.GetQuery("Book");

// configure any constraints on your query...
bookQuery = bookQuery.WhereEqualTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery = bookQuery.Include("authors");

// execute the query
IEnumerable<RooftopObject> books = await bookQuery.FindAsync();
```
{: .common-lang-block .cs }

```js
// set up our query for the Book object
var bookQuery = new Rooftop.Query("Book");

// configure any constraints on your query...
bookQuery.equalTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.find({
  success: function(books){
    ...
  }
});
```
{: .common-lang-block .js }

## One-to-One

In Rooftop, a one-to-one relationship is great for situations where you need to split one object into two objects. These situations should be rare, but two examples include:

* **Limiting visibility of some user data.** In this scenario, you would split the object in two, where one portion of the object contains data that is visible to other users, while the related object contains data that is private to the original user (and protected via ACLs).
* **Splitting up an object for size.** In this scenario, your original object is greater than the 128K maximum size permitted for an object, so you decide to create a secondary object to house extra data. It is usually better to design your data model to avoid objects this large, rather than splitting them up. If you can't avoid doing so, you can also consider storing large data in a Rooftop File.

Thank you for reading this far. We apologize for the complexity. Modeling relationships in data is a hard subject, in general. But look on the bright side: it's still easier than relationships with people.
