import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        // Add the database name (nutrileaf) after mongodb.net/
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://cyne0:c6y3sQ3VxPq7XD54@cluster0.dwasfum.mongodb.net/nutrileaf?retryWrites=true&w=majority&appName=Cluster0';

        await mongoose.connect(mongoUri);

        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});