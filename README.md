# backend-userservice
This is the userservice from the WoidBook backend services

## What is it used for?
- For all actions that happen inside the app.
- The app sends requests to this service.
- With this seperated service from the authservice the performance can be reduced
- It also make sure that the database is always accessable

## Documentation
``` 
/user/data || gets you the data from the verified user
/user/UID/profile || gets you the profile data from the user in the URL 
/user/UID/follow || follow or unfollow a user
/user/options/information/update || update your information
/user/options/notifications/update || update your notifications
/user/options/privacy/update || update your privacy
```