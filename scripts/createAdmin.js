const db = connect('127.0.0.1:27017/aurelius');

console.log("Connected...")

/*
 * Run this script to create an admin user for the first time.
 * Selecting the admin is hardcoded into the script.
 * It should be ran as follows:
 * mongosh createAdmin.js
 */

// UPDATE THE EMAIL HERE BEFORE USAGE
db.users.updateOne({ email: 'max.ramsdell@protonmail.com' }, { $set: { permissionGroup: 'Admin' }})

//db.close();
//process.exit();
