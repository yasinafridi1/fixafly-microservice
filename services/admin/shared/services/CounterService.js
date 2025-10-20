import CounterModel from "../../models/CounterModel.js";

async function generateId(tableName, pad = 2) {
  const counter = await CounterModel.findOneAndUpdate(
    { model: tableName }, // Match the model name
    { $inc: { count: 1 } }, // Increment counter
    { new: true, upsert: true } // Create if not exists
  );
  return counter.count.toString().padStart(pad, "0");
}

export default generateId;
