import { google } from 'googleapis';
import OAUTH2Client from '../googleConnect';
import fs from 'fs';
import stream from 'stream';

class GoogleDrive {

  drive;

  constructor() {
    this.drive = google.drive({
      version: 'v3',
      auth: OAUTH2Client.auth
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

  //function to upload the user file
  async uploadUserAvatar(mongoUserID, uiAvatarsSrc) {

    await OAUTH2Client.checkAuth();

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
  }

  //function to delete the user avatar
  async deleteUserAvatar(mongoUserID) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS}' in parents and name contains '${mongoUserID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }
  }

  //function to upload the guard post file
  async uploadGuardPostPhoto(mongoGuardPostID, photo) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDPOSTS}' in parents and name contains '${mongoGuardPostID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }

    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = photo.match(regex);
    const type = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await this.drive.files.create({
      requestBody: {
        name: `${mongoGuardPostID}.${type}`,
        parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDPOSTS]
      },
      media: {
        body: bufferStream,
      },
    });

    return response.data.id;
  }

  //function to delete the guard post avatar
  async deleteGuardPostAvatar(mongoGuardPostID) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDPOSTS}' in parents and name contains '${mongoGuardPostID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }
  }

  //function to upload the protected objects file
  async uploadProtectedObjectPhoto(mongoProtectedObjectID, photo) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_PROTECTEDOBJECTS}' in parents and name contains '${mongoProtectedObjectID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }

    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = photo.match(regex);
    const type = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await this.drive.files.create({
      requestBody: {
        name: `${mongoProtectedObjectID}.${type}`,
        parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_PROTECTEDOBJECTS]
      },
      media: {
        body: bufferStream,
      },
    });

    return response.data.id;
  }

  //function to delete the protected objects file
  async deleteProtectedObjectAvatar(mongoProtectedObjectID) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDPOSTS}' in parents and name contains '${mongoProtectedObjectID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }
  }

  //function to upload the guard file
  async uploadGuardAvatar(mongoGuardID, uiAvatarsSrc) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDS}' in parents and name contains '${mongoGuardID}'`);

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
        name: `${mongoGuardID}.${type}`,
        parents: [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDS]
      },
      media: {
        body: bufferStream,
      },
    });

    return response.data.id;
  }

  //function to delete the guard post avatar
  async deleteGuardAvatar(mongoGuardID) {

    await OAUTH2Client.checkAuth();

    const existsFile = await this.findFile(`'${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDS}' in parents and name contains '${mongoGuardID}'`);

    if (existsFile) {
      this.deleteFile(existsFile);
    }
  }

  //function to upload the excel timesheet file
  async uploadExcelTimesheet(document, name, parents) {

    await OAUTH2Client.checkAuth();
    
    // const buffer = Buffer.from(data, 'base64');
    const bufferStream = new stream.PassThrough();
    
    await document.write(bufferStream);

    bufferStream.end();

    const response = await this.drive.files.create({
      requestBody: {
        name: name,
        parents: [parents]
      },
      media: {
        body: bufferStream,
      },
    });

    return response.data.id;
  }

}

export default new GoogleDrive();