import mongoose, { Document, Schema } from 'mongoose';

interface ICategory extends Document {
    name: string;
    description?: string;
    parentCategory?: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
    store_id:mongoose.Types.ObjectId
}

const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        max_length: 100,
    },
    description: {
        type: String,
        trim: true,
        max_length: 500,
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',  // Reference to Category model
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    store_id:{
        type:Schema.Types.ObjectId,
        ref: 'Category',  // Reference to Category model
        required:true,
    }
});

categorySchema.pre<ICategory>('save', function (next) {
    this.updated_at = new Date();
    next();
});

export default mongoose.model<ICategory>('Category', categorySchema);
