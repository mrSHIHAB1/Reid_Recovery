import mongoose, { Schema, model, Types } from "mongoose";

interface ITruck {
  ticket: string;
  date: Date;
  truckNo: string;
  photo?: string;
  yardage: number;
  driver: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const TruckSchema: Schema<ITruck> = new Schema(
  {
    ticket: { type: String, required: true },
    date: { type: Date, required: true },
    truckNo: { type: String, required: true },
    yardage: { type: Number, required: true },
     photo: { type: String },
     driver: { type: mongoose.Schema.Types.ObjectId,ref: "User", required: true},
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export const Truck = model<ITruck>("Truck", TruckSchema);
export type { ITruck };
