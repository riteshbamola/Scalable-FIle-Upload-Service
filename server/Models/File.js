import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number, 
      required: true
    },

    storage: {
      provider: {
        type: String,
        enum: ["s3"],
        default: "s3"
      },
      bucket: {
        type: String,
        required: true
      },
      key: {
        type: String,
        required: true,
        unique: true
      },
      region: {
        type: String
      }
    },

    folder: {
      type: String,
      default: "/"
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private"
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model("File", FileSchema);
