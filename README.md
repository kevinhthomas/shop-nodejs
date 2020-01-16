# shop-nodejs

<p>Currently a work in progress. There is a lot of refactoring to be done to aggregate a lot of the logic in the routes and controllers. Need to create some layers between controllers and models, as well as between some libraries and the files that are directly using them.</p>

<p>
A simple Node.js shop using view templates and MongoDB. Follows a Udemy class.
<br/>
Requires installation of Node.js (v12.14.1) and a working MongoDB Cluster. Uses Mongoose ODM for DB interaction and EJS for templating. A couple config variables are required to be set up in config/config.js.
<br/>
<br/>
Currently needs to be supplied with a user/pass and URL to MongoDB cluster (server.js). Will automatically set up a default user upon starting up the server.
<br/>
To start, in command line, navigate to root directory of project and run:
<br/>
<code>npm install</code>
<br/>
<code>npm run dev-start</code>
<br/>
<br/>
Afterwards, you can reach it by going to: http://localhost:3000/
</p>
