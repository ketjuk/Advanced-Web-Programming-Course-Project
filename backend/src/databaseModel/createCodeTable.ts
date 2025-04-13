import mongoose from 'mongoose';

const VerificationCodeTable = new mongoose.Schema({
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 },//each record only lasts for 3 minutes
});

export default mongoose.model('VerificationCode', VerificationCodeTable);
