import mongoose from "mongoose";

export type AdminDocument = mongoose.Document & {
    login: string;
    name: string,
    password: string;
    salt: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    lastActive: Date;
    claims: Object;
};

const adminSchema = new mongoose.Schema({
    login: {type: String, unique: true},
    password: String,
    name: String,
    salt: String,
    avatar: String,
    createdAt: Date,
    updatedAt: Date,
    lastActive: Date,
    claims: Object,
}, {timestamps: true});

export const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
