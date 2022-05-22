
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

  //function to upload the file
  async uploadUserAvatar(uiAvatarsSrc) {
    try {

      const regex = /^data:.+\/(.+);base64,(.*)$/;
      
      const matches = uiAvatarsSrc.match(regex);
      const type = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      const bufferStream = new stream.PassThrough(); 
      bufferStream.end(buffer);
      console.log(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS);
      const response = await this.drive.files.create({
        requestBody: {
          // name: 'hero.png',
          parents: [ process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS ]
        },
        media: {
          body: bufferStream,
        },
      });

      // report the response from the request
      console.log(response.data);

      return response;

    } catch (error) {
      //report the error message
      console.log('error', error.message);

      throw error;
    }
  }

}

export default new GoogleDrive();