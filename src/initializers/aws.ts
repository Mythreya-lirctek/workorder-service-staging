import { BaseInitializer } from './base_initializer';
import { SQS, config } from 'aws-sdk';
import ConfigService from '../service/config/config';
import debugModule from 'debug';
import { SQS_QUEUES } from '../service/sqs/sqs.constants';
import { WorkorderListener } from '../listeners/workorder.listener';
const debug = debugModule('api::aws:initializer')

export class AwsInitializer extends BaseInitializer {
	private secrectKey: string;
	private accessKey: string;
	public initialize(): void {
		this.secrectKey = ConfigService.configs.aws.secretKey;
		this.accessKey = ConfigService.configs.aws.AWSAccessKeyId;
		config.update({
			accessKeyId: this.accessKey,
			region: 'us-west-2',
			secretAccessKey: this.secrectKey
		});
		debug('ensuring SQS queues are create accurately.');
		const sqs = new SQS({apiVersion: '2012-11-05'});
		const queueParam: SQS.CreateQueueRequest = {
			Attributes: {
				'ReceiveMessageWaitTimeSeconds': '20',
			},
			QueueName: SQS_QUEUES.CREATE_WORKORDER,
		}
		sqs.createQueue(queueParam, (err) => {
			debug('creating workorder queue');
			if (err) {
				debug(`Failed to create workorder queue: ${err}` );
			}
		});

		debug('starting workorder listener');
		const workorderListener = new WorkorderListener();
		workorderListener.start();
	}
}