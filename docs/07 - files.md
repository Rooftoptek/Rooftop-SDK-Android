# Files

## The RTFile

`RTFile` lets you store application files in the cloud that would otherwise be too large or cumbersome to fit into a regular `RTObject`. The most common use case is storing images but you can also use it for documents, videos, music, and any other binary data (up to 10 megabytes).

Getting started with `RTFile` is easy. First, you'll need to have the data in `byte[]` form and then create a `RTFile` with it. In this example, we'll just use a string:

```java
byte[] data = "Working at Rooftop is great!".getBytes();
RTFile file = new RTFile("resume.txt", data, RTFile.Privacy.PRIVATE);
```

Notice in this example that we give the file a name of `resume.txt`. There's two things to note here:

*   You don't need to worry about filename collisions. Each upload gets a unique identifier so there's no problem with uploading multiple files named `resume.txt`.
*   It's important that you give a name to the file that has a file extension. This lets Rooftop figure out the file type and handle it accordingly. So, if you're storing PNG images, make sure your filename ends with `.png`.

Next you'll want to save the file up to the cloud. As with `RTObject`, there are many variants of the `save` method you can use depending on what sort of callback and error handling suits you.

```java
file.saveInBackground();
```

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
applicantResume.getDataInBackground(new GetDataCallback() {
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

## Progress

It's easy to get the progress of both uploads and downloads using RTFile by passing a ProgressCallback to `saveInBackground` and `getDataInBackground`. For example:

```java
byte[] data = "Working at Rooftop is great!".getBytes();
RTFile file = new RTFile("resume.txt", data, RTFile.Privacy.PRIVATE);

file.saveInBackground(new SaveCallback() {
  public void done(RTException e) {
    // Handle success or failure here ...
  }
}, new ProgressCallback() {
  public void done(Integer percentDone) {
    // Update your progress spinner here. percentDone will be between 0 and 100.
  }
});
```

You can delete files that are referenced by objects using the [REST API](/docs/rest/guide/#files-deleting-files). You will need to provide the master key in order to be allowed to delete a file.

If your files are not referenced by any object in your app, it is not possible to delete them through the REST API. You may request a cleanup of unused files in your app's Settings page. Keep in mind that doing so may break functionality which depended on accessing unreferenced files through their URL property. Files that are currently associated with an object will not be affected.
