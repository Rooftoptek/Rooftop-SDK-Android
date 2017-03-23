# Objects

## The RTObject

Storing data on Rooftop is built around the `RTObject`. Each `RTObject` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `RTObject`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `RTObject` could contain:

```javascript
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even arrays and objects - anything that can be JSON-encoded.

Each `RTObject` has a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

## Saving Objects

Let's say you want to save the `GameScore` described above to the Rooftop Cloud. The interface is similar to a `Map`, plus the `saveInBackground` method:

```java
RTObject gameScore = new RTObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.saveInBackground();
```

Object saved in database will have next properties:

```javascript
objectId: "xWMyZ4YEGZ", score: 1337, playerName: "Sean Plott", cheatMode: false,
createdAt:"2011-06-10T18:33:42Z", updatedAt:"2011-06-10T18:33:42Z"
```

There are two things to note here. You didn't have to configure or set up a new Class called `GameScore` before running this code. Your Rooftop app lazily creates this Class for you when it first encounters it.

There are also a few fields you don't need to specify that are provided as a convenience. `objectId` is a unique identifier for each saved object. `createdAt` and `updatedAt` represent the time that each object was created and last modified in the cloud. Each of these fields is filled in by Rooftop, so they don't exist on a `RTObject` until a save operation has completed.

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again.

The most useful method to retrieve RTObject is to query it with method RTQuery.findInBackground():

```java
RTQuery<RTObject> query = RTQuery.getQuery("GameScore");
query.findInBackground(new RTFindCallback<RTObject>() {
  @Override
  public void done(List<RTObject> list, RTException e) {
    if (e == null) {
      for (RTObject a : list) {
        Log.d("asd", "asd");
      }
    }
  }
});
```

Saving data to the cloud is fun, but it's even more fun to get that data out again. If you have the `objectId`, you can retrieve the whole `RTObject` using a `RTQuery`:

```java
RTQuery<RTObject> query = RTQuery.getQuery("GameScore");
query.getInBackground("xWMyZ4YEGZ", new GetCallback<RTObject>() {
  public void done(RTObject object, RTException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

To get the values out of the `RTObject`, there's a `getX` method for each data type:

```java
int score = gameScore.getInt("score");
String playerName = gameScore.getString("playerName");
boolean cheatMode = gameScore.getBoolean("cheatMode");
```

If you don't know what type of data you're getting out, you can call `get(key)`, but then you probably have to cast it right away anyways. In most situations you should use the typed accessors like `getString`.

The three special values have their own accessors:

```java
String objectId = gameScore.getObjectId();
Date updatedAt = gameScore.getUpdatedAt();
Date createdAt = gameScore.getCreatedAt();
```

If you need to refresh an object you already have with the latest data that
    is in the cloud, you can call the `fetchInBackground` method like so:

```java
myObject.fetchInBackground(new GetCallback<RTObject>() {
  public void done(RTObject object, RTException e) {
    if (e == null) {
      // Success!
    } else {
      // Failure!
    }
  }
});
```

The code in the `GetCallback` will be run on the main thread.

## The Local Datastore

Rooftop also lets you store objects in a [local datastore](#local-datastore) on the Android device itself. You can use this for data that doesn't need to be saved to the cloud, but this is especially useful for temporarily storing data so that it can be synced later. To enable the datastore, call `Rooftop.enableLocalDatastore()` in your `Application` constructor before calling `Rooftop.initialize()`. Once the local datastore is enabled, you can store an object by pinning it.

```java
RTObject gameScore = new RTObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.pinInBackground();
```

As with saving, this recursively stores every object and file that `gameScore` points to, if it has been fetched from the cloud. Whenever you save changes to the object, or fetch new changes from Rooftop, the copy in the datastore will be automatically updated, so you don't have to worry about it.

## Retrieving Objects from the Local Datastore

Storing an object is only useful if you can get it back out. To get the data for a specific object, you can use a `RTQuery` just like you would while on the network, but using the `fromLocalDatastore` method to tell it where to get the data.

```java
RTQuery<RTObject> query = RTQuery.getQuery("GameScore");
query.fromLocalDatastore();
query.getInBackground("xWMyZ4YEGZ", new GetCallback<RTObject>() {
  public void done(RTObject object, RTException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

If you already have an instance of the object, you can instead use the `fetchFromLocalDatastoreInBackground` method.

```java
RTObject object = RTObject.createWithoutData("GameScore", "xWMyZ4YEGZ");
object.fetchFromLocalDatastoreInBackground(new GetCallback<RTObject>() {
  public void done(RTObject object, RTException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

## Unpinning Objects

When you are done with the object and no longer need to keep it on the device, you can release it with `unpinInBackground`.

```java
gameScore.unpinInBackground();
```

## Saving Objects Offline

Most save functions execute immediately, and inform your app when the save is complete. If you don't need to know when the save has finished, you can use `saveEventually` instead. The advantage is that if the user currently doesn't have a network connection, `saveEventually` will store the update on the device until a network connection is re-established. If your app is closed before the connection is back, Rooftop will try again the next time the app is opened. All calls to `saveEventually` (and `deleteEventually`) are executed in the order they are called, so it is safe to call `saveEventually` on an object multiple times. If you have the local datastore enabled, then any object you `saveEventually` will be pinned as long as that save is in progress. That makes it easy to retrieve your local changes while waiting for the network to be available.

```java
RTObject gameScore = new RTObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.saveEventually();
```

## Updating Objects

Updating an object is simple. Just set some new data on it and call one of the save methods. Assuming you have saved the object and have the `objectId`, you can retrieve the `RTObject` using a `RTQuery` and update its data:

```java
RTQuery<RTObject> query = RTQuery.getQuery("GameScore");

// Retrieve the object by id
query.getInBackground("xWMyZ4YEGZ", new GetCallback<RTObject>() {
  public void done(RTObject gameScore, RTException e) {
    if (e == null) {
      // Now let's update it with some new data. In this case, only cheatMode and score
      // will get sent to the Rooftop Cloud. playerName hasn't changed.
      gameScore.put("score", 1338);
      gameScore.put("cheatMode", true);
      gameScore.saveInBackground();
    }
  }
});
```

Rooftop automatically figures out which data has changed so only "dirty" fields will be transmitted during a save. You don't need to worry about squashing data in the cloud that you didn't intend to update.

## Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Rooftop provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

```java
gameScore.increment("score");
gameScore.saveInBackground();
```

You can also increment by any amount using `increment(key, amount)`.

## Arrays

To help with storing array data, there are three operations that can be used to atomically change an array field:

*   `add` and `addAll` append the given objects to the end of an array field.
*   `addUnique` and `addAllUnique` add only the given objects which aren't already contained in an array field to that field. The position of the insert is not guaranteed.
*   `removeAll` removes all instances of the given objects from an array field.

For example, we can add items to the set-like "skills" field like so:

```java
gameScore.addAllUnique("skills", Arrays.asList("flying", "kungfu"));
gameScore.saveInBackground();
```

Note that it is not currently possible to atomically add and remove items from an array in the same save. You will have to call `save` in between every different kind of array operation.

## Deleting Objects

To delete an object from the Rooftop Cloud:

```java
myObject.deleteInBackground();
```

If you want to run a callback when the delete is confirmed, you can provide a `DeleteCallback` to the `deleteInBackground` method. If you want to block the calling thread, you can use the `delete` method.

You can delete a single field from an object with the `remove` method:

```java
// After this, the playerName field will be empty
myObject.remove("playerName");

// Saves the field deletion to the Rooftop Cloud
myObject.saveInBackground();
```

## Relational Data

Objects can have relationships with other objects. To model this behavior, any `RTObject` can be used as a value in other `RTObject`s. Internally, the Rooftop framework will store the referred-to object in just one place, to maintain consistency.

For example, each `Comment` in a blogging app might correspond to one `Post`. To create a new `Post` with a single `Comment`, you could write:

```java
// Create the post
RTObject myPost = new RTObject("Post");
myPost.put("title", "I'm Hungry");
myPost.put("content", "Where should we go for lunch?");

// Create the comment
RTObject myComment = new RTObject("Comment");
myComment.put("content", "Let's do Sushirrito.");

// Add a relation between the Post and Comment
myComment.put("parent", myPost);

// This will save both myPost and myComment
myComment.saveInBackground();
```

You can also link objects using just their `objectId`s like so:

```java
// Add a relation between the Post with objectId "1zEcyElZ80" and the comment
myComment.put("parent", RTObject.createWithoutData("Post", "1zEcyElZ80"));
```

By default, when fetching an object, related `RTObject`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

```java
fetchedComment.getRTObject("post")
    .fetchIfNeededInBackground(new GetCallback<RTObject>() {
        public void done(RTObject post, RTException e) {
          String title = post.getString("title");
          // Do something with your new title variable
        }
    });
```

You can also model a many-to-many relation using the `RTRelation` object.  This works similar to `List<RTObject>`, except that you don't need to download all the `RTObject`s in a relation at once.  This allows `RTRelation` to scale to many more objects than the `List<RTObject>` approach.  For example, a `User` may have many `Post`s that they might like.  In this case, you can store the set of `Post`s that a `User` likes using `getRelation`.  In order to add a post to the list, the code would look something like:

```java
RTUser user = RTUser.getCurrentUser();
RTRelation<RTObject> relation = user.getRelation("likes");
relation.add(post);
user.saveInBackground();
```

You can remove a post from the `RTRelation` with something like:

```java
relation.remove(post);
```

By default, the list of objects in this relation are not downloaded.  You can get the list of `Post`s by calling `findInBackground` on the `RTQuery` returned by `getQuery`.  The code would look like:

```java
relation.getQuery().findInBackground(new FindCallback<RTObject>() {
    void done(List<RTObject> results, RTException e) {
      if (e != null) {
        // There was an error
      } else {
        // results have all the Posts the current user liked.
      }
    }
});
```

If you want only a subset of the `Post`s you can add extra constraints to the `RTQuery` returned by `getQuery`.  The code would look something like:

```java
RTQuery<RTObject> query = relation.getQuery();
// Add other query constraints.
```

 For more details on `RTQuery`, please look at the [query portion of this guide](#queries).  A `RTRelation` behaves similar to a `List<RTObject>` for querying purposes, so any queries you can do on lists of objects (other than `include`) you can do on `RTRelation`.

## Data Types

So far we've used values with type `String`, `Integer`, `bool`, and `RTObject`. Rooftop also supports `float`, `java.util.Date`, and `JSONObject.NULL`.

You can nest `JSONObject` and `JSONArray` objects to store more structured data within a single `RTObject`. Overall, the following types are allowed for each field in your object:

* String => `String`
* Number => primitive numeric values such as `int`s, `double`s, `long`s, or `float`s
* Bool => `bool`
* Array => `JSONArray`
* Object => `JSONObject`
* Date => `java.util.Date`
* File => `RTFile`
* Pointer => other `RTObject`
* Relation => `RTRelation`
* Null => `JSONObject.NULL`

Some examples:

```java
int myNumber = 42;
String myString = "the number is " + myNumber;
Date myDate = new Date();

JSONArray myArray = new JSONArray();
myArray.put(myString);
myArray.put(myNumber);

JSONObject myObject = new JSONObject();
myObject.put("number", myNumber);
myObject.put("string", myString);

RTObject bigObject = new RTObject("BigObject");
bigObject.put("myNumber", myNumber);
bigObject.put("myString", myString);
bigObject.put("myDate", myDate);
bigObject.put("myArray", myArray);
bigObject.put("myObject", myObject);
bigObject.put("myNull", JSONObject.NULL);
bigObject.saveInBackground();
```

We do not recommend storing large pieces of binary data like images or documents on `RTObject`. `RTObject`s should not exceed 128 kilobytes in size. We recommend you use `RTFile`s to store images, documents, and other types of files. You can do so by instantiating a `RTFile` object and setting it on a field. See [Files](#files) for more details.

For more information about how Rooftop handles data, check out our documentation on [Data](#data).

## Subclasses

Rooftop is designed to get you up and running as quickly as possible. You can access all of your data using the `RTObject` class and access any field with `get()`. In mature codebases, subclasses have many advantages, including terseness, extensibility, and support for autocomplete. Subclassing is completely optional, but can transform this code:

```java
RTObject shield = new RTObject("Armor");
shield.put("displayName", "Wooden Shield");
shield.put("fireproof", false);
shield.put("rupees", 50);
```

Into this:

```java
Armor shield = new Armor();
shield.setDisplayName("Wooden Shield");
shield.setFireproof(false);
shield.setRupees(50);
```

### Subclassing RTObject

To create a `RTObject` subclass:

1.  Declare a subclass which extends `RTObject`.
2.  Add a `@RTClassName` annotation. Its value should be the string you would pass into the `RTObject` constructor, and makes all future class name references unnecessary.
3.  Ensure that your subclass has a public default (i.e. zero-argument) constructor. You must not modify any `RTObject` fields in this constructor.
4.  Call `RTObject.registerSubclass(YourClass.class)` in your `Application` constructor before calling `Rooftop.initialize()`.
    The following code sucessfully implements and registers the `Armor` subclass of `RTObject`:

```java
// Armor.java
import io.rftp.RTObject;
import io.rftp.RTClassName;

@RTClassName("Armor")
public class Armor extends RTObject {
}

// App.java
import io.rftp.Rooftop;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();

    RTObject.registerSubclass(Armor.class);
    Rooftop.initialize(this, ROOFTOP_APPLICATION_ID, ROOFTOP_CLIENT_KEY);
  }
}
```

### Accessors, Mutators, and Methods

Adding methods to your `RTObject` subclass helps encapsulate logic about the class. You can keep all your logic about a subject in one place rather than using separate classes for business logic and storage/transmission logic.

You can add accessors and mutators for the fields of your `RTObject` easily. Declare the getter and setter for the field as you normally would, but implement them in terms of `get()` and `put()`. The following example creates a `displayName` field in the `Armor` class:

```java
// Armor.java
@RTClassName("Armor")
public class Armor extends RTObject {
  public String getDisplayName() {
    return getString("displayName");
  }
  public void setDisplayName(String value) {
    put("displayName", value);
  }
}
```

You can now access the displayName field using `armor.getDisplayName()` and assign to it using `armor.setDisplayName("Wooden Sword")`. This allows your IDE to provide autocompletion as you develop your app and allows typos to be caught at compile-time.

Accessors and mutators of various types can be easily defined in this manner using the various forms of `get()` such as `getInt()`, `getRTFile()`, or `getMap()`.

If you need more complicated logic than simple field access, you can declare your own methods as well:

```java
public void takeDamage(int amount) {
  // Decrease the armor's durability and determine whether it has broken
  increment("durability", -amount);
  if (getDurability() < 0) {
    setBroken(true);
  }
}
```

### Initializing Subclasses

You should create new instances of your subclasses using the constructors you have defined. Your subclass must define a public default constructor that does not modify fields of the `RTObject`, which will be used throughout the Rooftop SDK to create strongly-typed instances of your subclass.

To create a reference to an existing object, use `RTObject.createWithoutData()`:

```java
Armor armorReference = RTObject.createWithoutData(Armor.class, armor.getObjectId());
```

### Queries

You can get a query for objects of a particular subclass using the static method `RTQuery.getQuery()`. The following example queries for armors that the user can afford:

```java
RTQuery<Armor> query = RTQuery.getQuery(Armor.class);
query.whereLessThanOrEqualTo("rupees", RTUser.getCurrentUser().get("rupees"));
query.findInBackground(new FindCallback<Armor>() {
  @Override
  public void done(List<Armor> results, RTException e) {
    for (Armor a : results) {
      // ...
    }
  }
});
```
