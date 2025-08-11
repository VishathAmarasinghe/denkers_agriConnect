export const getMimeType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase(); // Get the file extension
  
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
    };
  
    return mimeTypes[extension || ""] || "application/octet-stream"; // Default to binary file type
  };
  