import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  userId?: string;
  imageUrl: string;
  plantPart: string;
  confidence: number;
  maturityLevel: string;
  maturityProgress: number;
  healthStatus: 'healthy' | 'diseased';
  diseases?: string[];
  nutritionalValue: {
    vitaminA?: string;
    vitaminC?: string;
    iron?: string;
    protein?: string;
  };
  viableProducts?: any[];
  timestamp: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  userId: { type: String },
  imageUrl: { type: String, required: true },
  plantPart: { type: String, required: true },
  confidence: { type: Number, required: true },
  maturityLevel: { type: String, required: true },
  maturityProgress: { type: Number, required: true },
  healthStatus: { 
    type: String, 
    enum: ['healthy', 'diseased'], 
    required: true 
  },
  diseases: [String],
  nutritionalValue: {
    vitaminA: String,
    vitaminC: String,
    iron: String,
    protein: String
  },
  viableProducts: [Schema.Types.Mixed],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IAnalysis>('Analysis', analysisSchema);