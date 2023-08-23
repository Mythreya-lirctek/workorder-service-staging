export interface SuccessResponse {
	status: number;
	data: any;
}

export interface ErrorMessage {
	message: string;
	details: string;
}

export interface ErrorResponse {
	status: number;
	error: ErrorMessage;
}

export class BaseController {
	public getSuccessResponse(data: any): SuccessResponse {
		const result = Array.isArray(data) ? data : { ...data };
		return result;
	}

	public getErrorResponse(err: Error, statusCode: number = 500): ErrorResponse {
		return {
			error: {
				details: err.stack,
				message: err.message
			},
			status: statusCode
		};
	}
}
