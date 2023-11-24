import mongoose from 'mongoose';

export default defineNitroPlugin(async () => {

  console.log('I run');

  mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`, {
    /*
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //Removes an annoying deprecation warning
    useCreateIndex: true
    */
  });

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {});

  await Promise.all([
    import('../models/User.ts'),
    import('../models/Privileges.js'),
    import('../models/RoutePrivileges.js'),
    import('../models/Tag.js'),
    import('../models/InventoryItem.js'),
    import('../models/Image.js'),
    import('../models/NavigationCategory.js'),
    import('../models/Order.js'),
    import('../models/Settings.js')
  ]);
  //Tie each schema to a collection for use in downstream routes

  return db;
});
