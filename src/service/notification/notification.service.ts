import Database from '../database/database';
import { SQSService } from '../sqs/sqs.service';
import { SQS_QUEUES } from '../sqs/sqs.constants';


class NotificationService {
	private db: Database;
	private databaseget: Database;
	private sqsService: SQSService;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.sqsService = new SQSService();
	}

	public async sendPushNotification(req: any): Promise<any> {
		if(req.sendType === 'SMS') {
			const queueName = SQS_QUEUES.send_sms;
			const attributesR = {} as any;
					
			if(req.phone) {
				const message = req.message;
				const phoneNumbers = [`+1${req.phone}`];
				
				const body = {
					message,
					to:  phoneNumbers			
				}
				const attributes = {} as any;
				
				attributes.do_Id = {
					DataType: 'Number',
					StringValue: `${req.do_Id}`
				};
				
				if(req.relay_Id) {
					attributes.relay_Id = req.relay_Id;
				}
				
				if (queueName) {
					const queueUrl = await this.sqsService.getQueueUrl({
						QueueName: queueName
					});
					const resultt = await this.sqsService.sendMessage({
						MessageAttributes: attributesR,
						MessageBody: JSON.stringify(body),
						QueueUrl: queueUrl.QueueUrl
					});
					return resultt as any;
				} else {
					return null;
				}
			} else {
				return ('No phone number exists.');
			}		
		}
		if(req.sendType === 'Web'){
			const queueName = SQS_QUEUES.send_push;
			const bodyR: any = {
				deviceTokens: req.token,
				deviceType: 'Android',
				payload:{
					'data': {
						'body': (req.body ? req.body : ''),
						'message': (req.message ? req.message : ''),
						'modification_type': (req.modification_Type ? req.modification_Type : ''), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
						'notification_type': (req.notification_Type ? req.notification_Type : ''), // Type "1" for **loads** and type "2" for **Settlements**
						'title': (req.title ? req.title : '')
					}
				}
			}
			const queueUrl = await this.sqsService.getQueueUrl({
				QueueName: queueName
			});
			const resultt = await this.sqsService.sendMessage({
				MessageAttributes:  {} ,
				MessageBody: JSON.stringify(bodyR),
				QueueUrl: queueUrl.QueueUrl
			});
			return resultt as any;

		}
		else {
			req.sendType = 'Mobile';
			const queueName = SQS_QUEUES.send_push;
			const result =  [[req]];
			if(result[0].length > 0) {
				for (const item of result[0]) {
					let bodyR = {} as any;
					if(item.type === 'iOS') {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (req.driver_Id ? req.driver_Id : ''),	
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'load_id': (req.load_Id ? req.load_Id : ''),
									'message': (req.message ? req.message : ''),				
									'modification_type': (req.modification_Type ? req.modification_Type : ''), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
									'notification_type': (req.notification_Type ? req.notification_Type : ''), // Check the types in Block comment Above...				
									'relay_id': (req.relay_Id ? req.relay_Id : ''),								
									'settlement': (req.settlement ? req.settlement : ''),
									'status': (req.status ? req.status : '')
								},
								'notification':{
									'body': (req.body ? req.body : ''),
									'sound': 'default',
									'title': (req.title ? req.title : '')								
								}							
							}
						}
					} else {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (req.driver_Id ? req.driver_Id : ''),
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'body': (req.body ? req.body : ''),								
									'load_id': ` ${(req.load_Id ? req.load_Id : '')}`,
									'message': (req.message ? req.message : ''),
									'modification_type': (req.modification_Type ? req.modification_Type : ''), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete* 
									'notification_type': (req.notification_Type ? req.notification_Type : ''), // Type "1" for **loads** and type "2" for **Settlements**
									'relay_id': (req.relay_Id ? req.relay_Id : ''),								
									'settlement': (req.settlement ? req.settlement : ''),
									'status': (req.status ? req.status : ''),								
									'title': (req.title ? req.title : '')
								}
							}
						}
					}
													
					const attributesR = {} as any;
					
					if(req.do_Id > 0) {
						attributesR.do_Id = {
						DataType: 'Number',
						StringValue: `${req.do_Id}`
						};
					}
					
					if(req.relay_Id > 0) {
						attributesR.relay_Id = {
							DataType: 'Number',
							StringValue: `${req.relay_Id}`
						}; 
					}
						
					/**
					 * Notification Types:
					 * -> "-2" for Logout User from Previous Device.
					 * -> "-1" for InActive Drivers/ Carriers/ OwnerOps.
					 * -> "1" for Loads.
					 * -> "2" for Settlements.
					 * -> "3" for Chat Messges.
					 * -> "4" for ELD Settings Update.
					 * -> "5" for ELD UnIdentified Logs.
					 * -> "6" for Motor Carrier Edits.
					 * -> "7" for Device Settings Update.
					 * -> "8" for Mechanic DVIR Update.
					 * -> "9" for Sync ATS & HOS.
					 * -> "10" for Version Update.
					 * -> "11" for Firmware Update
					 * -> "12" For Send Logs
					 */
					
					// modification_Type "1" for *New* , "2" for *Updated*, "0" for *Delete* 
					if (queueName) {
						const queueUrl = await this.sqsService.getQueueUrl({
							QueueName: queueName
						});
						const resultt = await this.sqsService.sendMessage({
							MessageAttributes: attributesR,
							MessageBody: JSON.stringify(bodyR),
							QueueUrl: queueUrl.QueueUrl
						});
						return resultt as any;
					} else {
						return null;
					}
				}
			} else {
				return ('No device tokens exists.');	
			}
		}
	}   

	public async getDeviceTokensInfo(req: any): Promise<any> {
		return this.databaseget.query(`CALL getDeviceTokensInfo(
                    ${req.do_Id ? req.do_Id : null},
                    ${req.relay_Id ? req.relay_Id : null}, 
                    ${req.driver_Id ? req.driver_Id : null}, 
                    ${req.ownerOp_Id ? req.ownerOp_Id : null}, 
                    ${req.carrier_Id ? req.carrier_Id : null})`
		);
	}
	public async getUserTokensByUserId(userIds: any): Promise<any> {
		return this.databaseget.query(`
            select token,user_Id,type
            from devicetoken
            where User_Id in (${userIds.join(',')})  and Token != ''`
		);
	}
	public async getUserTokensBy(companyId: any): Promise<any> {
		return this.databaseget.query(`
            select token,user_Id,type
            from devicetoken d  left join user u on u.Id = d.User_Id
            where u.Company_Id=${companyId}  and Token != ''`
		);
	}

	public async getCarrierUserTokens(): Promise<any> {
		return this.databaseget.query(`
		  select d.token,d.user_Id,type,car.Id as carrier_Id
            from devicetoken d
                left join user u on u.Id = d.User_Id and u.Role_Id=17
                left join carriers car on car.User_Id = d.User_Id


            where u.Role_Id =17 and u.IsDeleted =0 and d.Token != ''
            `
		);
	}
}
export default NotificationService;