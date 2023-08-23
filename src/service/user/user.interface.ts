

export interface UserModel {
	id: number;
	firstName: string;
	lastName: string;
	password: string;
	username: string;
	token?: string;
	companyId?: number;
	addressId?: number;
	businessName?: string;
	roleId?: number;
	phone?: string;
}

export interface GetUserDetailsByRoleIdRequest {
	role: number;
	userName: string;
	firstName: string;
	pageSize: number;
	pageIndex: number;
	sortExpression: string;
	sortDirection: string;
}

export interface GetUserDetailsByRoleId {
	id: number;
	firstName: string;
	userName: string;
	lastName: string;
	phone: string;
	email: string;
	role: string;
	companyName: string;
	isDeleted: number;
}
export interface GetUserDetailsByUserId {
	addressId?: number;
	companyId: number;
	email: string;
	endTime: string;
	fax: string;
	firstName: string;
	id: number;
	isDeleted: number;
	lastName: string;
	password?: string;
	phone: string;
	profilePhoto?: string;
	provider: string;
	roleId: number;
	startTime: string;
	terminalId?: string;
	username: string;
	createdAt: string;
	createdUserId?: string;
	updatedUserId: string;
	userRestrictions?: string;
	companyName: string;
}
export interface ValidateUserName {
	id: number;
}
export interface UserRequestModel {
	id: number;
	roleId: number;
	timeZone: string;
	companyId: number;
}

export enum UserRole {
	Admin = 1,
	Owner = 2,
	Associate = 3,
	Driver = 4,
	Dispatcher = 5,
	Accountant = 6,
	Mechanic = 7,
	InsuranceAdmin = 8,
	InsuranceUser = 9,
	BrokerAdmin = 10,
	BrokerUser = 11,
	Manager = 12,
	Agent = 13,
	Owneroperator = 14,
	SafetyManager = 15,
	DispatcherLimit = 16,
	Carriers = 17,
}

export interface PassportRequest {
	Protocol: string;
	Password: string;
	Provider: string;
	Identifier: string;
	Tokens: string;
	User_Id: number;
	Id: number;
	CreatedAt: string;
	UpdatedAt: string;
	UpdatedUserId: string;
	CreatedUserId: string;
}

export interface UserRequest {
	[key:string]: any;
	Id: number;
	Username: string;
	Email: string;
	FirstName: string;
	LastName: string;
	ProfilePhoto: string;
	Provider: string;
	Password: string;
	Salt: string;
	ResetPasswordToken: string;
	ResetPasswordExpires: string;
	Company_Id: number;
	Address_Id: number;
	BusinessName: string;
	Role_Id: number;
	CreatedAt: string;
	UpdatedUserId: number;
	UpdatedAt: string;
	CreatedUserId: number;
	Phone: string;
	Fax: string;
	Terminal_Id: number;
	IsDeleted: boolean;
	StartTime: string;
	EndTime: string;
}
