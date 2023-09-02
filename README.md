## Project: NASA APOD Social Media Website

# Overview
This project is a unique social media platform that integrates with NASA's Astronomy Picture of the Day (APOD). Users can select a specific date to view the astronomy picture associated with it and the two preceding days. They can also interact with the images by leaving comments.

# Backend
Technologies and Frameworks:

Node.js: Server-side runtime environment.

Express: Web application framework for routing and middleware.

SQLite3: Used as the database.

Sequelize: ORM for database interactions.

Key Features:

Routes:

admin.js: Handles admin-related functionalities.

home-page.js: Manages the main feed and user interactions with NASA's APOD.

Models:

comments.js: Represents user comments on the images.

user.js: Represents registered users.

Controllers:

feed.js: Manages user comments on images.

log-in.js: Handles user login functionalities.

clients.js: Deals with user registration and session management.

error.js: Handles unexpected errors and routing issues.



# Frontend

Technologies and Frameworks:

EJS: Embedded JavaScript templates for generating HTML markup.

Bootstrap: For styling and responsive design.

Key Features:

Views:

feed.ejs: Displays the user feed and comments section.

login.ejs: Provides a login interface.

register.ejs: Registration interface for new users.

confirm-pass.ejs: Password confirmation during registration.

errorHandler.ejs: Handles and displays errors to the user.



## More information:

in order to run the program, run npm install and cofigure the app.js file.

the bcrypt uses salt = 10 

session ends after 3 hours

cookies end after 30 seconds 

poling every 15 seconds 

