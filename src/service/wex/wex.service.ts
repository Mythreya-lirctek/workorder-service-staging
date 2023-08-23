import Client from 'ssh2-sftp-client';
import debugModule from 'debug';
import CompanyService from '../checkhq/company.service';
import {deleteFiles} from '../../utils/file.util';


const debug = debugModule('api:service:wex');
class WexService {
	private sftp: any;
	private companyService:CompanyService
	constructor() {
		this.sftp = new Client();
		this.companyService= new CompanyService();
	}
	public async upload(filesList:any,comanyId:number,isBrokerage:boolean=false):Promise<any>{
		const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(comanyId,'Factor','WEX',isBrokerage)
		if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0){
			const sftpDetails = companyIntegrationDetails.data[0]
			const configs = {
				algorithms: {
					serverHostKey: [
						'ssh-rsa',
						'ecdsa-sha2-nistp256',
						'ecdsa-sha2-nistp384',
						'ecdsa-sha2-nistp521',
						'ssh-dss'
					]
				},
				debug: (info: string) => {
					debug(info);
				},
				host: sftpDetails.Host,
				password: sftpDetails.Password,
				port: '22',
				readyTimeout: 10000,
				retries: 3,
				username: sftpDetails.UserName,
			}

			return new Promise<void>((resolve,reject) => {
				this.sftp
					.connect(configs)
					.then(() => {
						return Promise.all(filesList.map((file: any) => {
							return this.sftp.put(file.filePath, `${sftpDetails.Directory}${file.fileName}`);
						}))
					})
					.then(() => {
						return this.sftp.end()
					})
					.then(() => {
						return resolve({message: 'Files Uploaded Successfully'} as any)
					})
					.catch((error: Error) => {
						reject({message: `Failed to Upload Files  to WEX Please contact admin ${error.message}`})
					}).finally(() => {
					deleteFiles(filesList.map((file: any) => file.filePath))
				})
			});
		}
		else {
			deleteFiles(filesList.map((file:any)=>file.filePath))
			throw  {message:'Company not integrated with Wex'}
		}
	}
}

export default WexService;