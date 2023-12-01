// Update the db name here before running.
// If you're using the mongo docker image this will work perfectly as is.
const db = connect('127.0.0.1:27017/aurelius');
console.log("Connected...")

/*
 * Setup the different features.
 * To disable a feature, comment out the corresponding privilege before running:
 * `mongosh setup.js`
 */

const routes = [];

console.log("Creating Privileges Group");
db.routeprivileges.insertOne({
  "name": "Privileges",
  "groups": []
});

console.log("Creating Users Group");
db.routeprivileges.insertOne({
  "name": "Users",
  "groups": []
});

console.log("Creating User Update Group");
db.routeprivileges.insertOne({
  "name": "Update Users",
  "groups": []
});

console.log("Creating Admin Panel Group");
db.routeprivileges.insertOne({
  "name": "Admin Panel",
  "groups": []
});

console.log("Creating Inventory Group");
db.routeprivileges.insertOne({
  "name": "Inventory",
  "groups": []
});

console.log("Creating Navigation Group");
db.routeprivileges.insertOne({
  "name": "Navigation",
  "groups": []
});

console.log("Creating Orders Group");
db.routeprivileges.insertOne({
  "name": "Orders",
  "groups": []
});

console.log("Creating Settings Group");
db.routeprivileges.insertOne({
  "name": "Settings",
  "groups": []
});

