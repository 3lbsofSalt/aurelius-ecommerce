import 'dotenv/config.js';

import mongoose from 'mongoose';
const db = mongoose.connection;

console.log(process.env.DATABASE_URL + ":" + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME);
mongoose.connect(process.env.DATABASE_URL + ':' + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //Removes an annoying deprecation warning
  useCreateIndex: true
});

console.log("Connected...")

/*
 * Run this script to create an admin user for the first time.
 * It should be ran as follows:
 * npm run scripts/createAdmin -- EMAIL_OF_ACCOUNT_TO_BE_MADE_ADMIN
 */

import '../models/User.js';
const User = mongoose.model('User');

User.updateOne({ email: process.argv[2] }, { permissionGroup: 'Admin' })
    .then((res) => {

        console.log('User with email ' + process.argv[2] + ' was made an administrator');
        console.log('Closing Database Connection...');
        mongoose.connection.close();
        console.log('Closed');

        process.exit();
    });
