const multer = require('multer')
const path = require('path')
const fs = require('fs')

const FILE_TYPES = ['.zip']
const MAX_SIZE_FILE = 30 * 1024 * 1024 // 30MB = 5 * 1024 * 1024 Bytes

// Check file type
function checkType(file, cb) {
    // Check ext
    const extFileName = path.extname(file.originalname).toLowerCase()

    if (FILE_TYPES.includes(extFileName))
        return cb(null, true)
    else
        return cb(new Error('INVALID_TYPE'))
}

// Define folder to storage the file
const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const model_id = req.params.model_id
        const rootFolder = process.env.STORAGE_URL || 'uploads'
        const modelFolder = `${rootFolder}/${req.user.id}/${model_id}`

        if (!fs.existsSync(modelFolder)) return cb(new Error('INVALID_DESTINATION'), null)

        cb(null, modelFolder)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).slice(1)
        cb(null, `input.${ext}`)
    }
})

// Upload file
async function uploadModel(req, res, next) {
    const multerUploader = multer({
        storage: modelStorage,
        limits: { fileSize: MAX_SIZE_FILE },
        fileFilter: function (req, file, cb) {
            checkType(file, cb)
        }
    })

    const upload = multerUploader.single('file')

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            if (err.code == 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'invalid_size' })
            return res.status(400).json({ error: 'upload_error' })
        } else if (err) {
            // An unknown error occurred when uploading
            if (err.toString().includes('INVALID_TYPE')) return res.status(400).json({ error: 'invalid_type' })
            if (err.toString().includes('INVALID_DESTINATION')) return res.status(400).json({ error: 'model_id does not exist' })
            return res.status(400).json({ error: 'upload_error' })
        }
        // Everything went fine and save document in DB here
        // req.file.path is now accessible
        next()
    })

}

module.exports = {
    uploadModel
}
