import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/images"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/'/g, "")
        .replace(/\s+/g, "")
        .replace(/[©-]/g, "")
    );
  },
});

const upload = multer({
  storage: storage,
});

export default upload;
