import 'dotenv/config.js';

import mongoose from 'mongoose';
const db = mongoose.connection;

console.log(process.env.DATABASE_URL + ":" + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME);
mongoose.connect(process.env.DATABASE_URL + ':' + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME, { });

console.log("Connected...")

/*
 * Setup the different features.
 * To disable a feature, comment out the corresponding privilege before running:
 * npm run setup
 */
import '../models/RoutePrivileges.js';
const RoutePrivileges = mongoose.model('RoutePrivileges');

const routes = [];

console.log("Creating Privileges Group");
routes.push(await RoutePrivileges.create({
  "name": "Privileges",
  "groups": []
}));

console.log("Creating Users Group");
routes.push(await RoutePrivileges.create({
  "name": "Users",
  "groups": []
}));

console.log("Creating User Update Group");
routes.push(await RoutePrivileges.create({
  "name": "Update Users",
  "groups": []
}));

console.log("Creating Admin Panel Group");
routes.push(await RoutePrivileges.create({
  "name": "Admin Panel",
  "groups": []
}));

console.log("Creating Inventory Group");
routes.push(await RoutePrivileges.create({
  "name": "Inventory",
  "groups": []
}));

console.log("Creating Navigation Group");
routes.push(await RoutePrivileges.create({
  "name": "Navigation",
  "groups": []
}));

console.log("Creating Orders Group");
routes.push(await RoutePrivileges.create({
  "name": "Orders",
  "groups": []
}));

console.log("Creating Settings Group");
routes.push(await RoutePrivileges.create({
  "name": "Settings",
  "groups": []
}));

Promise.all(routes)
  .then(() => {
    console.log('Closing Database Connection.');
    mongoose.connection.close();
    console.log('Closed');

    console.log("Exiting...");
    process.exit();
  });
