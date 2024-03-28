import mongoose, { Schema } from "mongoose";

const suggestionSchema = new Schema({
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

const suggestionRequestSchema = new Schema({
  requests: [suggestionSchema], // Array of suggestion requests
});

const SuggestionRequestModel =
  mongoose.models.SuggestionRequestModel ||
  mongoose.model(
    "suggestion-request",
    suggestionRequestSchema,
    "suggestion-requests"
  );

export default SuggestionRequestModel;
