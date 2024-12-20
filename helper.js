const path = require("path");
const uuid = require("uuid").v4;

module.exports = {
    success: function(res, message = "", body = {}) {
        return res.status(200).json({
            success: true,
            status: 200,
            message: message,
            body: body
        });
    },
    
    failure: function(res, message = "", body = {}) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: message,
            body: body
        });
    },
    
    error: function(res, message = "", body = {}) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: message,
            body: body
        });
    },
    checksession: async (req, res, next) => {
        if (req.session.users) {
            return next();
        } else {
            return res.redirect("login");
        }
    },
    fileUpload: async (file) => {
        if (!file) return null;

        const extension = path.extname(file.name);
        const filename = uuid() + extension;
        const filePath = path.join(process.cwd(), 'public', 'images', filename);

        try {
            await new Promise((resolve, reject) => {
                file.mv(filePath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            return `/images/${filename}`;
        } catch (error) {
            console.error('Error moving file:', error);
            throw new Error('Error uploading file');
        }
    },
    
  fileUploads: async (files) => {
    let filepaths = [];

    for (const file of files) {
      if (file && file.name) {
        const extension = path.extname(file.name);
        const filename = uuid() + extension;

        await file.mv(path.join(process.cwd(), "/public/imag", filename));

        filepaths.push(`/images/${filename}`); 
      }
    }
    return filepaths;
  },
    checkValidation: async (v) => {
        const matched = await v.check();
        if (!matched) {
            const errors = v.errors;
            return Object.values(errors).map(e => e.message)[0] || '';
        }
        return '';
    }
};
