import express from 'express';
import { BaseController } from './base_controller';
import CheckHQEmployeeService from '../service/checkhq/employee.service';
import ActivityLogService from '../service/activitylog/activitylog.service';

class CheckHQEmployeeController extends BaseController {
	private checkHQEmployeeService: CheckHQEmployeeService;
	private activityLogService: ActivityLogService;
	constructor() {
		super();
		this.checkHQEmployeeService = new CheckHQEmployeeService();
		this.activityLogService = new ActivityLogService();
	}

	public async createEmployee(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const result = await this.checkHQEmployeeService.createEmployee(req.body);
			if(result.data) {			
				this.activityLogService.addActivityLog({
					description: JSON.stringify({'checkHQId': result.data ? result.data.data.id : null}),
					module: req.body.module,
					module_Id: req.body.module_Id,
					userId: req.body.userId,
				});
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async getEmployee(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {employeeId}  = req.params;
			
			const result = await this.checkHQEmployeeService.getEmployee(employeeId); 
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async updateEmployee(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {employeeId}  = req.params;
			
			const result = await this.checkHQEmployeeService.updateEmployee(employeeId, req.body); 
			if(result.data) {
				res.send(this.getSuccessResponse(result.data ? result.data.data: {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async listEmployees(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {companyId}  = req.params;
			
			const result = await this.checkHQEmployeeService.listEmployees(companyId);   
			if(result.data) {         
				res.send(this.getSuccessResponse(result.data ? result.data.data.results : []));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async employeeOnboard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {employeeId}  = req.params;
			
			const result = await this.checkHQEmployeeService.employeeOnboard(employeeId); 
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listEmployeePayStub(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId } = req.params;
			const result = await this.checkHQEmployeeService.listEmployeePayStub(employeeId);
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getPayStub(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { payrollId, employeeId, type } = req.params;

			const result = await this.checkHQEmployeeService.getPayStub(
				employeeId,
				payrollId,
				type
			);
			if (result.data) { 
				res.set({ 'Content-type' : `application/${type}` })
				res.send(result.data ? type === 'pdf' ? Buffer.from(result.data) : result.data : {});
			} else {
				if (type === 'pdf') {
					res.status(500).send(this.getErrorResponse(JSON.parse(Buffer.from(result.response.data).toString('binary')).error));
				} else {
					res.status(500).send(this.getErrorResponse(result.response.data.error));
				}
			}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async listEmployeeForm(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId } = req.params;

			const result = await this.checkHQEmployeeService.listEmployeeForm(
				employeeId
			);
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getEmployeeForm(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId, formId } = req.params;

			const result = await this.checkHQEmployeeService.getEmployeeForm(
				employeeId,
				formId
			);
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async submitEmployeeForm(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId, formId } = req.params;

			const result = await this.checkHQEmployeeService.submitEmployeeForm(
				employeeId,
				formId,
				req.body
			);
			if(result.data) {           
				res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
			} else {
				res.status(500).send(this.getErrorResponse(result.response.data.error));
			}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getCompanyDefinedAttributes(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId } = req.params;

			const result =
				await this.checkHQEmployeeService.getCompanyDefinedAttributes(
					employeeId
				);
				if(result.data) {           
					res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
				} else {
					res.status(500).send(this.getErrorResponse(result.response.data.error));
				}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async updateCompanyDefinedAttributes(
		req: express.Request,
		res: express.Response
	): Promise<void> {
		try {
			const { employeeId } = req.params;

			const result =
				await this.checkHQEmployeeService.updateCompanyDefinedAttributes(
					employeeId,
					req.body
				);
				if(result.data) {           
					res.send(this.getSuccessResponse(result.data ? result.data.data : {}));
				} else {
					res.status(500).send(this.getErrorResponse(result.response.data.error));
				}
		} catch (error) {
		res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default CheckHQEmployeeController;