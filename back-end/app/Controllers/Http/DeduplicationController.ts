import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import {spawn} from 'child_process';
import * as console from "console";

export default class DeduplicationController {
  async importDeduplication({ request }: HttpContextContract) {
    try {
      const base64Data = request.body().base64;
      const isValidCSV = await this.validateCSV(base64Data);

      if (isValidCSV) {
        const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
        const timestamp = request.body().timestamp;

        let dir = `./public/deduplication/inputs/${timestamp}`;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }

        dir = `./public/deduplication/outputs/${timestamp}`;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }

        const fileName = `./public/deduplication/inputs/${timestamp}/${new Date().getTime()}_${request.body().fileName}.csv`;
        await fs.writeFile(fileName, buffer, (err) => {
          if (err) console.log('FILE SAVING FAILED', err);
        });
        return { message: 'File saved' };
      }
      return { message: 'File not valid' };

    } catch (error) {
      return { message: 'File error' };
    }
  }

  async validateCSV(buffer: string) {
    const originalHeader = [
      'ID',
      'NAME',
      'SOURCE_DB',
      'SOURCE_ID',
      'REGISTRATION_NUMBER_BEFORE',
      'REGISTRATION_NUMBER_CURRENT',
      'ORIGIN_COUNTRY',
      'CURRENT_COUNTRY',
      'TITLE_BEFORE',
      'TITLE_AFTER',
      'BREED',
      'COLOR_CODE',
      'COLOR',
      'BIRTH_DATE',
      'GENDER',
      'CHIP',
      'NOTE(DESCRIPTION)',
      'AWARDS',
      'HEALTH_STATUS',
      'CATTERY',
      'MOTHER_ID',
      'FATHER_ID',
      'MOTHER_NAME',
      'FATHER_NAME',
      'MOTHER_CATTERY',
      'FATHER_CATTERY',
      'MOTHER_REG_NUMBER',
      'FATHER_REG_NUMBER',
    ];
    const dataSplit = buffer.split(',')[1];
    const csvFile = xlsx.read(dataSplit, { type: 'base64' });
    const sheet = csvFile.Sheets[csvFile.SheetNames[0]];
    const csvHeader = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
    return this.compareHeaders(csvHeader, originalHeader);
  }

  compareHeaders(csvHeader: string[], originalHeader: string[]) {
    for (let i = 0; i < originalHeader.length; i++) {
      if (!originalHeader.includes(csvHeader[i])) {
        return false;
      }
    }
    return true;
  }

  async runDeduplication({ request }: HttpContextContract) {
    const folderName = request.body().folderName as string;
    const databasesString = request.body().databasesString as string;
    const pythonScriptPath = './public/deduplication/deduplication_infocat.py';
    const pythonProcess = spawn('python3', [pythonScriptPath, folderName, databasesString]);
    console.log('Python command:', `python ${pythonScriptPath} ${folderName} ${databasesString}`);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python script: ${data}`);
    });

    const results = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        resolve(this.getResults(folderName));
      });
    });

    return { message: 'Script finished', results };
  }

  getResults(folderName: string) {
    const top10SimilaritiesPath = `./public/deduplication/outputs/${folderName}/top_10_similarities.csv`;
    const allDuplicatesPath = `./public/deduplication/outputs/${folderName}/all_duplicated_cats.csv`;
    const finalCatPath = `./public/deduplication/outputs/${folderName}/final_cat.csv`;
    const finalDBPath = `./public/deduplication/outputs/${folderName}/FINAL_DB.csv`;
    let result = {};

    if (fs.existsSync(top10SimilaritiesPath)){
      const csvFile = xlsx.read(top10SimilaritiesPath, { type: 'file', raw: true });
      const sheet = csvFile.Sheets[csvFile.SheetNames[0]];
      result['top10'] = xlsx.utils.sheet_to_json(sheet);
    }
    else {
      return {
        error: 'Problem with file top_10_similarities.csv',
        top10: [], allDuplicates: [], finalCat: [], finalDB: []
      };
    }

    if (fs.existsSync(allDuplicatesPath)){
      const csvFile = xlsx.read(allDuplicatesPath, { type: 'file', raw: true });
      const sheet = csvFile.Sheets[csvFile.SheetNames[0]];
      result['allDuplicates'] = xlsx.utils.sheet_to_json(sheet);
    }
    else {
      return {
        error: 'Problem with file all_duplicated_cats.csv',
        top10: [], allDuplicates: [], finalCat: [], finalDB: []
      };
    }

    if (fs.existsSync(finalCatPath)){
      const csvFile = xlsx.read(finalCatPath, { type: 'file', raw: true });
      const sheet = csvFile.Sheets[csvFile.SheetNames[0]];
      result['finalCat'] = xlsx.utils.sheet_to_json(sheet);
    }
    else {
      return {
        error: 'Problem with file final_cat.csv',
        top10: [], allDuplicates: [], finalCat: [], finalDB: []
      };
    }

    if (fs.existsSync(finalDBPath)){
      result['finalDB'] = fs.readFileSync(finalDBPath, {encoding: 'base64'});
    }
    else {
      return {
        error: 'Problem with file FINAL_DB.csv',
        top10: [], allDuplicates: [], finalCat: [], finalDB: []
      };
    }

    fs.rmSync(`./public/deduplication/outputs/${folderName}`, { recursive: true, force: true });

    return result;
  }
}
