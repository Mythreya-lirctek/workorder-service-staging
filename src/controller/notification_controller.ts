import { BaseController } from './base_controller';
import express from 'express';
import SendNotificationService from '../service/sendnotification/sendnotification.service';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';

export default class DispatchOrderController extends BaseController {    
	private sendNotificationService: SendNotificationService;
	private dispatchOrderService: DispatchOrderService
	constructor() {
		super();
		this.sendNotificationService = new SendNotificationService();
		this.dispatchOrderService = new DispatchOrderService();
	}

	public async sendPushNotification(req: express.Request, res: express.Response): Promise<any> {
		req.body.sendType = 'Mobile';
		let result = {data: []} as any;
		try {
			if (!req.body.token) {
				result = await this.dispatchOrderService.getDeviceTokensInfo(req.body);
			}
			
			if (result && !result.data[0]) { 
				result.data.push([]);
				result.data[0].push(req.body);
			}
		
			if(result.data[0].length > 0) {
				if(req.body.carrier_Id) {
					req.body.driver_Id = req.body.carrier_Id;
				}
				for (const item of result.data[0]) {
					let bodyR = {} as any;
					if(item.type === 'iOS') {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (req.body.driver_Id ? req.body.driver_Id : ''),	
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'load_id': (req.body.load_Id ? req.body.load_Id : ''),
									'message': (req.body.message ? req.body.message : ''),				
									'modification_type': (req.body.modification_Type ? req.body.modification_Type : 0), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
									'notification_type': (req.body.notification_Type ? req.body.notification_Type : 0), // Check the types in Block comment Above...				
									'relay_id': (req.body.relay_Id ? req.body.relay_Id : 0),								
									'settlement': (req.body.settlement ? req.body.settlement : ''),
									'status': (req.body.status ? req.body.status : '')
								},
								'notification':{
									'body': (req.body.body ? req.body.body : ''),
									'sound': 'default',
									'title': (req.body.title ? req.body.title : '')								
								}							
							}
						}
					} else {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload:{
								'data': {
									'Driver_Id': (req.body.driver_Id ? req.body.driver_Id : ''),
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'body': (req.body.body ? req.body.body : ''),								
									'load_id': ` ${(req.body.load_Id ? req.body.load_Id : '')}`,
									'message': (req.body.message ? req.body.message : ''),
									'modification_type': (req.body.modification_Type ? req.body.modification_Type : 0), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete* 
									'notification_type': (req.body.notification_Type ? req.body.notification_Type : 0), // Type "1" for **loads** and type "2" for **Settlements**
									'relay_id': (req.body.relay_Id ? req.body.relay_Id : ''),								
									'settlement': (req.body.settlement ? req.body.settlement : ''),
									'status': (req.body.status ? req.body.status : ''),								
									'title': (req.body.title ? req.body.title : '')
								}
							}
						}
					}
													
					const attributesR = {} as any;
					
					if(req.body.do_Id > 0) {
						attributesR.do_Id = {
						DataType: 'Number',
						StringValue: `${req.body.do_Id}`
						};
					}
					
					if(req.body.relay_Id > 0) {
						attributesR.relay_Id = {
							DataType: 'Number',
							StringValue: `${req.body.relay_Id}`
						}; 
					}
					const response = await this.sendNotificationService.sendNotification({					
						attributes: attributesR, 
						body: JSON.stringify(bodyR),
						sendType: req.body.sendType});
					res.send(this.getSuccessResponse({ result: 'Sent Successfully' }));	
				}
			} else {
				res.send(this.getSuccessResponse({ result: 'No device tokens exists.' }));	
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}   
	public async sendPushNotifications(req: express.Request, res: express.Response): Promise<any> {

		try {
		const notificationResponse = []
		for(const [index,notification] of req.body.notifications.entries()){
			notification.sendType = 'Mobile';
			let result = {data: []} as any;
			if (!notification.token) {
				result = await this.dispatchOrderService.getDeviceTokensInfo(notification);
			}

			if (result && !result.data[0]) {
				result.data.push([]);
				result.data[0].push(notification);
			}

			if (result.data[0].length > 0) {
				if (notification.carrier_Id) {
					notification.driver_Id = notification.carrier_Id;
				}
				for (const item of result.data[0]) {
					let bodyR = {} as any;
					if (item.type === 'iOS') {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload: {
								'data': {
									'Driver_Id': (notification.driver_Id ? notification.driver_Id : ''),
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'load_id': (notification.load_Id ? notification.load_Id : ''),
									'message': (notification.message ? notification.message : ''),
									'modification_type': (notification.modification_Type ? notification.modification_Type : 0), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
									'notification_type': (notification.notification_Type ? notification.notification_Type : 0), // Check the types in Block comment Above...
									'relay_id': (notification.relay_Id ? notification.relay_Id : 0),
									'settlement': (notification.settlement ? notification.settlement : ''),
									'status': (notification.status ? notification.status : '')
								},
								'notification': {
									'body': (notification.body ? notification.body : ''),
									'sound': 'default',
									'title': (notification.title ? notification.title : '')
								}
							}
						}
					} else {
						bodyR = {
							deviceTokens: item.token,
							deviceType: item.type,
							payload: {
								'data': {
									'Driver_Id': (notification.driver_Id ? notification.driver_Id : ''),
									'Role_Id': (item.role_Id ? item.role_Id : ''),
									'body': (notification.body ? notification.body : ''),
									'load_id': ` ${(notification.load_Id ?notification.load_Id : '')}`,
									'message': (notification.message ?notification.message : ''),
									'modification_type': (notification.modification_Type ? notification.modification_Type : 0), // Type "1" for *New* , "2" for *Updated*, "0" for *Delete*
									'notification_type': (notification.notification_Type ? notification.notification_Type : 0), // Type "1" for **loads** and type "2" for **Settlements**
									'relay_id': (notification.relay_Id ? notification.relay_Id : ''),
									'settlement': (notification.settlement ? notification.settlement : ''),
									'status': (notification.status ? notification.status : ''),
									'title': (notification.title ? notification.title : '')
								}
							}
						}
					}

					const attributesR = {} as any;

					if (notification.do_Id > 0) {
						attributesR.do_Id = {
							DataType: 'Number',
							StringValue: `${notification.do_Id}`
						};
					}

					if (notification.relay_Id > 0) {
						attributesR.relay_Id = {
							DataType: 'Number',
							StringValue: `${notification.relay_Id}`
						};
					}
					const response = await this.sendNotificationService.sendNotification({
						attributes: attributesR,
						body: JSON.stringify(bodyR),
						sendType: notification.sendType
					});
					notificationResponse.push({result: 'Sent Successfully',index})
				}
			} else {
				notificationResponse.push({result: 'No device tokens exists',index})
			}
		}
			res.send(this.getSuccessResponse({status: notificationResponse}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}