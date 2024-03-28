import mongoose, { Schema } from "mongoose";

const songSchema = new Schema({
  songTitle: {
    type: String,
    required: true,
  },
  singer: {
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

// Define the schema for the song request grouped by date
const songRequestSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  requests: [songSchema], // Array of song requests
});

const SongRequestModel =
  mongoose.models.SongRequestModel ||
  mongoose.model("song-request", songRequestSchema, "song-requests");

export default SongRequestModel;
