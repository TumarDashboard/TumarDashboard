
import { google } from 'googleapis';
import OAUTH2Client from '../googleConnect';
import fs from 'fs';
import stream from 'stream';

class GoogleDrive {

  drive;

  constructor() {
    this.drive = google.drive({
      version: 'v3',
      auth: OAUTH2Client
    });
  }

  // function to find file
  async findFile(query) {
    return await this.drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name)'
    }).then(responce => {
      if (responce.data.files.length > 0)
        return responce.data.files[0].id
      else
        return null;
    })
  }

  async deleteFile(fileID) {
    await this.drive.files.delete({
      fileId: fileID,
    });
  }

  //function to upload the file
  async uploadUserAvatar(mongoUserID, uiAvatarsSrc) {
    try {

      const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS}' in parents and name contains '${mongoUserID}'`);

      if (existsFile) {
        this.deleteFile(existsFile);
      }

      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = uiAvatarsSrc.match(regex);
      const type = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      const response = await this.drive.files.create({
        requestBody: {
          name: `${mongoUserID}.${type}`,
          parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS]
        },
        media: {
          body: bufferStream,
        },
      });

      return response.data.id;

    } catch (error) {
      //report the error message
      console.log('error', error.message);

      throw error;
    }
  }

}

export default new GoogleDrive();