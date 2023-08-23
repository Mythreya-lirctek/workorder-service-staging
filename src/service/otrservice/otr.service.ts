import CompanyService from '../checkhq/company.service';
import * as ftp from 'basic-ftp';
import {deleteFiles} from '../../utils/file.util';
class OTRService {
	private companyService:CompanyService
	constructor() {
		this.companyService= new CompanyService();
	}

	public  async upload(filesList:any,comanyId:number,isBrokerage:boolean=false):Promise<any>{
		const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(comanyId,'Factor','Otr',isBrokerage)
		if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0){
			const ftpDetails = companyIntegrationDetails.data[0]
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
							await ftpClient.uploadFrom(file.filePath, `${ftpDetails.Directory}${file.fileName}`);
						}
					})
					.then(() => {
						return 	ftpClient.close()
					})
					.then(()=>{
						return resolve({message:'Files Uploaded Successfully'} as any)
					})
					.catch((error:Error)=>{
						reject({message:`Failed to Upload Files  to OTR Please contact admin ${error.message}`})
					}).finally(()=>{
						deleteFiles(filesList.map((file:any)=>file.filePath))
					})
			});
		}
		else {
			deleteFiles(filesList.map((file:any)=>file.filePath))
			throw {message:'Company not integrated with OTR'}
		}

	}
}

export default OTRService;