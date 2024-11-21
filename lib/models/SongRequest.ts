import mongoose, { Schema } from "mongoose";

interface SongDB {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
  imgSrc: string;
  timestamp: Date;
}

interface SongRequestDB {
  date: string;
  requests: SongDB[];
}

const songSchema = new Schema<SongDB>({
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
  imgSrc: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
  },
});

// Define the schema for the song request grouped by date
const songRequestSchema = new Schema<SongRequestDB>({
  date: {
    type: String,
    required: true,
  },
  requests: [songSchema], // Array of song requests
});

export const SongRequestModel: mongoose.Model<SongRequestDB> =
  mongoose.models["song-request"] ||
  mongoose.model<SongRequestDB>(
    "song-request",
    songRequestSchema,
    "song-requests"
  );
