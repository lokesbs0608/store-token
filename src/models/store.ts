import mongoose, { Schema, Document } from 'mongoose';

interface IStore extends Document {
    user_id: mongoose.Schema.Types.ObjectId;
    storeName: string;
    address: string;
    storeFrontImage: string;
    storeLogo: string;
    storeBannerImages: string[];
    accountDetails: {
        bankName: string;
        ifsc: string;
        accountNumber: string;
        upiId: string;
        gstNumber: string;
    };
    qrCode?: string; // Field to store QR code
}

const StoreSchema: Schema<IStore> = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    storeFrontImage: { type: String, required: false },
    storeLogo: { type: String, required: false },
    storeBannerImages: [{ type: String }],
    accountDetails: {
        bankName: { type: String, required: false },
        ifsc: { type: String, required: false },
        accountNumber: { type: String, required: false },
        upiId: { type: String, required: false },
        gstNumber: { type: String, required: false },
    },
    qrCode: { type: String },
});

const StoreModel = mongoose.model<IStore>('Store', StoreSchema);
export default StoreModel;
