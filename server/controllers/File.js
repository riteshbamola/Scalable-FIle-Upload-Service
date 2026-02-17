import fs from "fs";
import path from "path";
import mime from "mime-types";

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";
import File from "../Models/File.js";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const handleFileUpload = async (req, res) => {
  try {
    const userid = req.user;
    const { fileName, fileSize } = req.body;

    if (!fileName || !fileSize) {
      return res.status(400).json({ message: "Missing File data" });
    }

    // MIME VALIDATION;
    const mimeType = mime.lookup(fileName);

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    //FILE SIZE VALIDATION

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "FileSize Should be under 5mb" });
    }

    const extension = mime.extension(mimeType);
    const key = `uploads/${userid}/${Date.now()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    });

    const uploadURL = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    // Serious Bug - If file upload failed to s3 but metadata still be in DB
    const newFile = await File.create({
      owner: userid,
      originalName: fileName,
      mimeType,
      size: fileSize,

      storage: {
        provider: "s3",
        bucket: process.env.AWS_BUCKET_NAME,
        key: key,
      },
    });

    // handled using a two-phase commit style
    // approach where metadata is created in a pending state and
    // finalized only after verifying the object exists in S3.

    res.status(200).json({
      uploadURL,
      key,
      mimeType,
      fileId: newFile._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
export const handleFileRetrieval = async (req, res) => {
  try {
    const userid = req.user;
    const { fileID } = req.params;

    if (!fileID) {
      return res.status(400).json({ message: "Missing FileId" });
    }

    const newfile = await File.findById(fileID);
    if (!newfile) {
      return res.status(400).json({ message: "No file found" });
    }
    const key = newfile.storage.key;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${newfile.originalName}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 240,
    });

    res.status(200).json({
      signedUrl,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const id = req.user;

    if (!id) {
      return res.status(400).json({ message: "No User" });
    }

    const allFiles = await File.find({ owner: id });
    if (!allFiles) {
      return res.status(400).json({ message: "No file found" });
    }

    // const fileNames = allFiles.map(file => file.originalName);
    return res.status(200).json({
      allFiles,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const confirmUpload = async (req, res) => {
  const { fileId } = req.body;
  const userId = req.user;

  const file = await File.findOne({
    _id: fileId,
    owner: userId,
    status: "pending",
  });

  if (!file) {
    return res.status(404).json({ message: "Invalid file" });
  }

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: file.storage.bucket,
        Key: file.storage.key,
      }),
    );

    file.status = "uploaded";
    await file.save();

    return res.status(200).json({ message: "Upload confirmed" });
  } catch (err) {
    return res.status(400).json({
      message: "File not found in storage",
    });
  }
};

export const fileDelete = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user;
    console.log(userId);
    const file = await File.findOne({
      _id: fileId,
      owner: userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: file.storage.bucket,
          Key: file.storage.key,
        }),
      );

      await s3.send(
        new DeleteObjectCommand({
          Bucket: file.storage.bucket,
          Key: file.storage.key,
        }),
      );

      await File.deleteOne({ _id: fileId });

      return res.json({ message: "File deleted successfully" });
    } catch (err) {
      return res.status(500).json({
        message: "Failed to delete file",
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// haandle multipart

export const startUpload = async (req, res) => {
  try {
    const userid = req.user;
    const { fileName, fileSize } = req.body;

    const mimeType = mime.lookup(fileName);

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const extension = mime.extension(mimeType);
    const key = `uploads/${userid}/${Date.now()}.${extension}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      ContentType: mimeType,
    });

    const response = await s3.send(command);

    res.json({
      uploadId: response.UploadId,
      key: fileName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to start upload" });
  }
};

export const getMultiPartURL = async (req, res) => {
  try {
    const { key, uploadId, partNumber } = req.body;

    const command = new UploadPartCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      uploadId: uploadId,
      PartNumber: partNumber,
    });

    const response = await s3.send(command);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({
      url: url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get multipart URL" });
  }
};

export const completeUpload = async (req, res) => {
  try {
    const { key, uploadId, parts } = req.body;

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part, index) => ({
          ETag: part.etag,
          PartNumber: index + 1,
        })),
      },
    });

    const response = await s3.send(command);
    res.json({
      location: response.Location,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to complete upload" });
  }
};

export const cancelUpload = async (req, res) => {
  try {
    const { key, uploadId } = req.body;

    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      UploadId: uploadId,
    });

    await s3.send(command);
    res.json({
      message: "Upload canceled",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to cancel upload" });
  }
};
