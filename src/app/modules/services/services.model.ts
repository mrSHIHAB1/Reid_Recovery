import mongoose, { Schema, model, Types } from "mongoose";

interface IService {
  subject: string;
  message: string;
  document?: string[]; // URL of the uploaded document (image or PDF)
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    document: [{ type: String }],
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export const Service = model<IService>("Service", ServiceSchema);
export type { IService };
