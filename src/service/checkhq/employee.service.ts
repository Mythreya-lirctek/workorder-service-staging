import Database from '../database/database';
import axios, { AxiosInstance } from 'axios';

class EmployeeService {
	private db: Database;
	private databaseget: Database;
	private client: AxiosInstance;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async createEmployee(req: any): Promise<any> {
		try {
			const result = await this.client.post('/integrations/api/checkhq/createEmployee', req);
			if(req.module === 'driver') {
				this.db.query(`update driver set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			} else if(req.module === 'employee') {
				this.db.query(`update employee set CheckHQId=${this.db.connection.escape(result.data.data.id)} where Id=${req.module_Id}`);
			}
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async listEmployees(employeeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listEmployees/${employeeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async getEmployee(employeeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getemployee/${employeeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	
	public async updateEmployee(employeeId: any, req: any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateEmployee/${employeeId}`, req);
			return result;
		} catch (e) {
			return e;
		}
	}

	public async employeeOnboard(employeeId: any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/employees/${employeeId}/onboard`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listEmployeePayStub(employeeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listEmployeePayStub/${employeeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getPayStub(employeeId: any,payrollId: any, type: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getPayStub/${employeeId}/${payrollId}/${type}`, {
				responseType : type === 'pdf' ? 'arraybuffer' : 'json'
			});
			return result;
		} catch (e) {
			return e;
		}
	}
	public async listEmployeeForm(employeeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/listEmployeeForm/${employeeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getEmployeeForm(employeeId: any,formId:any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getEmployeeForm/${employeeId}/${formId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async submitEmployeeForm(employeeId: any,formId:any,req:any): Promise<any> {
		try {
			const result = await this.client.post(`/integrations/api/checkhq/submitEmployeeForm/${employeeId}/${formId}`,req);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async getCompanyDefinedAttributes(employeeId: any): Promise<any> {
		try {
			const result = await this.client.get(`/integrations/api/checkhq/getCompanyDefinedAttributes/${employeeId}`);
			return result;
		} catch (e) {
			return e;
		}
	}
	public async updateCompanyDefinedAttributes(employeeId: any,req:any): Promise<any> {
		try {
			const result = await this.client.put(`/integrations/api/checkhq/updateCompanyDefinedAttributes/${employeeId}`,req);
			return result;
		} catch (e) {
			return e;
		}
	}
}
export default EmployeeService;