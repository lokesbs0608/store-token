import mongoose, { Document, Schema } from 'mongoose';

// Define interface for the product schema
interface IProduct extends Document {
    name: string;
    description: string;
    category: mongoose.Types.ObjectId;
    brand?: string;
    sku: string;
    price: number;
    discount: number;
    stock: number;
    images: {
        url: string;
        altText?: string;
        isPrimary?: boolean;
    }[];
    specifications: {
        color?: string;
        size?: string;
        weight?: number;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
        };
        material?: string;
        other?: Map<string, string>;
    };
    ratings: {
        user: mongoose.Types.ObjectId;
        rating: number;
        review?: string;
        date: Date;
    }[];
    averageRating: number;
    tags: string[];
    status: 'active' | 'inactive' | 'archived';
    created_at: Date;
    updated_at: Date;
    discountedPrice?: number;
    store_id: mongoose.Types.ObjectId;
}

// Define the product schema
const productSchema: Schema<IProduct> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        max_length: 150,
    },
    description: {
        type: String,
        required: false,
        max_length: 2000,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    sku: {
        type: String,
        unique: true,
        required: false,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    images: [
        {
            url: {
                type: String,
                required: true,
            },
            altText: {
                type: String,
                trim: true,
            },
            isPrimary: {
                type: Boolean,
                default: false,
            },
        },
    ],
    specifications: {
        color: {
            type: String,
            trim: true,
        },
        size: {
            type: String,
            trim: true,
        },
        weight: {
            type: Number,
            min: 0,
        },
        dimensions: {
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            height: { type: Number, min: 0 },
        },
        material: {
            type: String,
            trim: true,
        },
        other: {
            type: Map,
            of: String,
        },
    },
    ratings: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
            review: { type: String, trim: true },
            date: { type: Date, default: Date.now },
        },
    ],
    averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 0,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    store_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

// Pre-save middleware to update the updated_at field automatically
productSchema.pre<IProduct>('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Virtual field to calculate discounted price
productSchema.virtual('discountedPrice').get(function (this: IProduct) {
    return this.price - (this.price * this.discount) / 100;
});

export default mongoose.model<IProduct>('Product', productSchema);
