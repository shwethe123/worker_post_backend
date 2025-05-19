const mongoose = require('mongoose');
const leave_schema = require('../../models/leaveModel/leaveModel');
const auth = require('../../middlewares/auth');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// 🧩 Helper function to extract public_id from image URL
function extractPublicId(imageUrl) {
  // Matches after /upload/ and removes extension
  const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}

const leaveController = {
  auth,

  getPost: async (req, res) => {
    try {
      const leave_all = await leave_schema.find().sort({ createdAt: -1 });
      return res.json(leave_all);
    } catch (error) {
      return res.status(500).json({ msg: 'Error', error: error.message });
    }
  },

  createPost: async (req, res) => {
    try {
      const {
        id,
        mm_name,
        position,
        remark,
        start_date,
        end_date,
        half_day,
        condition
      } = req.body;

      if (!id || !mm_name || !position || !remark) {
        return res.status(400).json({ msg: 'Required fields are missing' });
      }

      const isHalfDay = condition === 'false' || condition === true;

      // Set default to current date
      const today = new Date().toISOString().split('T')[0];

      const leaveStartDate = isHalfDay ? today : (start_date || today);
      const leaveEndDate = isHalfDay ? today : (end_date || today);
      const halfDayValue = isHalfDay ? half_day : half_day;

      if (isHalfDay && !half_day) {
        return res.status(400).json({ msg: 'Half day value is required for half-day leave' });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'Image is required' });
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'reason_photo' },
        async (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ message: 'Image upload failed' });
          }

          const new_leave = await leave_schema.create({
            id,
            mm_name,
            position,
            remark,
            start_date: leaveStartDate,
            end_date: leaveEndDate,
            half_day: halfDayValue,
            condition: isHalfDay,
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id
          });

          return res.status(200).json(new_leave);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return res.status(500).json({ msg: "Error", error: error.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid Id Format' });
      }

      const leave_update = await leave_schema.findByIdAndUpdate(id, req.body, { new: true });
      return res.json(leave_update);
    } catch (error) {
      return res.status(500).json({ msg: "Error", error: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid Id Format' });
      }

      const leave_delete = await leave_schema.findById(id);
      if (!leave_delete) {
        return res.status(404).json({ msg: 'Leave record not found' });
      }

      // 🧹 Delete image from Cloudinary
      if (leave_delete.imageUrl) {
        const publicId = extractPublicId(leave_delete.imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        }
      }

      await leave_delete.deleteOne();

      return res.json({ msg: 'Deleted successfully', data: leave_delete });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error: error.message });
    }
  }
};

async function cleanupExpiredPosts() {
  const cutoff = moment().subtract(24, 'hours').toDate();
  
  const expiredPosts = await leave_schema.find({createdAt: {$lt: cutoff}});

  for (let post of expiredPosts) {
    if (post.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(post.cloudinaryId);
        console.log(`Cloudinary image deleted: ${post.cloudinaryId}`);
      } catch (error) {
        console.error(`cloudinary deletion failed: ${error}`);
      }
    }

    await post.deleteOne();
    console.log(`Post deleted: ${post._id}`);
  }
}

module.exports = leaveController,cleanupExpiredPosts;
