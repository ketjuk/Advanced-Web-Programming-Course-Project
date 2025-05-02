import mongoose from 'mongoose';

const ReplyTable = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  });
  
const CommentTable = new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    createdAt: { type: Date, default: Date.now },
    replies: [ReplyTable]
});
  
export default mongoose.model('Comment', CommentTable);