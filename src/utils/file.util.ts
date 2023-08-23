import {Readable, Stream} from 'stream';
import fs from 'fs';

export function bufferToStream(buffer:any):Stream {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

export function stringToStream(text:string):Stream {
	const stream = new Readable();
	stream.push(text);
	stream.push(null);
	return stream;
}


 export async function createTheFile(stream:any,filePath:string):Promise<any> {
	const file = fs.createWriteStream(filePath);
	stream.pipe(file);
	return new Promise<void>(resolve => {
		file.on('finish', resolve);
	});
}

export async function deleteFiles(files: any): Promise<any> {
	files.forEach((file: any) => {
		fs.unlinkSync(file);
	})
}
export  function handleDuplicateDocuments(documents: any): any {
	// to group files by fileName
	const obj = documents.reduce((a:any, e:any)=> {
		const key = e.fileName;
		(a[key] ? a[key] : (a[key] = [])).push(e);
		return a;
	}, {});
	const docs = [] as any
	for (const key of Object.keys(obj)) {
		if(key !== 'undefined'){
			obj[key].forEach((value:any, index: number) => {
				if(index !== 0){
					value.fileName = `${key}-${index+1}`
				}
				docs.push(value)
			})
		}
	}
	return docs;
}