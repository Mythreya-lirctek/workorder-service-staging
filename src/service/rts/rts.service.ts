import CompanyService from '../checkhq/company.service';
import { deleteFiles } from '../../utils/file.util';
import * as ftp from 'basic-ftp';

class RtsService {

	public async upload(filesList: any, ftpDetails: any): Promise<any> {

		const configs = {
			host: ftpDetails.Host,
			password: ftpDetails.Password,
			port: '21',
			secure: false,
			user: ftpDetails.UserName,
		} as any
		const ftpClient = new ftp.Client(10000);
		return new Promise<void>((resolve,reject) => {
			ftpClient
				.access(configs)
				.then(async () => {
					for (const file of filesList) {
						await ftpClient.uploadFrom(file.filePath, `/${file.fileName}`);
					}
				})
				.then(() => {
					return 	ftpClient.close()
				})
				.then(()=>{
					return resolve({message:'Files Uploaded Successfully'} as any)
				})
				.catch((error:Error)=>{
					reject({message:`Failed to Upload Files  to RTS Please contact admin ${error.message}`})
				}).finally(()=>{
				deleteFiles(filesList.map((file:any)=>file.filePath))
			})
		});
	}
}

export default RtsService;