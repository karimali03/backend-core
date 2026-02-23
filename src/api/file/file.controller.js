const asyncFun = require('../../middlewares/async.handler');
const response = require('../../utils/ApiResponse');
const FileService = require('./file.service');

const fileService = new FileService();

class FileController {
  /**
   * Handles the file upload request after it has passed through all middleware.
   */
  uploadFile = asyncFun(async (req, res) => {
    // 1. A safety check to ensure a file was actually uploaded.
    //    The route-level middleware should catch most errors, but this is good practice.
    if (!req.file) {
      return response.fail(res, "No file was uploaded.", [], 400);
    }

    // 2. Call the service layer to handle the business logic.
    //    - req.file: The object containing file details from multer.
    //    - req.user.id: The user's ID, attached by the auth middleware.
    const newFile = await fileService.uploadFile(req.file, req.user.id);

    // 3. Send a successful response back to the client.
    //    - A 201 status code indicates that a new resource has been created.
    return response.success(res, "File uploaded successfully", newFile, 201);
  });

  /**
   * Handles request to get all files for the authenticated user.
   */
  getFiles = asyncFun(async (req, res) => {
    const files = await fileService.getFilesByUser(req.user.id);
    return response.success(res, "Files retrieved successfully", files);
  });

  /**
   * Handles request to get a single file by its ID.
   */
  getFile = asyncFun(async (req, res) => {
    const file = await fileService.getFileById(req.params.id, req.user.id);
    return response.success(res, "File retrieved successfully", file);
  });

  /**
   * Handles request to delete a file.
   */
  deleteFile = asyncFun(async (req, res) => {
    await fileService.deleteFile(req.params.id, req.user.id);
    // A 204 No Content response is standard for a successful deletion
    return response.success(res, "File deleted successfully", null, 204);
  });
}

module.exports = new FileController();