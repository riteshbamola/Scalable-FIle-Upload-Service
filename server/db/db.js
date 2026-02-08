import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://rishubamola01:DYe5T5G2Q7HSRoSw@cluster0.r4eopsq.mongodb.net/scalable_file_upload"
    );
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
