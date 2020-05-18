# backend-userservice
This is the userservice from the WoidBook backend services

## What is it used for?
- For all actions that happen inside the app.
- The app sends requests to this service.
- With this seperated service from the authservice the performance can be reduced
- It also make sure that the database is always accessable

## Documentation
```
/user/data
```
- Get data from verified user from the database
- Need to be authenticated

```
/user/UID/profile
```
- Get profile data
- Need to be authenticated
- UID (Params) is the UID of the profile

```
/user/UID/follow
```
- Add user to follower list
- Need to be authenticated
- UID (Params) is the UID of the profile

```
/user/options/information/update
```
- Add user to follower list
- Need to be authenticated
- Informations (Body)

```
/user/options/notifications/update
```
- Add user to follower list
- Need to be authenticated
- Notifications (Body)

```
/user/options/privacy/update
```
- Add user to follower list
- Need to be authenticated
- Privacy (Body)
