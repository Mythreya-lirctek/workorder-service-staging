import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'checkhqcompany#createCompany',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompany/createCompany`
},{
	controller: 'checkhqcompany#getCompany',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompany/getCompany/:companyId`
},{
	controller: 'checkhqcompany#updateCompany',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompany/updateCompany/:companyId`
},{
	controller: 'checkhqcompany#companyOnboard',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompany/:companyId/onboard`
},{
	controller: 'checkhqworkplace#createWorkplace',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqworkplace/createWorkplace`
},{
	controller: 'checkhqworkplace#listWorkplaces',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqworkplace/listWorkplaces/:companyId`
},{
	controller: 'checkhqworkplace#getWorkPlace',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqworkplace/getWorkPlace/:workPlaceId`
},{
	controller: 'checkhqworkplace#updateWorkPlace',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqworkplace/updateWorkPlace/:workPlaceId`
},{
	controller: 'checkhqemployee#createEmployee',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/createEmployee`
},{
	controller: 'checkhqemployee#getEmployee',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/getEmployee/:employeeId`
},{
	controller: 'checkhqemployee#updateEmployee',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/updateEmployee/:employeeId`
},{
	controller: 'checkhqemployee#listEmployees',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/listEmployees/:companyId`
},{
	controller: 'checkhqemployee#employeeOnboard',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/:employeeId/onboard`
},{
	controller: 'checkhqbankaccount#createBankAccount',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbankaccount/createBankAccount`
},{
	controller: 'checkhqbankaccount#getBankAccount',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbankaccount/getBankAccount/:bankAccountId`
},{
	controller: 'checkhqbankaccount#updateBankAccount',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbankaccount/updateBankAccount/:bankAccountId`
},{
		controller: 'checkhqbankaccount#listBankAccounts',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/checkhqbankaccount/listBankAccounts`
},{
	controller: 'checkhqcontractor#createContractor',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/createContractor`
},{
	controller: 'checkhqcontractor#getContractor',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/getContractor/:contractorId`
},{
	controller: 'checkhqcontractor#updateContractor',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/updateContractor/:contractorId`
},{
	controller: 'checkhqcontractor#listContractors',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/listContractors/:companyId`
},{
	controller: 'checkhqcontractor#contractorOnboard',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/:companyId/onboard`
},{
	controller: 'checkhqcompanybenefit#createCompanyBenefit',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompanyBenefit/createCompanyBenefit`
},{
	controller: 'checkhqcompanybenefit#getCompanyBenefit',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompanybenefit/getCompanyBenefit/:companyBenefitId`
},{
	controller: 'checkhqcompanybenefit#updateCompanyBenefit',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompanyBenefit/updateCompanyBenefit/:companyBenefitId`
},{
	controller: 'checkhqcompanybenefit#listCompanyBenefits',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompanyBenefit/listCompanyBenefits/:companyId`
},{
	controller: 'checkhqearningrate#createEarningRate',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningRate/createEarningRate`
},{
	controller: 'checkhqearningrate#getEarningRate',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningrate/getEarningRate/:earningRateId`
},{
	controller: 'checkhqearningrate#updateEarningRate',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningRate/updateEarningRate/:earningRateId`
},{
	controller: 'checkhqearningrate#listEarningRates',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningRate/listEarningRates/:companyId`
},{
	controller: 'checkhqpayschedule#createPayschedule',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqpayschedule/createPayschedule`
},{
	controller: 'checkhqpayschedule#listPayschedules',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqpayschedule/listPayschedules/:companyId`
},{
	controller: 'checkhqpayschedule#getPaySchedule',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqpayschedule/getPaySchedule/:payscheduleId`
},{
	controller: 'checkhqpayschedule#updatePaySchedule',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqpayschedule/updatePaySchedule/:payscheduleId`
},{
	controller: 'checkhqpayschedule#getPayDays',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqpayschedule/getPayDays`
},{
	controller: 'checkhqearningcode#createEarningCode',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningcode/createEarningCode`
},{
	controller: 'checkhqearningcode#listEarningCodes',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningcode/listEarningCodes/:companyId`
},{
	controller: 'checkhqearningcode#getEarningCode',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningcode/getEarningCode/:earningCodeId`
},{
	controller: 'checkhqearningcode#updateEarningCode',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqearningcode/updateEarningCode/:earningCodeId`
},{
	controller: 'checkhqbenefit#createBenefit',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbenefit/createBenefit`,
},{
	controller: 'checkhqbenefit#getBenefit',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbenefit/getBenefit/:benefitId`,
},{
	controller: 'checkhqbenefit#listBenefit',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbenefit/listBenefit/:Id`,
},{
	controller: 'checkhqbenefit#updateBenefit',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbenefit/updateBenefit/:benefitId`,
},{
	controller: 'checkhqbenefit#deleteBenefit',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqbenefit/deleteBenefit/:benefitId`,
},{
	controller: 'checkhqposttaxdeduction#createPostTaxDeduction',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')		],
	path: `${apiPrefix}/checkhqposttaxdeduction/createPostTaxDeduction`,
},{
	controller: 'checkhqposttaxdeduction#getPostTaxDeduction',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqposttaxdeduction/getPostTaxDeduction/:postTaxDeductionId`,
},{
	controller: 'checkhqposttaxdeduction#updatePostTaxDeduction',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqposttaxdeduction/updatePostTaxDeduction/:postTaxDeductionId`,
},{
	controller: 'checkhqposttaxdeduction#listPostTaxDeduction',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqposttaxdeduction/listPostTaxDeduction/:id`,
},{
	controller: 'checkhqposttaxdeduction#deletePostTaxDeduction',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqposttaxdeduction/deletePostTaxDeduction/:postTaxDeductionId`,
},{
	controller: 'checkhqpayroll#createPayroll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/createPayroll`
},{
	controller: 'checkhqpayroll#previewPayroll',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/previewPayroll/:payrollId/:type`
},{
	controller: 'checkhqpayroll#reopenPendingPayroll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/reopenPendingPayroll/:payrollId`
},{
	controller: 'checkhqpayroll#approvePayroll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/approvePayroll/:payrollId`
},{
	controller: 'checkhqpayroll#getPayroll',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/getPayroll/:payrollId`
},{
	controller: 'checkhqpayroll#updatePayroll',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/updatePayroll/:payrollId`
},{
	controller: 'checkhqpayroll#listPayroll',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/listPayroll/:companyId`
},{
	controller: 'checkhqpayroll#deletePayroll',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/deletePayroll/:payrollId`
},{
	controller: 'checkhqpayroll#getPaperChecks',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayroll/getPaperChecks/:payrollId`
},{
	controller: 'checkhqpayrollitem#getPayrollItem',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayrollitem/getPayrollItem/:payrollItemId`
},{
	controller: 'checkhqpayrollitem#getPayrollItems',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayrollitem/getPayrollItems/:payrollId`
},{
	controller: 'checkhqpayrollitem#updatePayrollItem',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayrollitem/updatePayrollItem/:payrollItemId`
},{
	controller: 'checkhqpayrollitem#deletePayrollItem',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayrollitem/deletePayrollItem/:payrollItemId`
},{
	controller: 'checkhqpayrollitem#getPaperCheck',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqpayrollitem/getPaperCheck/:payrollItemId`
},{
	controller: 'checkhqcompany#listCompany',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcompany/listCompany`
},{
	controller: 'checkhqcontractor#listContractorPayment',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/listContractorPayment/:contractorId`
},{
	controller: 'checkhqcontractor#getContractorPayment',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractor/getContractorPayment/:contractorId/:payrollId/:type`
},{ 
	controller: 'checkhqemployee#listEmployeePayStub',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/listEmployeePayStub/:employeeId`,
},{
	controller: 'checkhqemployee#getPayStub',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/getPayStub/:employeeId/:payrollId/:type`,
},{
	controller: 'checkhqemployee#listEmployeeForm',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/listEmployeeForm/:employeeId`,
},{
	controller: 'checkhqemployee#getEmployeeForm',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/getEmployeeForm/:employeeId/:formId`,
},{
	controller: 'checkhqemployee#submitEmployeeForm',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/submitEmployeeForm/:employeeId/:formId`,
},{	controller: 'checkhqemployee#getCompanyDefinedAttributes',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/getCompanyDefinedAttributes/:employeeId`,
},{
	controller: 'checkhqemployee#updateCompanyDefinedAttributes',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqemployee/updateCompanyDefinedAttributes/:employeeId`,
},{
	controller: 'checkhqform#getForm',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqform/getForm/:formId`
},{
	controller: 'checkhqform#listForm',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqform/listForm`
},{
	controller: 'checkhqform#renderForm',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqform/renderForm/:formId`
},{
	controller: 'checkhqcompanybenefit#deleteCompanyBenefit',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqcompanybenefit/deleteCompanyBenefit/:companyBenefitId`
},{
	controller: 'checkhqdocument#listCompanyTaxDocument',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/listCompanyTaxDocument`
},{
	controller: 'checkhqdocument#downloadCompanyTaxDocument',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/downloadCompanyTaxDocument/:documentId`
},{
	controller: 'checkhqdocument#listCompanyAuthorizationDocument',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/listCompanyAuthorizationDocument`
},{
	controller: 'checkhqdocument#downloadCompanyAuthorizationDocument',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/downloadCompanyAuthorizationDocument/:documentId`
},{
	controller: 'checkhqdocument#listEmployeeTaxDocument',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/listEmployeeTaxDocument`
},{
	controller: 'checkhqdocument#downloadEmployeeTaxDocument',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/downloadEmployeeTaxDocument/:documentId`
},{
	controller: 'checkhqdocument#listContractorTaxDocument',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/listContractorTaxDocument`
},{
	controller: 'checkhqdocument#downloadContractorTaxDocument',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqdocument/downloadContractorTaxDocument/:documentId`
},{
	controller: 'checkhqbankaccount#deleteBankAccount',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path:`${apiPrefix}/checkhqbankaccount/deleteBankAccount/:bankAccountId`
},{
	controller: 'checkhqcontractorpayment#getContractorPayment',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractorpayment/getContractorPayment/:contractorPaymentId`,
},{
	controller: 'checkhqcontractorpayment#updateContractorPayment',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractorpayment/updateContractorPayment/:contractorPaymentId`,
},{
	controller: 'checkhqcontractorpayment#deleteContractorPayment',
	method: RouteMethod.DELETE,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractorpayment/deleteContractorPayment/:contractorPaymentId`,
},{
	controller: 'checkhqcontractorpayment#getContractorPaymentPaperCheck',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqcontractorpayment/getContractorPaymentPaperCheck/:contractorPaymentId`,
},{
	controller: 'payschedule#addPaySchedule',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/payschedule/addPaySchedule`,
},{
	controller: 'payschedule#savePaySchedule',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/payschedule/savePaySchedule`,
},{
	controller: 'payschedule#getPaySchedulebyId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/payschedule/getPaySchedulebyId/:payScheduleId`,
},{
	controller: 'payschedule#getPayScheduleDetails',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/payschedule/getPayScheduleDetails`,
},{
	controller: 'checkhqreports#getPayrollJournal',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqereports/:companyId/getPayrollJournal`,
},{
	controller: 'checkhqreports#getPayrollSummary',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqereports/:companyId/getPayrollSummary`,
},{
	controller: 'checkhqreports#getContractorPaymentsReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqereports/:companyId/getContractorPaymentsReport`,
},{
	controller: 'checkhqreports#getW2PreviewReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqereports/:companyId/getW2PreviewReport`,
},{
	controller: 'checkhqreports#getW4ExemptStatusReport',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/checkhqereports/:companyId/getW4ExemptStatusReport`,
},
	{
		controller: 'checkhqreports#getPaydays',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/checkhqereports/:companyId/paydays`,
	}
]

export default routes;