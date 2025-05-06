import mongoose from 'mongoose';

const UserTable = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: '' },

  writtenComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});


export default mongoose.model('User', UserTable);
