import archiver from 'archiver'
import express from 'express';
import fs from 'fs';
import {deleteFiles} from '../../utils/file.util';
export default function zipFileStream(files:any[],res: express.Response,zipFileName:string) :any{
		const archive = archiver('zip');
		archive.on('error', (err) =>{
			res.status(500).send({error: err.message});
		});
		archive.on('end', ()=> {
			// on Stream Ended
		});
		res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
		res.attachment(zipFileName);
		archive.pipe(res);
		files.forEach((file:any)=>{
			archive.append(file.stream, { name:file.fileName});
		});
		archive.finalize();
	}

export async  function createZipFile(files:any[],filePath:string) :Promise<any>{
	const archive = archiver('zip');
	const output = fs.createWriteStream(filePath);
	return new Promise<void>((resolve:any,reject:any) => {
		archive.on('error', reject);
		archive.on('end', ()=> {
			deleteFiles(files.map((file:any)=>file.filePath))
			resolve()
		});
		archive.pipe(output);
		files.forEach((file:any)=>{
			archive.append(fs.readFileSync(file.filePath), { name:file.fileName});
		});
		archive.finalize();
	});
}

