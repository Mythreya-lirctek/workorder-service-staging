import fs from 'fs';
import ConfigService from '../config/config';
import Mandrill from 'machinepack-mandrill';

export default class EmailService {

	public async emailservice(message : any): Promise<any> {
		const attachments = [] as any;
		if(message.documents && message.documents.length > 0) {
			for (const item of message.documents) {
				const bitmap = fs.readFileSync(item.filePath);
				attachments.push({
					content: Buffer.from(bitmap).toString('base64'),
					name: (item.fileName.endsWith('.pdf')||item.fileName.endsWith('.PDF')) ? item.fileName:`${item.fileName}.pdf`,
					type: 'application/pdf'
				});
			}
		}
		if (message.buffers) {
			attachments.push({
				content: Buffer.from(message.buffers).toString('base64'),
				name: (message.fileName.endsWith('.pdf')||message.fileName.endsWith('.PDF')) ? message.fileName:`${message.fileName}.pdf`,
				type: 'application/pdf'
			});
		}
		const templateVariables = [
			{
				content: message.body ? message.body : '',
				name: 'Body'
			}
		];
		if (message.emails) {
			let resultt = {} as any;
			if (message.emails.length > 0) {
				for(const email of message.emails){
					resultt = await sendEmail(email, message.fromEmail,'invoice', templateVariables, attachments, message.subject);                    
				}
				return resultt;
			}							
			else {
				const resulttt = await sendEmail(message.emails, message.fromEmail,'invoice', templateVariables, attachments, message.subject);
				return resulttt;
			}
		}
	};
	public async sendGPSTrackerForTrucksByCustomer(message:any): Promise<any>{
		const attachments = []
		attachments.push({
			content: new Buffer(message.csv).toString('base64'),
			name: `${message.document}.csv`,
			type: 'text/csv'
		});
		const templateVariables = [
			{
				content: message.body ? message.body : '',
				name: 'Body'
			}
		];
		if(message.fromEmail) {
			if (message.emails) {
				const emails = message.emails.split(';');
				let result = {} as any;
				if (emails.length > 0) {
					for(const email of emails){
						result = await sendEmail(email, message.fromEmail,'invoice', templateVariables, attachments, message.subject);
					}
				} else {
					result = await sendEmail(message.emails, message.fromEmail,'invoice', templateVariables, attachments, message.subject);
				}
				return result;
			}

		}
	}
}

const sendEmail = (to:any, from:any, templateName:any, variables:any, attachments:any, subject:any):any => {
	Mandrill.sendTemplateEmail({
	apiKey: ConfigService.configs.mandrill.apikey,
	attachments,
	fromEmail: from,
	mergeVars: variables,
	subject,
	templateName,
	toEmail: to,
	}).exec({
		error(err: any):boolean {
			return err;		
		},
		success():boolean {	
			return true;	
		}
	});

};