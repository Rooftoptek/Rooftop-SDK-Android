# Roles

As your app grows in scope and user-base, you may find yourself needing more coarse-grained control over access to pieces of your data than user-linked ACLs can provide. To address this requirement, Rooftop supports a form of [Role-based Access Control](http://en.wikipedia.org/wiki/Role-based_access_control). Roles provide a logical way of grouping users with common access privileges to your Rooftop data. Roles are named objects that contain users and other roles.  Any permission granted to a role is implicitly granted to its users as well as to the users of any roles that it contains.

For example, in your application with curated content, you may have a number of users that are considered "Moderators" and can modify and delete content created by other users.  You may also have a set of users that are "Administrators" and are allowed all of the same privileges as Moderators, but can also modify the global settings for the application. By adding users to these roles, you can ensure that new users can be made moderators or administrators, without having to manually grant permission to every resource for each user.

We provide a specialized class called `RTRole` that represents these role objects in your client code. `RTRole` is a subclass of `RTObject`, and has all of the same features, such as a flexible schema, automatic persistence, and a key value interface.  All the methods that are on `RTObject` also exist on `RTRole`.  The difference is that `RTRole` has some additions specific to management of roles.

## Properties

`RTRole` has several properties that set it apart from `RTObject`:

*   **name**: The name for the role. This value is required, and can only be set once as a role is being created. The name must consist of alphanumeric characters, spaces, -, or _.  This name will be used to identify the Role without needing its objectId.
*   **users**: A [relation](#objects-pointers) to the set of users that will inherit permissions granted to the containing role.

## Security for Role Objects

The `RTRole` uses the same security scheme (ACLs) as all other objects on Rooftop, except that it requires an ACL to be set explicitly. Generally, only users with greatly elevated privileges (e.g. a master user or Administrator) should be able to create or modify a Role, so you should define its ACLs accordingly.  Remember, if you give update-access to a `RTRole` to a user, that user can add other users to the role, or even delete the role altogether.

To create a new `RTRole`, you would write:

```java
// By specifying no write privileges for the ACL, we can ensure the role cannot be altered.
RTACL roleACL = new RTACL();
roleACL.setPublicAccess(RTACL.READ_FLAG);
RTRole role = new RTRole("Administrator", roleACL);
role.saveInBackground();
```

You can add users that should inherit your new role's permissions through the "users" relations on `RTRole`:

```java
RTRole role = new RTRole(roleName, roleACL);
for (RTUser user : usersToAddToRole) {
  role.getUsers().add(user)
}
role.saveInBackground();
```

Take great care when assigning ACLs to your roles so that they can only be modified by those who should have permissions to modify them.

## Security for Other Objects

Now that you have created a set of roles for use in your application, you can use them with ACLs to define the privileges that their users will receive. Each `RTObject` can specify a `RTACL`, which provides an access control list that indicates which users and roles should be granted read or write access to the object.

Giving a role read, update or delete permission to an object is straightforward. You can either use the `RTRole`:

```java
RTRole moderators = /* Query for some RTRole */;
RTObject wallPost = new RTObject("WallPost");
RTACL postACL = new RTACL();
postACL.setRoleAccess(moderators, RTACL.UPDATE_FLAG);
wallPost.setACL(postACL);
wallPost.saveInBackground();
```

You can avoid querying for a role by specifying its name for the ACL:

```java
RTObject wallPost = new RTObject("WallPost");
RTACL postACL = new RTACL();
postACL.setRoleAccess("Moderators", RTACL.READ_FLAG | RTACL.UPDATE_FLAG);
wallPost.setACL(postACL);
wallPost.save();
```

Role-based `RTACL`s can also be used when specifying default ACLs for your application, making it easy to protect your users' data while granting access to users with additional privileges.  For example, a moderated forum application might specify a default ACL like this:

```java
RTACL defaultACL = new RTACL();
// Everybody can read objects created by this user
defaultACL.setPublicAccess(RTACL.READ_FLAG);
// Moderators can also modify these objects
defaultACL.setRoleAccess("Moderators", RTACL.READ_FLAG | RTACL.UPDATE_FLAG);
// And the user can read and modify its own objects
RTACL.setDefaultACL(defaultACL, true);
```

