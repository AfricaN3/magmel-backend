import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./uploads/");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // max file size 10MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error("only upload files with pdf format."));
    }
    cb(undefined, true); // continue with upload
  },
});

export default upload;
