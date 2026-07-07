import mongoose from 'mongoose';  
  
const CustomerSchema = new mongoose.Schema({  
  name: { type: String, required: true, trim: true },  
});  
  
