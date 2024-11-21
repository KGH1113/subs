import mongoose, { Schema } from "mongoose";

interface SgstnDB {
  name: string;
  studentNumber: string;
  suggestion: string;
  answer: string;
  timestamp: Date;
}

interface SgstnRequestDB {
  requests: SgstnDB[];
}

const suggestionSchema = new Schema<SgstnDB>({
  answer: {
    type: String,
    required: true,
  },
  suggestion: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentNumber: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
  },
});

const suggestionRequestSchema = new Schema<SgstnRequestDB>({
  requests: [suggestionSchema], // Array of suggestion requests
});

export const SuggestionRequestModel: mongoose.Model<SgstnRequestDB> =
  mongoose.models["suggestion-request"] ||
  mongoose.model<SgstnRequestDB>(
    "suggestion-request",
    suggestionRequestSchema,
    "suggestion-requests"
  );
