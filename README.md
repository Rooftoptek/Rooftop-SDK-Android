# Rooftop-SDK-Android

A library that gives you access to the Rooftop cloud platform from your Android app. For more information about Rooftop and its features, see the website and getting started.

## Download

To download SDK with gradle use the next tips.

<b> Step 1: </b>

Set the url to download the sdk in top-level (project-level) build.gradle file

```groovy
allprojects {
  repositories {
    ***
    maven { url 'https://raw.githubusercontent.com/Rooftoptek/Rooftop-SDK-Android/<release name>/releases/' }
}
```

Url example for release 0.5.0:

```groovy
url 'https://raw.githubusercontent.com/Rooftoptek/Rooftop-SDK-Android/0.5.0/releases/'
```

<b> Step 2: </b>

Set the dependency of the "Rooftop SDK" in the build.gradle file of the main project

```groovy
dependencies {
  ***
  compile(group: 'io.rftp', name: 'rooftop', version: '0.5.0')
}
```

## Initialisation

To initialize SDK use the next tips.

<b> Step 1: </b>

Set android minSdkVersion not less than 15

<b> Step 2: </b>

Configure AndroidManifest.xml file of the main project:

  A. Set the permisions:
  
```groovy
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

  B. Set rooftop credentials as meta-data in "application" section.

  B0. Modify AndroidManifest.xml:
  
```groovy
<application
***>
***
  <meta-data
    android:name="io.rftp.APPLICATION_ID"
    android:value="@string/rooftop_app_id" />
  <meta-data
    android:name="io.rftp.IDENTITY_POOL_ID"
    android:value="@string/rooftop_identity_pool_id" />
  <meta-data
    android:name="io.rftp.CLIENT_KEY"
    android:value="@string/rooftop_client_key" />
</application>
```

  B1. Put your credentials in strings.xml:

```groovy
<resources>
  ***
  <string name="rooftop_app_id">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</string>
  <string name="rooftop_identity_pool_id">xx-xxxx-x:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</string>
  <string name="rooftop_client_key">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</string>
</resources>
```

<b> Step 3: </b>

Call Rooftop.initialize(*) in onCreate(*) method of main Application class of the project

```java
public class MyApplication extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    ***
    Rooftop.initialize(this);
  }
}
```

<i> If you don't have your own Application class, create one. Specify usage of your MyApplication class in AndroidManifest-file:</i>

```groovy
<application
  ***
  android:name=".MyApplication">
    ***
</application>
```

## Basic API calls

<b> Sign up </b>

```java
RTUser newUser = new RTUser();
newUser.setUsername("login");
newUser.setPassword("password");
newUser.signUpInBackground();
```
<b> Login </b>

```java
RTUser.logInInBackground("login", "password");
```

<b> Create model </b>

```java
RTObject rtObject = new RTObject("ObjectTypeName");
rtObject.put("key0", 123);
rtObject.put("key1", "String Value");
rtObject.saveInBackground();
```

<b> Query model </b>

```java
RTQuery<RTObject> query = RTQuery.getQuery("ObjectTypeName");
query.getInBackground(<String objectId>);
```

<b> Upload/Download file </b>

For upload/download files specify the service in AndroidManifest.xml file

```groovy
<service
  android:name="com.amazonaws.mobileconnectors.s3.transferutility.TransferService"
  android:enabled="true" />
```

File upload example:

```java
byte[] byteData = <your data>;
RTFile file = new RTFile("fileName.fileType", byteData, RTFile.Privacy.PRIVATE);
file.saveInBackground();
```

File download example:

```java
RTFile file = <your RTFile>;
if (file.getUrl() != null) {
  file.getDataInBackground();
}
```

System can emit LOGOUT event in case login provider cannot update current session. To handle this case use default BroadcastReciever or set custom one:

Default:

```java
RTUser.registerLogoutBroadcastReceiver(this, new RTLogoutBroadcastReceiver.OnLogout() {
  @Override
  public void onLogout(Context context) {
    //your logic
  }
});
```

Custom:

```java
RTUser.registerLogoutBroadcastReceiver(this, new RTLogoutBroadcastReceiver() {
  @Override
  public void onReceive(Context context, Intent intent) {
    //your logic
  }
});
```

Recomended to settup it in your Application class in onCreate() method.

## PUSH Notifications

For handle PUSH Notifications use the next tips. 

<b> Configure Broadcast Receiver and Permissions </b>

Add the following service and broadcast receiver definitions to AndroidManifest.xml immediately before the closing </application> tag:

```groovy
<application
  ***>
  ***
  
  <service android:name="io.rftp.RTPushService" />
  <receiver android:name="io.rftp.RTParsePushBroadcastReceiver"
            android:exported="false">
    <intent-filter>
      <action android:name="io.rftp.push.intent.RECEIVE" />
      <action android:name="io.rftp.push.intent.DELETE" />
      <action android:name="io.rftp.push.intent.OPEN" />
    </intent-filter>
  </receiver>
  <receiver android:name="io.rftp.RTGcmBroadcastReceiver"
            android:permission="com.google.android.c2dm.permission.SEND">
    <intent-filter>
      <action android:name="com.google.android.c2dm.intent.RECEIVE" />
      <action android:name="com.google.android.c2dm.intent.REGISTRATION" />

      <!--IMPORTANT: Change "com.abc.appname" to match your apps package name.-->
      <category android:name="com.abc.appname" />
    </intent-filter>
  </receiver>

  <!--
  IMPORTANT: Create string value "gcm_sender_id" in strings.xml with your GCM Sender Id
  in format id:YOUR_SENDER_ID.
  -->
  <meta-data android:name="io.rftp.push.gcm_sender_id"
             android:value="@string/gcm_sender_id" />
  <!--
  Specify resource for push notification icon if you need
  -->
  <meta-data android:name="io.rftp.push.notification_icon"
             android:resource="@drawable/push_notification_icon"/>
             
  ***
</application>
```

Change the android:name attribute of <category> element above to match your application's package name.

Create string value "gcm_sender_id" in strings.xml with your GCM Sender Id in format id:YOUR_SENDER_ID.

```groovy
<string name="gcm_sender_id">id:1066459665511</string>
```

Add drawable resource for push_notification_icon in res/drawable/

<b> Configure application Permissions </b>

Also add the permissions below, typically immediately before the opening <application> tag:

```groovy
***

<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
  <!--
  GET_ACCOUNTS is only required for GCM on devices running Android lower than
  4.0.4. You may leave out this permission if you are targetting 4.0.4+.
  -->
<uses-permission android:name="android.permission.GET_ACCOUNTS" />

  <!--
  IMPORTANT: Change "com.abc.appname.permission.C2D_MESSAGE" in the lines below
  to match your apps package name + ".permission.C2D_MESSAGE".
  -->
<permission android:protectionLevel="signature"
            android:name="com.abc.appname.permission.C2D_MESSAGE" />
<uses-permission android:name="com.abc.appname.permission.C2D_MESSAGE" />

<application
   ***>
   ***
```

Change the android:name attribute in the last two lines of the snippet above to match your application's package name.

## Register Device for Push Notifications

Create an Installation object, add a property with special mark that was specified for push trigger in the console.
This property could contain key "owner" and value <RTUser> or any other key and value depends on a trigger.
For example in Application.onCreate() method:

```java
public class StartApplication extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    ***
    RTInstallation installation = RTInstallation.getCurrentInstallation();
    installation.put("ownerString", "Twitty");
    installation.saveInBackground();
  }
}
```

## License

```groovy
Copyright (c) 2016-present, RFTP Technologies Ltd.
All rights reserved.

```
