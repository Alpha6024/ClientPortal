import "dotenv/config";
import mongoose from "mongoose";
import Template from "./models/Template.js";

await mongoose.connect(process.env.MONGO_URI);

const result = await Template.deleteOne({ type: "contract", isDefault: true });
console.log(`Deleted ${result.deletedCount} contract template(s)`);

await mongoose.disconnect();
console.log("Done — restart your backend to re-seed the new template.");
