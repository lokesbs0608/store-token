import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for account details
interface AccountDetails {
    bankName: string;
    ifsc: string;
    accountNumber: string;
    upiId: string;
    gstNumber: string;
}

// Define the interface for the Store model
interface Store extends Document {
    userId: mongoose.Types.ObjectId; // Reference to the User model
    storeName: string;
    address: string;
    storeFrontImage: string;
    storeLogo: string;
    storeBannerImages: string[];
    accountDetails: AccountDetails; // Embedded AccountDetails schema
}

// Schema for account details
const accountDetailsSchema = new Schema<AccountDetails>({
    bankName: { type: String, required: true },
    ifsc: { type: String, required: true },
    accountNumber: { type: String, required: true },
    upiId: { type: String, required: true },
    gstNumber: { type: String, required: true },
});

// Main store schema
const storeSchema = new Schema<Store>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    storeFrontImage: { type: String, required: false },
    storeLogo: { type: String, required: false },
    storeBannerImages: { type: [String], required: false },
    accountDetails: { type: accountDetailsSchema, required: false },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create the Store model
const StoreModel = mongoose.model<Store>('Store', storeSchema);

export default StoreModel;
