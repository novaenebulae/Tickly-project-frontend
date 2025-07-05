/**
 * @file Defines the response model for file upload operations.
 * @licence Proprietary
 */

/**
 * Represents the response from a file upload operation.
 * This is returned by the API after successfully uploading a file.
 */
export interface FileUploadResponseDto {
  /**
   * The name of the uploaded file as stored on the server.
   */
  fileName: string;

  /**
   * The URL where the uploaded file can be accessed.
   */
  fileUrl: string;

  /**
   * A message from the server about the upload operation.
   * Usually indicates success or provides additional information.
   */
  message: string;
}
