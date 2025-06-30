import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { IResult } from "../api/v1/model/common/common.interface";


interface IFileStatus {
  fileName: string,
  status: boolean
}

interface IFileResult {
  message: string,
  status: number,
  files?: IFileStatus[]
}

const defaultFolder = "storage";
const storageFolder = path.join(__dirname, "..", defaultFolder);
export const createFolderAsync = async (
  folderName: string
): Promise<boolean> => {
  try {
    const status = await checkFolderAsync(folderName);
    if (status) {
      return Promise.resolve(true);
    } else {
      fs.mkdir(`${storageFolder}/${folderName}`);
      return Promise.resolve(true);
    }
  } catch (e) {
    return Promise.resolve(false);
  }
};

export const checkFolderAsync = async (
  folderName: string
): Promise<boolean> => {
  try {
    const targetPath = path.join(storageFolder, folderName);
    await fs.access(targetPath);
    return Promise.resolve(true);
  } catch (e) {
    return Promise.resolve(false);
  }
};

export const writeFileToFolderAsync = async (
  folderName: string,
  file: string[],
  fileSize: number = 1 * 1024 * 1024
): Promise<IFileResult> => {

  if (file.length <= 0) {
    return {
      message: "No files founded",
      status: 400
    }
  }

  const folderStatus = await checkFolderAsync(folderName);
  if (!folderStatus) {
    const createFolderStat = await createFolderAsync(folderName);
    if (!createFolderStat) {
      return {
        message: "Something went wrong while creating folder",
        status: 500
      };
    }
  }

  const files: IFileStatus[] = []

  await Promise.all(
    file.map(async (e: string, index: number) => {
      const generateUUID = uuidv4();
      const base64Data = e.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const originalFileSizeKB = (buffer.length / 1024).toFixed(2);

      if (buffer.length > fileSize) {
        files.push({
          fileName: `File at index ${index} (${originalFileSizeKB}KB) exceeded the limit (${(fileSize / 1024 / 1024).toFixed(2)}MB)`,
          status: false
        });
        return;
      }

      const fileExtension = e.startsWith("data:image/png") ? ".png" : ".jpeg";

      const finalFolderName = `${storageFolder}/${folderName}`;
      const filePath = `${finalFolderName}/${generateUUID}${fileExtension}`;

      const dbFilePath = `/${defaultFolder}/${folderName}/${generateUUID}${fileExtension}`

      try {
        await fs.writeFile(
          filePath,
          buffer
        );

        files.push({
          fileName: dbFilePath,
          status: true
        });
      } catch (e) {
        files.push({
          fileName: `Error writing file at index ${index}`,
          status: false
        });
      }

    })
  );

  return {
    message: "Success",
    status: 200,
    files: files
  };
};
