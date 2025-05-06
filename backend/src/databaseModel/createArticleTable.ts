import mongoose from 'mongoose';

//article
const ArticleTable = new mongoose.Schema({
  title: {type: String, required: true},
  category: String,
  content: String,
  likes: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, default: '' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]//comments are array
});

export default mongoose.model('Article', ArticleTable);
