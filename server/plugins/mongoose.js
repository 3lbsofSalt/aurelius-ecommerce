import mongoose from 'mongoose';
import User from '../models/User.ts';

export default defineNitroPlugin(async () => {
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
    import('../models/Setting'),
    import('../models/InventoryItem'),
    import('../models/User'),
    import('../models/Privileges'),
    import('../models/RoutePrivileges'),
    import('../models/Tag'),
    import('../models/ProductNavigation'),
    import('../models/Order'),
    import('../models/idCounter')
  ]);
  //Tie each schema to a collection for use in downstream routes
  return db;
});
