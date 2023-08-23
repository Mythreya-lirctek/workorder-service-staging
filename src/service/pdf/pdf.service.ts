import jsreport from 'jsreport-client';
import ConfigService from '../config/config';
import { PassThrough } from 'stream';

class PdfService {
	private jsReportClient: any;
	constructor() {
		const configs = ConfigService.configs;
		if (!configs) {
			throw new Error('config server not loaded');
		}
		this.jsReportClient = jsreport(
			configs.jsreport.url,
			configs.jsreport.username,
			configs.jsreport.password
		);
	}

	public async generatePdf(htmlContent: string, options: any = {}): Promise<PassThrough> {
		return this.jsReportClient.render({
			template: {
				content: htmlContent,
				engine: 'none',
				recipe: 'chrome-pdf',
				...options
			}
		});
	}
}

export default PdfService;