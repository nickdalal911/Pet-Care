import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "provider"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ versionKey: false });
  delete obj.passwordHash;
  if (!obj.role) {
    obj.role = "user";
  }
  if (obj.role !== "provider") {
    delete obj.licenseNumber;
  }
  return obj;
};

export default mongoose.model("User", userSchema);