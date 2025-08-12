import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true }, // Model name
  count: { type: Number, default: 0 }, // Counter value
});

const CounterModel = mongoose.model("counter", counterSchema);
export default CounterModel;
