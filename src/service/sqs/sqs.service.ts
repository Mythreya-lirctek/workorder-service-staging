import { SQS } from 'aws-sdk';

export class SQSService {
	private sqs: SQS;
	constructor() {
		this.sqs = new SQS({apiVersion: '2012-11-05'});
	}
	public getQueueUrl(message: SQS.GetQueueUrlRequest): Promise<SQS.GetQueueUrlResult> {
		return new Promise<SQS.GetQueueUrlResult>((resolve, reject) => {
			this.sqs.getQueueUrl(message, (err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});
	}
	public sendMessage(message: SQS.SendMessageRequest): Promise<SQS.SendMessageResult> {
		return new Promise<SQS.SendMessageResult>((resolve, reject) => {
			this.sqs.sendMessage(message, (err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});
	}

	public receiveMessage(message: SQS.ReceiveMessageRequest, callback?: (err: Error, data: SQS.ReceiveMessageResult) => void): void {
		this.sqs.receiveMessage(message, (err, data) => {
			if(callback && typeof callback === 'function') {
				callback(err, data);
			}
		});
	}
}