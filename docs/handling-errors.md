# Handling Errors

Many of the methods on `RTObject`, including `save()`, `delete()`, and `get()` will throw a `RTException` on an invalid request, such as deleting or editing an object that no longer exists in the cloud, or when there is a network failure preventing communication with the Rooftop Cloud. You will need to catch and deal with these exceptions.

**TBD**
