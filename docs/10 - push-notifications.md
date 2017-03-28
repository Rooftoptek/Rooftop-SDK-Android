# Push Notifications

Push notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Rooftop to send push notifications.

If you haven't installed the SDK yet, [head over to the Quicktart "Push Notification" section](https://github.com/Rooftoptek/Rooftop-SDK-Android/blob/master/README.md#push-notifications) to get our SDK up and running.

## Setting Up Push

If you want to start using push, start by completing the [Android Push Notifications QuickStart Guide](https://github.com/Rooftoptek/Rooftop-SDK-Android/blob/master/README.md#push-notifications) to learn how to configure your app and send your first push notification. Come back to this guide afterwards to learn more about the push features offered by Rooftop.

The Rooftop library provides push notifications using Google Cloud Messaging (GCM) if Google Play Services are available. Learn more about Google Play Services [here](https://developers.google.com/android/guides/overview).

When sending pushes to Android devices with GCM, there are several pieces of information that Rooftop keeps track of automatically:

*   **Registration ID**: The GCM registration ID uniquely identifies an app/device pairing for push purposes.
*   **Sender ID**: The GCM sender ID is a public number that identifies the sender of a push notification.
*   **API key**: The GCM API key is a server secret that allows a server to send pushes to a registration ID on behalf of a particular sender ID.

The Rooftop Android SDK chooses a reasonable default configuration so that you do not have to worry about GCM registration ids, sender ids, or API keys.

However, as an advanced feature for developers that want to send pushes from multiple push providers, Rooftop allows you to optionally register your app for pushes with additional GCM sender IDs. To do this, specify the additional GCM sender ID with the following `<meta-data>` tag as a child of the `<application>` element in your app's `AndroidManifest.xml`:

```java
<meta-data android:name="io.rftp.push.gcm_sender_id"
           android:value="id:YOUR_SENDER_ID" />;
```

In the sample snippet above, `YOUR_SENDER_ID` should be replaced by a numeric GCM sender ID. Note that the Rooftop SDK expects you to prefix your sender ID with an `id:` prefix, as shown in the sample snippet.

If you want to register your app with multiple additional sender IDs, then the `android:value` in the `<meta-data>` element above should hold a comma-delimited list of sender IDs, as in the following snippet:

```java
<meta-data android:name="io.rftp.push.gcm_sender_id"
           android:value="id:YOUR_SENDER_ID_1,YOUR_SENDER_ID_2,YOUR_SENDER_ID_3" />;
```

## Installations

Every Rooftop application installed on a device registered for push notifications has an associated `RTInstallation` object. The `RTInstallation` object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance. Saving the `RTInstallation` object is also required for tracking push-related app open events.

In Android, `RTInstallation` objects are available through the `RTInstallation` class, a subclass of `RTObject`. It uses the [same API](Objects) for storing and retrieving data. To access the current `RTInstallation` object from your Android app, use the `RTInstallation.getCurrentInstallation()` method. The first time you save a `RTInstallation`, Rooftop will add it to your `RTInstallation` class and it will be available for targeting push notifications.

```java
// Save the current Installation to Rooftop.
RTInstallation installation = RTInstallation.getCurrentInstallation();
installation.setACL([your RTACL]);
installation.saveInBackground();
```

While it is possible to modify a `RTInstallation` just like you would a `RTObject`, there are several special fields that help manage and target devices.

*   **`installationId`**: Unique Id for the device used by Rooftop _(readonly)_.
*   **`deviceType`**: The type of device, "ios", "osx", "android", "winrt", "winphone", "dotnet", or "embedded". On Android devices, this field will be set to "android" _(readonly)_.
*   **`pushType`**: This field is reserved for directing Rooftop to the push delivery network to be used. If the device is registered to receive pushes via GCM, this field will be marked "gcm". If Google Play Services is not available, it will be blank _(readonly)_.
*   **`GCMSenderId`**: This field only has meaning for Android `RTInstallation`s that use the GCM push type. It is reserved for directing Rooftop to send pushes to this installation with an alternate GCM sender ID. This field should generally not be set unless you are uploading installation data from another push provider. If you set this field, then you must set the GCM API key corresponding to this GCM sender ID in your Rooftop application's push settings.
*   **`deviceToken`**: The token used by GCM to keep track of registration ID. On iOS devices, this is the Apple generated token _(readonly)_.
*   **`appName`**: The display name of the client application to which this installation belongs. This value is synchronized every time a `RTInstallation` object is saved from the device  _(readonly)_.
*   **`appVersion`**: The version string of the client application to which this installation belongs. This value is synchronized every time a `RTInstallation` object is saved from the device  _(readonly)_.
*   **`rooftopVersion`**: The version of the Rooftop SDK which this installation uses. This value is synchronized every time a `RTInstallation` object is saved from the device  _(readonly)_.
*   **`timeZone`**: The current time zone where the target device is located. This value is synchronized every time a `RTInstallation` object is saved from the device _(readonly)_.
*   **`localeIdentifier`**: The locale identifier of the device in the format [language code]-[COUNTRY CODE]. The language codes are two-letter lowercase ISO language codes (such as "en") as defined by [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1). The country codes are two-letter uppercase ISO country codes (such as "US") as defined by [ISO 3166-1]("http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3"). This value is synchronized every time a `RTInstallation` object is saved from the device _(readonly)_.
*   **`badge`**: The current value of the icon badge for iOS apps. Changes to this value on the server will be used for future badge-increment push notifications.
*   **`appIdentifier`**: A unique identifier for this installation's client application. This parameter is not supported in Android _(readonly)_.

The Rooftop Android SDK will avoid making unnecessary requests. If a `RTInstallation` is saved on the device, a request to the Rooftop servers will only be made if one of the `RTInstallation`'s fields has been explicitly updated.

## Receiving Pushes

Make sure you've gone through the [Android Push QuickStart](https://github.com/Rooftoptek/Rooftop-SDK-Android/blob/master/README.md#push-notifications) to set up your app to receive pushes.

When a push notification is received, the “title” is displayed in the status bar and the “alert” is displayed alongside the “title” when the user expands the notification drawer. If you choose to subclass `io.rftp.RTPushBroadcastReceiver`, be sure to replace that name with your class' name in the registration.

Note that some Android emulators (the ones without Google API support) don't support GCM, so if you test your app in an emulator make sure to select an emulator image that has Google APIs installed.

### Customizing Notifications

Now that your app is all set up to receive push notifications, you can start customizing the display of these notifications.

#### Customizing Notification Icons

The [Android style guide](https://www.google.com/design/spec/style/icons.html#notification) recommends apps use a push icon that is monochromatic and flat. The default push icon is your application's launcher icon, which is unlikely to conform to the style guide. To provide a custom push icon, add the following metadata tag to your app's `AndroidManifest.xml`:

```java
<meta-data android:name="io.rftp.push.notification_icon" 
		   android:resource="@drawable/push_icon"/>
```

...where `push_icon` is the name of a drawable resource in your package. If your application needs more than one small icon, you can override `getSmallIconId` in your `RTPushBroadcastReceiver` subclass.

If your push has a unique context associated with an image, such as the avatar of the user who sent a message, you can use a large push icon to call attention to the notification. When a notification has a large push icon, your app's static (small) push icon is moved to the lower right corner of the notification and the large icon takes its place. See the [Android UI documentation](http://developer.android.com/guide/topics/ui/notifiers/notifications.html#NotificationUI) for examples. To provide a large icon, you can override `getLargeIcon` in your `RTPushBroadcastReceiver` subclass.

#### Responding with a Custom Activity

If your push has no "uri" parameter, `onPushOpen` will invoke your application's launcher activity. To customize this behavior, you can override `getActivity` in your `RTPushBroadcastReceiver` subclass.

#### Responding with a URI

If you provide a "uri" field in your push, the `RTPushBroadcastReceiver` will open that URI when the notification is opened. If there are multiple apps capable of opening the URI, a dialog will displayed for the user. The `RTPushBroadcastReceiver` will manage your back stack and ensure that clicking back from the Activity handling URI will navigate the user back to the activity returned by `getActivity`.

### Managing the Push Lifecycle

The push lifecycle has three phases:

1.  A notification is received and the `io.rftp.push.intent.OPEN` Intent is fired, causing the `RTPushBroadcastReceiver` to call `onPushReceive`. If either "alert" or "title" are specified in the push, then a Notification is constructed using `getNotification`. This Notification uses a small icon generated using `getSmallIconId`, which defaults to the icon specified by the `io.rftp.push.notification_icon` metadata in your `AndroidManifest.xml`. The Notification's large icon is generated from `getLargeIcon` which defaults to null. The notification's `contentIntent` and `deleteIntent` are `io.rftp.push.intent.OPEN` and `io.rftp.push.intent.DELETE` respectively.
2.  If the user taps on a Notification, the `io.rftp.push.intent.OPEN` Intent is fired. The `RTPushBroadcastReceiver` calls `onPushOpen`. The default implementation automatically sends an analytics event back to Rooftop tracking that this notification was opened. If the push contains a "uri" parameter, an activity is launched to navigate to that URI, otherwise the activity returned by `getActivity` is launched.
3.  If the user dismisses a Notification, the `io.rftp.push.intent.DELETE` Intent is fired. The `RTPushBroadcastReceiver` calls `onPushDismiss`, which does nothing by default

All of the above methods may be subclassed to customize the way your application handles push notifications. When subclassing the methods `onPushReceive`, `onPushOpen`, `onPushDismiss`, or `getNotification`, consider delegating to `super` where appropriate. For example, one might override `onPushReceive` to trigger a background operation for "silent" pushes and then delegate to `super` for all other pushes. This provides the most benefit from Rooftop Push and makes your code forward-compatible.

## Push Localization

Localizing your app's content is a proven way to drive greater engagement. We've made it easy to localize your push messages with Push Localization. The latest version of the Rooftop Android SDK will detect and store the user's language in the installation object.
