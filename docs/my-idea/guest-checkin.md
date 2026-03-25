I want to build a fast guest check-in web app that captures first name, last name, and an webcam photo.

- the initial screen should always show the camera feed in the middle of the screen
- on right side of the screen, there should be a form to enter first name and last name, and a check in button
- on the left it should show all the guests that have been checked in during the current day, with their name and photo and the ability to click and sign out guests (which removes them from the checked in list)
- once a guest is successfully checked in, the UI should reset and show a success message and add the guest to the checked in list on the left.

- I want all information to be stored locally in the browser using IndexedDB.
