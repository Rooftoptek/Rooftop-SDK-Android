# Config

## Rooftop Config

`RTConfig` is a way to configure your applications remotely by storing a single configuration object on Rooftop. It enables you to add things like feature gating or a simple "Message of the Day". To start using `RTConfig` you need to add a few key/value pairs (parameters) to your app on the Rooftop Config Dashboard.

After that you will be able to fetch the `RTConfig` on the client, like in this example:

```java
RTConfig.getInBackground(new ConfigCallback() {
  @Override
  public void done(RTConfig config, RTException e) {
    int number = config.getInt("winningNumber");
    Log.d("TAG", String.format("Yay! The number is %d!", number));
  }
});
```

## Retrieving Config

`RTConfig` is built to be as robust and reliable as possible, even in the face of poor internet connections. Caching is used by default to ensure that the latest successfully fetched config is always available. In the below example we use `getInBackground` to retrieve the latest version of config from the server, and if the fetch fails we can simply fall back to the version that we successfully fetched before via `getCurrentConfig`.

```java
Log.d("TAG", "Getting the latest config...");
RTConfig.getInBackground(new ConfigCallback() {
  @Override
  public void done(RTConfig config, RTException e) {
    if (e == null) {
      Log.d("TAG", "Yay! Config was fetched from the server.");
    } else {
      Log.e("TAG", "Failed to fetch. Using Cached Config.");
      config = RTConfig.getCurrentConfig();
    }

    // Get the message from config or fallback to default value
    String welcomeMessage = config.getString("welcomeMessage", "Welcome!");
    Log.d("TAG", String.format("Welcome Messsage From Config = %s", welcomeMessage));
  }
});
```

## Current Config

Every `RTConfig` instance that you get is always immutable. When you retrieve a new `RTConfig` in the future from the network, it will not modify any existing `RTConfig` instance, but will instead create a new one and make it available via `RTConfig.getCurrentConfig()`. Therefore, you can safely pass around any `RTConfig` object and safely assume that it will not automatically change.

It might be troublesome to retrieve the config from the server every time you want to use it. You can avoid this by simply using the cached `getCurrentConfig` object and fetching the config only once in a while.

```java
class Helper {
  private static final long configRefreshInterval = 12 * 60 * 60 * 1000;
  private static long lastFetchedTime;

  // Fetches the config at most once every 12 hours per app runtime
  public static void refreshConfig() {
    long currentTime = System.currentTimeMillis();
    if (currentTime - lastFetchedTime > configRefreshInterval) {
      lastFetchedTime = currentTime;
      RTConfig.getInBackground();
    }
  }
}
```

## Parameters

`RTConfig` supports most of the data types supported by `RTObject`:

*   String
*   Numbers (boolean/int/double/long)
*   Date
*   RTFile
*   RTGeoPoint
*   List
*   Map

We currently allow up to **100** parameters in your config and a total size of **128KB** across all parameters.
