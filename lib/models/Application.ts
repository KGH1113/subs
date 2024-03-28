import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  studentNumber: {
    type: String,
    required: true,
  },
  applicationFileURL: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
  },
});

const ApplicationSchema = new Schema({
  applications: [applicationSchema],
});

const ApplicationModel =
  mongoose.models.ApplicationModel ||
  mongoose.model(
    "application-schema",
    ApplicationSchema,
    "new-crew-applications"
  );

export default ApplicationModel;
