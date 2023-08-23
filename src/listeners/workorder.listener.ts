import { BaseListener } from './base.listener';
import { SQSService } from '../service/sqs/sqs.service';
import { SQS_QUEUES } from '../service/sqs/sqs.constants';

export class WorkorderListener extends BaseListener {
	private sqsService: SQSService;
	constructor() {
		super();
		this.sqsService = new SQSService();
	}

	public async start(): Promise<void> {
		const queueUrl = await this.sqsService.getQueueUrl({
			QueueName: SQS_QUEUES.CREATE_WORKORDER
		});

		this.sqsService.receiveMessage({
			AttributeNames: [
				'SentTimestamp'
			],
			MaxNumberOfMessages: 1,
			MessageAttributeNames: [
				'All'
			],
			QueueUrl: queueUrl.QueueUrl,
			WaitTimeSeconds: 20,
		});
	}
}