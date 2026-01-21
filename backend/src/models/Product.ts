import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  nutrients: string[];
  imageUrl?: string;
  inStock: boolean;
  priceHistory?: Array<{
    date: Date;
    price: number;
  }>;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  nutrients: [String],
  imageUrl: String,
  inStock: { type: Boolean, default: true },
  priceHistory: [{
    date: { type: Date, default: Date.now },
    price: Number
  }]
});

export default mongoose.model<IProduct>('Product', productSchema);