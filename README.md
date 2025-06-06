# Weather API
A Weather API for [Genesis Software Engineering School 5.0](https://academy.gen.tech/software-engineering-school) Case Task

Author: Ivasiuk Mykhailo (https://github.com/Fenix125)

## Prerequisites

**node, docker, postgres, axios, dotenv, express, knex, node-cron, nodemailer, pg, swagger-ui-express, yamljs**

### Compilation
**!NOTE**

Before next steps are required to set environment variables. In repo there is an example of it called .env.example with some already defined, which you may leave them unchanged, but it is necessary to set WEATHER_API_KEY, GMAIL and GMAIL_PASS. 

The WEATHER_API_KEY is the api key for [1] Weather API, register there, go to dashboard, then API and copy your API key.

The GMAIL is the email of account that will sent the subscription confirmation and weather updates to user's, you may use your existing gmail or create a new one.

The GMAIL_PASS is the app password for gmail, you can generate it here: https://myaccount.google.com/apppasswords

**!At the end rename .env.example to .env**



To compile the program basically clone the repo:
```
git clone git@github.com:Fenix125/weather_api.git
```
and then run:
```
docker-compose up --build
```

Docker will create the image and two containers: one with app, second with posgtres database




Also you can run program manually using npm:
```
npm install
```
Create weather_api database in postgres on port 5432, then run:
```
npm start
```
Now the API is available on http://localhost:3000

If there will be some error conections with your postgres db you can verify if in development stage (in knextfile.js configuration file) host and user variables is the same as yours


### Usage

- GET /api/weather?city={city} - gets current weather for a given city with Temperature, Humidity and Weather description

- POST /api/subscribe - subscribes a given email to weather updates for a given city with a given frequency (daily or hourly), send's an confirmation email with your unique token, may sure to remember/save it, email provides a link which you can click to confirm subscription. Email which are not confirmed after more than 10 minutes will be automatically deleted. Users can subscribe to multiple cities weather updates

- GET /api/confirm/{token} - confirms email subscription (the link to this endpoint is provided on the confirmation email)

- GET /api/unsubscribe/{token} - unsubscribes user from weather updates (a link to this endpoint is provided in each weather update)



### General

- For testing/basic understanding of REST API methods there were used [Swagger UI](https://editor.swagger.io), you can access it by adding **/api-docs** to url (note that it only
  works for localhost), even though it sometimes has bugs (as the 2.0 older version of swagger is used), it was great for generating requests
- Express was used to build RESTful API
- PostgreSQL was used as a relational database to store users necessary data
- Knex.js an amazing SQL query builder and migration tool to manage database schema.
- Docker & Docker Compose to containerize both the API and database, ensuring consistent development and deployment environments.
- node-cron schedules fetch-and-send jobs at the specified frequency per city. If weather updates are set to be hourly - every hour (xx:00), for daily - every day at 08:00
- Hosted on Render.com


### Extra tasks:
- There is a single HTML page which you can use for getting weather description, subcribing for weather updates, entering confirmation/unsubscription token.
- The API was hosted using [2] Render services, it's url: https://weather-api-ydua.onrender.com, you will receive all kind of emails from weatherapiappp@gmail.com (make sure to check the spam folder, if no email are being delivered)


### References
- [1] [Weather API](https://www.weatherapi.com)
- [2] [Render](https://render.com)













