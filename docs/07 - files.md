# Files

## The RTFile

`RTFile` lets you store application files in the cloud that would otherwise be too large or cumbersome to fit into a regular `RTObject`. The most common use case is storing images but you can also use it for documents, videos, music, and any other binary data (up to 10 megabytes).

Getting started with `RTFile` is easy. First, you'll need to have the data in `byte[]` form and then create a `RTFile` with it. In this example, we'll just use a string:

```java
byte[] data = "Working at Rooftop is great!".getBytes();
RTFile file = new RTFile("resume.txt", data, RTFile.Privacy.PRIVATE);
```

***Note:*** You don't need to worry about filename collisions. Each upload gets a unique identifier so there's no problem with uploading multiple files named `resume.txt`.

Next you'll want to save the file up to the cloud. As with `RTObject`, there are many variants of the `save` method you can use depending on what sort of callback and error handling suits you. Also you have to specify acl directly for the file.

```java
file.setAcl(new RTACL(RTUser.getCurrentUser()));
file.saveInBackground();
```

***Note:*** Default acl doesn't applied for the `RTFile`.

Finally, after the save completes, you can associate a `RTFile` onto a `RTObject` just like any other piece of data:

```java
RTObject jobApplication = new RTObject("JobApplication");
jobApplication.put("applicantName", "Joe Smith");
jobApplication.put("applicantResumeFile", file);
jobApplication.saveInBackground();
```

Retrieving it back involves calling one of the `getData` variants on the `RTObject`. Here we retrieve the resume file off another JobApplication object:

```java
RTFile applicantResume = (RTFile)anotherApplication.get("applicantResumeFile");
applicantResume.getDataInBackground(new RTGetDataCallback() {
  public void done(byte[] data, RTException e) {
    if (e == null) {
      // data has the bytes for the resume
    } else {
      // something went wrong
    }
  }
});
```

Just like on `RTObject`, you will most likely want to use the background version of `getData`.

Also `RTFile` could be crated from java.io.File class:

```java
File androidFile = [get your file from somewhere];
RTFile file = new RTFile("resume.txt", androidFile, RTFile.Privacy.PRIVATE);
```


## Progress

It's easy to get the progress of both uploads and downloads using `RTFile` by passing a `RTProgressCallback` to `saveInBackground` and `getDataInBackground`. For example:

```java
byte[] data = "Working at Rooftop is great!".getBytes();
RTFile file = new RTFile("resume.txt", data, RTFile.Privacy.PRIVATE);

file.setAcl(new RTACL(RTUser.getCurrentUser()));
file.saveInBackground(new RTSaveCallback() {
  public void done(RTException e) {
    // Handle success or failure here ...
  }
}, new RTProgressCallback() {
  public void done(Integer percentDone) {
    // Update your progress spinner here. percentDone will be between 0 and 100.
  }
});
```
