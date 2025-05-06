import mongoose from 'mongoose';

const LoginUserTable = new mongoose.Schema({
  username: { type: String, required: true, ref: 'User' },
  token: { type: String, required: true, unique: true },
});

export default mongoose.model('LoginUser', LoginUserTable);
