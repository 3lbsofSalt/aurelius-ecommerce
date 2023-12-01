import mongoose from 'mongoose';
import User from '../models/User.ts';

export default defineNitroPlugin(async () => {

  console.log('I run');

  console.log(process.env.MONGODB_URL);
  console.log(process.env.MONGODB_NAME);
  mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`, {
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
  
  const users = await User.find({});
  console.log(users);

  return db;
});
