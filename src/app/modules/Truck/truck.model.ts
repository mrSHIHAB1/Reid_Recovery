import mongoose, { Schema, model, Types } from "mongoose";

interface ITruck {
  ticket: string;
  date: string;
  truckNo: string;
  photo?: string;
  yardage: string;
  driver: Types.ObjectId;
  driverName?: string; // virtual field for populated driver name
  createdAt?: Date;
  updatedAt?: Date;
}

const TruckSchema: Schema<ITruck> = new Schema(
  {
    ticket: { type: String, required: true },
    date: { type: String, required: true },
    truckNo: { type: String, required: true },
    yardage: { type: String, required: true },
     photo: { type: String },
     driver: { type: mongoose.Schema.Types.ObjectId,ref: "User", required: true},
     driverName: { type: String }, 
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export const Truck = model<ITruck>("Truck", TruckSchema);
export type { ITruck };
