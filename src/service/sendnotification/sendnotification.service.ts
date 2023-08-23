import { SQSService } from '../sqs/sqs.service';
import { SQS_QUEUES } from '../sqs/sqs.constants';

export default class SendNotificationService {
	private sqsService: SQSService;
	constructor() {
		this.sqsService = new SQSService();
	}

	public async sendNotification(req: any): Promise<any> {
		let queueName = '';
		if (req.sendType === 'SMS') {
			queueName = SQS_QUEUES.send_sms;
		} else if (req.sendType === 'Email') {
			queueName = SQS_QUEUES.send_email;
		} else if (req.sendType === 'Mobile') {
			queueName = SQS_QUEUES.send_push;
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
			const result = await this.sqsService.sendMessage({
				MessageAttributes: req.attributes,
				MessageBody: `${req.body}`,
				QueueUrl: queueUrl.QueueUrl
			});
			return result as any;
		} else {
			return null;
		}
	}
}