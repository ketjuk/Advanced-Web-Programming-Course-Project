import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    //Connect to MongoDB with a hardcoded address
    //username: user
    //password: gpA1c9ElHkguhTLX
    const uri = 'mongodb+srv://user:gpA1c9ElHkguhTLX@bluenote.fihfvag.mongodb.net/?retryWrites=true&w=majority&appName=blueNote';
    
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

export default connectDB;