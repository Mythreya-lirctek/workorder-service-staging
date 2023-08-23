import express from 'express';
import {BaseController} from './base_controller';
import {SamsaraService} from '../service/samsara/samsara.service';
import CompanyService from '../service/checkhq/company.service';
import {MotiveService} from '../service/motive/motive.service';
import {EldService} from '../service/eld/eld.service';
import moment from 'moment';
import tz from 'moment-timezone';
import ConfigService from '../service/config/config';
import url from 'url';
import {TruckXService} from '../service/truckx/truckx.service';
import { HeremapsService } from '../service/heremaps/heremaps.service';

class EldSyncController extends BaseController {

	private samsaraService: SamsaraService
	private companyService:CompanyService
	private motiveService: MotiveService
	private eldService : EldService
	private truckXService: TruckXService
	private hereMapsApiKey: string
	private heremapsService: HeremapsService

	constructor() {
		super();
		this.hereMapsApiKey = ConfigService.configs.heremaps.apiKey
		this.truckXService = new TruckXService()
		this.samsaraService = new SamsaraService()
		this.companyService = new CompanyService()
		this.motiveService = new MotiveService()
		this.eldService = new EldService()
		this.heremapsService = new HeremapsService()
	}

	public async isValidSamsaraToken(req: express.Request, res: express.Response): Promise<any>{
		try {
			const result = await this.samsaraService.isValidSamsaraToken(req.body)
			if (result.data.data.data) {
				res.send({message: 'Token Valid'});
			}else {
				res.status(500).send({message : 'Invalid Token'});
			}
		}catch (error) {
			res.status(500).send({message : 'Invalid Token'});
		}
	}

	public async isValidMotiveToken(req: express.Request, res: express.Response): Promise<any>{
		try {
			const result = await this.motiveService.isValidMotiveToken(req.body)
			if (result.data.data.users) {
				res.send({message: 'Token Valid'});
			}else {
				res.status(500).send({message : 'Invalid Token'});
			}
		}catch (error) {
			res.status(500).send({message : 'Invalid Token'});
		}
	}

	public async syncUsers(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0) {

				const driversList = await this.samsaraService.getDriversList(user.companyId);

				if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara') {

					const resp = await this.samsaraService.getUsersSamasara(companyIntegrationDetails.data[0].ApiKey);
					const syncedDrivers = []
					const unSyncedDrivers = []

					if (resp.data.data) {
						for (const dbDriversList of driversList.data) {
							const driver = await resp.data.data.filter((samsaraDriver: any) => {
								if (samsaraDriver.user.licenseNumber) {
									return !!(samsaraDriver.user.licenseNumber !== '' && dbDriversList.DrivingLicense !== null && dbDriversList.DrivingLicense !== ''
										&& dbDriversList.DrivingLicense === (samsaraDriver.user.licenseNumber));
								} else {
									return false
								}
							});
							if (driver.length > 0) {
								const samsaraDriverId = driver[0].user.id;
								await this.samsaraService.updateSamsaraId(samsaraDriverId, dbDriversList.Id);
								syncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName, samsaraDriverId});
							} else {
								unSyncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName});
							}
						}
					}
					res.send({syncedDrivers, unSyncedDrivers})

				} else if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive') {

					const resp = await this.motiveService.getUsers(companyIntegrationDetails.data[0].ApiKey);
					const syncedDrivers = []
					const unSyncedDrivers = []

					if (resp.data.data) {
						for (const dbDriversList of driversList.data) {
							const driver = await resp.data.data.filter((motiveDriver: any) => {
								return !!(motiveDriver.user.drivers_license_number !== null && motiveDriver.user.drivers_license_number !== ''
									&& dbDriversList.DrivingLicense !== null && dbDriversList.DrivingLicense !== ''
									&& dbDriversList.DrivingLicense === (motiveDriver.user.drivers_license_number));
							});
							if (driver.length > 0) {
								const motiveDriverId = driver[0].user.id;
								await this.motiveService.updateMotiveId(motiveDriverId, dbDriversList.Id);
								syncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName, motiveDriverId});
							} else {
								unSyncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName});
							}
						}
					}
					res.send({syncedDrivers, unSyncedDrivers});

				} else if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'truckx') {

					const result = await this.truckXService.getDriversList(companyIntegrationDetails.data[0].ApiKey)
					const syncedDrivers = []
					const unSyncedDrivers = []

					if (result.data && result.data.driver_list){
						for (const dbDriversList of driversList.data) {
							const driverName = `${dbDriversList.FirstName} ${dbDriversList.LastName}`
							const driver = await result.data.driver_list.filter((truckXDriver: any) => {
								return !!(truckXDriver.driver_name !== null && truckXDriver.driver_name !== ''
									&& driverName !== null && driverName !== ''
									&& driverName === (truckXDriver.driver_name));
							});
							if (driver.length > 0) {
								const truckXDriverId = driver[0].driver_id;
								await this.truckXService.updateTruckXDriverId(truckXDriverId, dbDriversList.Id);
								syncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName, truckXDriverId});
							} else {
								unSyncedDrivers.push({driverId : dbDriversList.Id, firstName : dbDriversList.FirstName,
									lastName : dbDriversList.LastName});
							}
						}
					}
					res.send({syncedDrivers, unSyncedDrivers});

				} else {
					res.status(500).send({message: 'Samsara/Motive/TruckX token not found for the company'});
				}
			}else {
				res.status(500).send({message: 'Samsara/Motive/TruckX token not found for the company'});
			}
		}catch (error) {
			if(error.response && error.response.data && error.response.status){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async syncVehicles(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0){

				const vehiclesList = await this.samsaraService.getVehiclesList(user.companyId);

				if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara'){

					const resp = await this.samsaraService.getVehicle(req.body, companyIntegrationDetails.data[0].ApiKey);
					const syncedVehicles = []
					const unSyncedVehicles = []

					if (resp.data.data) {
						for (const dbVehicleList of vehiclesList.data){
							const vehicle = await resp.data.data.filter((samsaraVehicle: any) => {
								return !!(samsaraVehicle.vehicle.vin !== null && samsaraVehicle.vehicle.vin !== ''
									&& dbVehicleList.VIN !== null && dbVehicleList.VIN !== ''
									&& dbVehicleList.VIN === (samsaraVehicle.vehicle.vin));
							});
							if (vehicle.length > 0){
								const samsaraVehicleId = vehicle[0].vehicle.id;
								await this.samsaraService.updateSamsaraVehicleId(samsaraVehicleId, dbVehicleList.Id);
								syncedVehicles.push({vehicleId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber, samsaraVehicleId});
							}else {
								unSyncedVehicles.push({vehicleId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber});
							}
						}
					}
					res.send({syncedVehicles, unSyncedVehicles});

				} else if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive'){

						const resp = await this.motiveService.getVehicle(req.body, companyIntegrationDetails.data[0].ApiKey);
						const syncedVehicles = []
						const unSyncedVehicles = []

						if (resp.data.data) {
							for (const dbVehicleList of vehiclesList.data){
								const vehicle = await resp.data.data.filter((motiveVehicle: any) => {
									return !!(motiveVehicle.vehicle.vin !== null && motiveVehicle.vehicle.vin !== ''
										&& dbVehicleList.VIN !== null && dbVehicleList.VIN !== ''
										&& dbVehicleList.VIN === (motiveVehicle.vehicle.vin));
								});
								if (vehicle.length > 0){
									const motiveVehicleId = vehicle[0].vehicle.id;
									await this.motiveService.updateMotiveVehicleId(motiveVehicleId, dbVehicleList.Id);
									syncedVehicles.push({vehicleId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber, motiveVehicleId});
								}else {
									unSyncedVehicles.push({vehicleId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber});
								}
							}
						}
						res.send({syncedVehicles, unSyncedVehicles});

				} else if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'truckx') {

					const result = await this.truckXService.getTrucksList(companyIntegrationDetails.data[0].ApiKey)
					const syncedVehicles = []
					const unSyncedVehicles = []

					if (result.data && result.data.truck_list){
						for (const dbVehicleList of vehiclesList.data) {
							const driver = await result.data.truck_list.filter((truckXVehicle: any) => {
								return !!(truckXVehicle.truck_name !== null && truckXVehicle.truck_name !== ''
									&& dbVehicleList.TruckNumber !== null && dbVehicleList.TruckNumber !== ''
									&& dbVehicleList.TruckNumber === (truckXVehicle.truck_name));
							});
							if (driver.length > 0) {
								const truckXVehicleId = driver[0].truck_id;
								await this.truckXService.updateTruckXVehicleId(truckXVehicleId, dbVehicleList.Id);
								syncedVehicles.push({driverId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber, truckXVehicleId});
							} else {
								unSyncedVehicles.push({driverId : dbVehicleList.Id, truckNumber: dbVehicleList.TruckNumber});
							}
						}
					}
					res.send({syncedVehicles, unSyncedVehicles});

				} else {
					res.status(500).send({message:'Samsara/Motive/TruckX token not found for the company'});
				}
			} else {
				res.status(500).send({message:'Samsara/Motive/TruckX token not found for the company'});
			}
		}catch(error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async syncAssets(req: express.Request, res: express.Response): Promise<any>{
		try{
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0) {

				const assetsList = await this.samsaraService.getAssetsList(user.companyId);

				if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara') {

					const resp = await this.samsaraService.getAssets(req.body, companyIntegrationDetails.data[0].ApiKey);
					const syncedAssets = []
					const unSyncedAssets = []

					if (resp.data.data) {
						for (const dbAssetsList of assetsList.data) {
							const asset = await resp.data.data.filter((assetVehicle: any) => {
								return !!(assetVehicle.asset.name !== null && assetVehicle.asset.name !== ''
									&& dbAssetsList.TrailerNumber !== null && dbAssetsList.TrailerNumber !== ''
									&& dbAssetsList.TrailerNumber === assetVehicle.asset.name);
							});
							if (asset.length > 0) {
								const samsaraAssetId = asset[0].asset.id;
								await this.samsaraService.updateSamsaraAssetId(samsaraAssetId, dbAssetsList.Id);
								syncedAssets.push({assetId : dbAssetsList.Id, trailerNumber: dbAssetsList.TrailerNumber, samsaraAssetId});
							}else {
								unSyncedAssets.push({assetId : dbAssetsList.Id, trailerNumber: dbAssetsList.TrailerNumber});
							}
						}
					}
					res.send({syncedAssets, unSyncedAssets});

				} else if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive') {

					const resp = await this.motiveService.getAssets(req.body, companyIntegrationDetails.data[0].ApiKey)
					const syncedAssets = []
					const unSyncedAssets = []

					if (resp.data.data) {
						for (const dbAssetsList of assetsList.data) {
							const asset = await resp.data.data.filter((assetVehicle: any) => {
								return !!(assetVehicle.asset.name !== null && assetVehicle.asset.name !== ''
									&& dbAssetsList.TrailerNumber !== null && dbAssetsList.TrailerNumber !== ''
									&& dbAssetsList.TrailerNumber === (assetVehicle.asset.name));
							});
							if (asset.length > 0) {
								const motiveAssetId = asset[0].asset.id;
								await this.motiveService.updateMotiveAssetId(motiveAssetId, dbAssetsList.Id);
								syncedAssets.push({assetId : dbAssetsList.Id, trailerNumber: dbAssetsList.TrailerNumber, motiveAssetId});
							}else {
								unSyncedAssets.push({assetId : dbAssetsList.Id, trailerNumber: dbAssetsList.TrailerNumber});
							}
						}
					}
					res.send({syncedAssets, unSyncedAssets});

				} else {
					res.status(500).send({message:'Samsara/Motive token not found for the company'});
				}
			} else {
				res.status(500).send({message:'Samsara/Motive token not found for the company'});
			}
		}catch(error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	// tslint:disable-next-line:cyclomatic-complexity
	public async getAvailableTime(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { driver_id } = req.params
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0) {

				if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara') {

					const samsaraDriverId = await this.samsaraService.getSamsaraDriverId(driver_id);
					if (samsaraDriverId
						&& samsaraDriverId.data
						&& samsaraDriverId.data[0]
						&& samsaraDriverId.data[0].SamsaraId != null) {

						const availableHOSRequest = { driverIds: samsaraDriverId.data[0].SamsaraId };
						const availableHOSData = await this.samsaraService.getAvailableTime(availableHOSRequest, companyIntegrationDetails.data[0].ApiKey);

						if (availableHOSData.data.data.length > 0
							&& availableHOSData.data.data[0].clocks) {

							const hosAvailable = availableHOSData.data.data[0].clocks;
							res.send({
								'break': hosAvailable && hosAvailable.break && hosAvailable.break.timeUntilBreakDurationMs &&
									(hosAvailable.break.timeUntilBreakDurationMs / 1000) || 0,
								'cycleRemaining': hosAvailable && hosAvailable.cycle && hosAvailable.cycle.cycleRemainingDurationMs &&
									(hosAvailable.cycle.cycleRemainingDurationMs / 1000) || 0,
								'cycleTomorrow': hosAvailable && hosAvailable.cycle && hosAvailable.cycle.cycleTomorrowDurationMs &&
									(hosAvailable.cycle.cycleTomorrowDurationMs / 1000) || 0,
								'drive': hosAvailable && hosAvailable.drive && hosAvailable.drive.driveRemainingDurationMs &&
									(hosAvailable.drive.driveRemainingDurationMs / 1000) || 0,
								'shift': hosAvailable && hosAvailable.shift && hosAvailable.shift.shiftRemainingDurationMs &&
									(hosAvailable.shift.shiftRemainingDurationMs / 1000) || 0,
							});
						} else {
							res.status(500).send({message: 'HOS Clock not found for the Driver'});
						}
					} else {
						res.status(500).send({message: 'Samsara Driver Id not found for the Driver'});
					}

				} else if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive') {

					const motiveDriverId = await this.motiveService.getMotiveDriverId(driver_id);
					if (motiveDriverId
						&& motiveDriverId.data
						&& motiveDriverId.data[0]
						&& motiveDriverId.data[0].MotiveId != null) {

						const availableTimeRequest = { driver_ids: motiveDriverId.data[0].MotiveId };
						const availableTimeData = await this.motiveService.getAvailableTime(availableTimeRequest, companyIntegrationDetails.data[0].ApiKey);

						if (availableTimeData.data.data.length > 0
							&& availableTimeData.data.data[0].user) {

							const availableTime = availableTimeData.data.data[0].user;
							res.send({
								'break': availableTime && availableTime.available_time && availableTime.available_time.break || 0,
								'cycleRemaining': availableTime && availableTime.available_time && availableTime.available_time.cycle || 0,
								'cycleTomorrow': 0,
								'drive': availableTime && availableTime.available_time && availableTime.available_time.drive || 0,
								'shift': availableTime && availableTime.available_time && availableTime.available_time.shift || 0,
							});

						} else {
							res.status(500).send({message: 'HOS Clock not found for the Driver'});
						}
					} else {
						res.status(500).send({message: 'Motive Driver Id not found for the Driver'});
					}

				}  else if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'truckx') {

					const truckXDriverId = await this.truckXService.getTruckXDriverId(driver_id);
					const userIds = [] as any
					if (truckXDriverId
						&& truckXDriverId.data
						&& truckXDriverId.data[0]
						&& truckXDriverId.data[0].ELDDriverId
						&& truckXDriverId.data[0].ELDDriverId != null) {

						userIds.push(truckXDriverId.data[0].ELDDriverId)
						const result = await this.truckXService.getHosStatus({ userIds }, companyIntegrationDetails.data[0].ApiKey)
						if (result.data && result.data[userIds[0]]){
							const availableTime = result.data[userIds[0]];
							res.send({
								data : {
									'currentCycleDay': availableTime.current_cycle_day || null,
									'cycleTimeCompleted': availableTime.cycle_time_completed || null,
									'cycleTimeLeft': availableTime.cycle_time_left || null,
									'driveTimeLeft': availableTime.drive_time_left || null,
									'maxCycleDays': availableTime.max_cycle_days || null,
									'shiftTimeCompleted': availableTime.shift_time_completed || null,
									'shiftTimeLeft': availableTime.shift_time_left || null,
									'timeDriven': availableTime.time_driven || null,
									'type' : 'TRUCKX'
								}
							});
						}  else {
							res.status(500).send({message: 'HOS Clock not found for the Driver'});
						}
					} else {
						res.status(500).send({message: 'TruckX DriverId not found for the Driver'});
					}

				} else {
					const availableHOSRequest = await this.eldService.getHOSbyDriverId(driver_id);
					if (availableHOSRequest.data.length > 0) {
						const availableTime = availableHOSRequest.data[0];
						res.send({
							'break': availableTime && availableTime[0] && availableTime[0].breakTime || 0,
							'cycleRemaining': availableTime && availableTime[0] && availableTime[0].logCycleTime || 0,
							'cycleTomorrow': availableTime && availableTime[0] && availableTime[0].tomorrowAvailableTime || 0,
							'drive': availableTime && availableTime[0] && availableTime[0].driveTime || 0,
							'shift': availableTime && availableTime[0] && availableTime[0].shiftTime || 0,
						});
					} else {
						res.status(500).send({message: 'HOS Clock not found for the Driver'});
					}
				}
			} else {
				res.status(500).send({message: 'Samsara/Motive/TruckX token not found for the company'});
			}

		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getHoursOfService(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { driver_id, start_date, end_date, per_page, page_no, after } = req.body
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0) {

				if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara') {

					const availableHOSRequest = { driverIds: driver_id, startDate: start_date, endDate: end_date, after };
					const availableHOSData = await this.samsaraService.getHoursOfService(availableHOSRequest, companyIntegrationDetails.data[0].ApiKey);

					if (availableHOSData.data) {
						res.send(availableHOSData.data);
					} else {
						res.status(500).send({message: 'Available time not found for the Driver'});
					}

				} else if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive') {

					const availableHOSRequest = { driver_ids: driver_id, start_date, end_date, per_page, page_no };
					const availableHOSData = await this.motiveService.getHoursOfService(availableHOSRequest, companyIntegrationDetails.data[0].ApiKey);

					if (availableHOSData.data.data) {
						res.send(availableHOSData.data.data);
					} else {
						res.status(500).send({message: 'Hours Of Service not found for the Driver'});
					}

				} else {
					res.status(500).send({message: 'Samsara/Motive token not found for the company'});
				}
			} else {
				res.status(500).send({message: 'Samsara/Motive token not found for the company'});
			}

		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	// tslint:disable-next-line:cyclomatic-complexity
	public async getVehicleLocation(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { vehicle_id } = req.params;
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0) {

				if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'samsara') {

					const samsaraVehicleId = await this.samsaraService.getSamsaraVehicleId(vehicle_id);
					if (samsaraVehicleId
						&& samsaraVehicleId.data
						&& samsaraVehicleId.data[0]
						&& samsaraVehicleId.data[0].SamsaraVehicleId != null) {

						const vehicleLocationRequest = { vehicleIds: samsaraVehicleId.data[0].SamsaraVehicleId }
						const vehicleLocationData = await this.samsaraService.getVehicleLocation(vehicleLocationRequest,
							companyIntegrationDetails.data[0].ApiKey);

						if (vehicleLocationData.data.data.length > 0) {
							const vehicleLocation = vehicleLocationData.data.data[0];
							res.send({
								'heading': vehicleLocation && vehicleLocation.location && vehicleLocation.location.heading || 0.0,
								'latitude': vehicleLocation && vehicleLocation.location && vehicleLocation.location.latitude || 0.0,
								'location': vehicleLocation && vehicleLocation.location && vehicleLocation.location.reverseGeo &&
									vehicleLocation.location.reverseGeo.formattedLocation || null,
								'longitude': vehicleLocation && vehicleLocation.location && vehicleLocation.location.longitude || 0.0,
								'speed': vehicleLocation && vehicleLocation.location && vehicleLocation.location.speed || 0
							});

						} else {
							res.status(500).send({message: 'Vehicle Location not found for the Truck'})
						}
					} else {
						res.status(500).send({message: 'Samsara Vehicle Id not found for the Truck'});
					}

				} else if(companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'motive') {

					const motiveVehicleId = await this.motiveService.getMotiveVehicleId(vehicle_id);
					if (motiveVehicleId
						&& motiveVehicleId.data
						&& motiveVehicleId.data[0]
						&& motiveVehicleId.data[0].MotiveVehicleId != null) {

						const vehicleLocationRequest = { vehicle_ids: motiveVehicleId.data[0].MotiveVehicleId };
						const vehicleLocationData = await this.motiveService.getVehicleLocation(vehicleLocationRequest,
							companyIntegrationDetails.data[0].ApiKey);

						if (vehicleLocationData.data.data.vehicles.length > 0) {
							const vehicleLocation = vehicleLocationData.data.data.vehicles[0];
							res.send({
								'heading': vehicleLocation && vehicleLocation.vehicle && vehicleLocation.vehicle.current_location &&
									vehicleLocation.vehicle.current_location.bearing || 0.0,
								'latitude': vehicleLocation && vehicleLocation.vehicle && vehicleLocation.vehicle.current_location &&
									vehicleLocation.vehicle.current_location.lat || 0.0,
								'location': vehicleLocation && vehicleLocation.vehicle && vehicleLocation.vehicle.current_location &&
									vehicleLocation.vehicle.current_location.description || null,
								'longitude': vehicleLocation && vehicleLocation.vehicle && vehicleLocation.vehicle.current_location &&
									vehicleLocation.vehicle.current_location.lon || 0.0,
								'speed': vehicleLocation && vehicleLocation.vehicle && vehicleLocation.vehicle.current_location &&
									vehicleLocation.vehicle.current_location.speed || 0.0
							});

						} else {
							res.status(500).send({message: 'Vehicle Location not found for the Truck'})
						}
					} else {
						res.status(500).send({message: 'Motive Vehicle Id not found for the Truck'});
					}

				} else if (companyIntegrationDetails.data[0].ApiKey
					&& companyIntegrationDetails.data[0].Partner === 'truckx') {

					const truckXVehicleId = await this.truckXService.getTruckXVehicleId(vehicle_id);
					const truckIds = [] as any

					if (truckXVehicleId
						&& truckXVehicleId.data
						&& truckXVehicleId.data[0]
						&& truckXVehicleId.data[0].ELDVehicleId
						&& truckXVehicleId.data[0].ELDVehicleId != null) {

						truckIds.push(truckXVehicleId.data[0].ELDVehicleId)
						const result = await this.truckXService.getLocation({ truckIds }, companyIntegrationDetails.data[0].ApiKey)
						if (result.data && result.data[truckIds[0]]){
							const location = result.data[truckIds[0]];
							res.send({
								data : {
									'latitude': location.latitude || 0.0,
									'longitude': location.longitude || 0.0,
									'odometer': location.odometer || 0,
									'timestamp': location.timestamp || null,
									'type' : 'TRUCKX'
								}
							});
						} else {
							res.status(500).send({message: 'Location Not Found For the truck'});
						}
					} else {
						res.status(500).send({message: 'TruckX TruckId not found for the Driver'});
					}

				} else {
					const vehicleLocationData = await this.eldService.getTruckLocationbyTruckId({ truck_Id: vehicle_id });
					if (vehicleLocationData.data.length > 0) {
						const vehicleLocation = vehicleLocationData.data[0]
						res.send({
							'heading': vehicleLocation && vehicleLocation[0].bearing || 0.0,
							'latitude': vehicleLocation && vehicleLocation[0].latitude || 0.0,
							'location': vehicleLocation && vehicleLocation[0].locationDescription || null,
							'longitude': vehicleLocation && vehicleLocation[0].longitude || 0.0,
							'speed': vehicleLocation && vehicleLocation[0].speed || 0.0
						});
					} else {
						res.status(500).send({message: 'Vehicle Location not found for the Truck'})
					}
				}
			} else {
				res.status(500).send({message: 'Samsara/Motive/TrucX token not found for the company'});
			}
		} catch (error) {
			if(error.response){ res.status(error.response.status).send(error.response.data) }
			else { res.status(500).send(this.getErrorResponse(error)) }
		}
	}

	public async getAssetLocation(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { asset_id, start_date, start_date_timestamp, end_date, end_date_timestamp, per_page, page_no } = req.body
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0) {

				if (companyIntegrationDetails.data[0].ApiKey && companyIntegrationDetails.data[0].Partner === 'samsara') {
					const assetLocationRequest = {startMs: start_date_timestamp, endMs: end_date_timestamp}
					const vehicleLocationData = await this.samsaraService.getAssetLocation(asset_id, assetLocationRequest,
						companyIntegrationDetails.data[0].ApiKey)
					if (vehicleLocationData.data) {
						res.send(vehicleLocationData.data)
					} else {
						res.status(500).send({message: 'Asset Location not found for the Driver'});
					}

				} else if(companyIntegrationDetails.data[0].ApiKey && companyIntegrationDetails.data[0].Partner === 'motive') {

					const assetRequest = {start_date, end_date, per_page, page_no}
					const assetLocation = await this.motiveService.getAssetLocation(asset_id, assetRequest, companyIntegrationDetails.data[0].ApiKey)
					if (assetLocation.data.data) {
						res.send(assetLocation.data.data)
					} else {
						res.status(500).send({message: 'Asset Location not found for the Driver'});
					}

				} else {
					res.status(500).send({message: 'Samsara/Motive token not found for the company'});
				}
			} else {
				res.status(500).send({message: 'Samsara/Motive token not found for the company'});
			}

		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getIftaSummary(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { vehicle_id, start_date, end_date, per_page, page_no, year, month, after } = req.body
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false)
			if(companyIntegrationDetails.data&&companyIntegrationDetails.data.length>0) {

				if (companyIntegrationDetails.data[0].ApiKey && companyIntegrationDetails.data[0].Partner === 'samsara') {

					const iftaTrips = {vehicleIds: vehicle_id, year, month, after}
					const iftaTripData = await this.samsaraService.getIftaReports(iftaTrips, companyIntegrationDetails.data[0].ApiKey)
					if (iftaTripData.data) {
						res.send(iftaTripData.data)
					} else {
						res.status(500).send({message: 'Available time not found for the Driver'});
					}

				} else if(companyIntegrationDetails.data[0].ApiKey && companyIntegrationDetails.data[0].Partner === 'motive') {

					const iftaTripRequest = {vehicle_ids: vehicle_id, start_date, end_date, per_page, page_no}
					const iftaTrips = await this.motiveService.getIftaSummary(iftaTripRequest, companyIntegrationDetails.data[0].ApiKey)
					if (iftaTrips.data.data) {
						res.send(iftaTrips.data.data)
					} else {
						res.status(500).send({message: 'IFTA Trips not found for the Driver'});
					}

				} else {
					res.status(500).send({message: 'Samsara/Motive token not found for the company'});
				}
			} else {
				res.status(500).send({message: 'Samsara/Motive token not found for the company'});
			}

		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getTravelHistory(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { startTime, endTime, truckId } = req.body
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false)
			if (companyIntegrationDetails.data && companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].Partner === 'samsara') {

				const samsaraApiKey = companyIntegrationDetails.data[0].ApiKey
				const samsaraVehicleId = await this.samsaraService.getSamsaraVehicleId(truckId)
				if (samsaraVehicleId && samsaraVehicleId.data && samsaraVehicleId.data[0] && samsaraVehicleId.data[0].SamsaraVehicleId != null) {

					const vehicleHistoryRequest = {
						'endTime': endTime,
						'startTime': startTime,
						'vehicleIds': samsaraVehicleId.data[0].SamsaraVehicleId
					}
					const routeHistory = await this.samsaraService.getVehicleRouteHistory(vehicleHistoryRequest, samsaraApiKey)
					const travelHistory = (routeHistory.data && routeHistory.data.data
						&& routeHistory.data.data[0]) ? routeHistory.data.data[0] : {}
					res.send(travelHistory)

				} else {
					res.status(500).send({message : 'Samsara Vehicle Id Not Found'});
				}
			}else {
				res.status(500).send({message : 'Samsara Token Not Found'});
			}
		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getRouteInfo(req: express.Request, res: express.Response): Promise<any> {
		try {
			const vehicleRoute = {} as any
			const { doId, relayId, truckId } = req.body
			const user = req.user as any;
			const  companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false)
			if (companyIntegrationDetails.data && companyIntegrationDetails.data.length>0 && companyIntegrationDetails.data[0].ApiKey
				&& companyIntegrationDetails.data[0].Partner === 'samsara') {

				const samsaraApiKey = companyIntegrationDetails.data[0].ApiKey
				const samsaraVehicleId = await this.samsaraService.getSamsaraVehicleId(truckId)

				if (samsaraVehicleId && samsaraVehicleId.data && samsaraVehicleId.data[0] && samsaraVehicleId.data[0].SamsaraVehicleId != null) {

					const vehicleCurrentLocationRequest = { 'vehicleIds' : samsaraVehicleId.data[0].SamsaraVehicleId }
					const getVehicleCurrentLocation = await this.samsaraService.getVehicleLocationRoute(vehicleCurrentLocationRequest, samsaraApiKey)

					if (getVehicleCurrentLocation.data && getVehicleCurrentLocation.data.data && getVehicleCurrentLocation.data.data[0]){

						vehicleRoute.vehicleLocation = getVehicleCurrentLocation.data.data[0]
						if (getVehicleCurrentLocation.data.data[0].location && getVehicleCurrentLocation.data.data[0].location.latitude
							&& getVehicleCurrentLocation.data.data[0].location.longitude){

							const location = getVehicleCurrentLocation.data.data[0].location
							const calRout = await this.calculateRoutData(relayId, doId, location)
							vehicleRoute.calculatedRoute = calRout

						} else {
							const calRout = await this.calculateRoutData(relayId, doId, null)
							vehicleRoute.calculatedRoute = calRout
						}
					}else {
						const calRout = await this.calculateRoutData(relayId, doId, null)
						vehicleRoute.calculatedRoute = calRout
					}
				} else {
					res.status(500).send({message : 'Samsara Vehicle Id Not Found'});
				}
			}else {
				res.status(500).send({message : 'Samsara Token Not Found'});
			}
			res.send(vehicleRoute)
		}catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}

	}

	public async createRoute(req: express.Request, res: express.Response): Promise<any> {
		try {
			const urlParts = url.parse(req.url, true);
			let doId = null
			let relayId = null
			if (urlParts.query && urlParts.query.doId){
				doId = urlParts.query.doId
			}
			if (urlParts.query && urlParts.query.relayId){
				relayId = urlParts.query.relayId
			}
			const loadDetails = await this.samsaraService.getLoadDetailsForRouteCreation(doId, relayId)
			if (loadDetails.data
				&& loadDetails.data.length > 0
				&& loadDetails.data[0]){
				for (const load of loadDetails.data[0]){
					if (load.id && load.samsaraVehicleId && load.samsaraToken){
						await this.createRouteData(load)
					}
				}
				res.send({message: 'Successfully Created Route'})
			} else {
				res.status(500).send({ message : 'Unable to get load'});
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateRoute(req: express.Request, res: express.Response): Promise<any> {
		try {
			const urlParts = url.parse(req.url, true);
			let doId = null
			let relayId = null
			if (urlParts.query && urlParts.query.doId){
				doId = urlParts.query.doId
			}
			if (urlParts.query && urlParts.query.relayId){
				relayId = urlParts.query.relayId
			}
			const loadDetails = await this.samsaraService.getLoadDetailsForRouteCreation(doId, relayId)
			if (loadDetails.data
				&& loadDetails.data.length > 0
				&& loadDetails.data[0]){
				for (const load of loadDetails.data[0]){
					if (load.id && load.samsaraVehicleId && load.samsaraToken){
						if (load.samsaraRouteId){
							const currentRoute = await this.samsaraService.fetchRoute(load.samsaraRouteId, load.samsaraToken);
							if (currentRoute.data && currentRoute.data.data && currentRoute.data.data.stops){
								for (let i = 0; i < currentRoute.data.data.stops.length; i++){
									if (i > 0) {
										const stop = currentRoute.data.data.stops[i]
										if ((stop.actualArrivalTime || stop.actualDepartureTime) && stop.externalIds && stop.externalIds.id) {
											if (stop.actualArrivalTime){
												const utcTimestamp = tz.utc(stop.actualArrivalTime);
												const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
												const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
												await this.samsaraService.updateArrivedDate(dateTime, stop.externalIds.id)
											}
											if (stop.eta){
												const utcTimestamp = tz.utc(stop.eta);
												const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
												const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
												await this.samsaraService.updateEta(dateTime, stop.externalIds.id)
											}
											if (stop.actualDepartureTime){
												const utcTimestamp = tz.utc(stop.actualDepartureTime);
												const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
												const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
												await this.samsaraService.updateEta(null, stop.externalIds.id)
												await this.samsaraService.updateLeavedDate(dateTime, stop.externalIds.id)
											}
										} else {
											await this.samsaraService.deleteAddress(stop.address.id, loadDetails.data[0][0].samsaraToken);
										}
									}
								}
								await this.samsaraService.deleteRoute(load.samsaraRouteId, load.samsaraToken);
								await this.samsaraService.updateRouteId(null, load.doId, load.relayId);
								const loadDetail = await this.samsaraService.getLoadDetailsForRouteCreation(load.doId, load.relayId)
								await this.createRouteData(load)
							}
						} else {
							await this.createRouteData(load)
						}
					}
				}
				res.send({message: 'Successfully Created Route'})
			} else {
				res.status(500).send({ message : 'Unable to get load'});
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getRouteUpdates(req: express.Request, res: express.Response): Promise<any>{
		try {
			const urlParts = url.parse(req.url, true);
			let doId = null
			let relayId = null
			if (urlParts.query && urlParts.query.doId){
				doId = urlParts.query.doId
			}
			if (urlParts.query && urlParts.query.relayId){
				relayId = urlParts.query.relayId
			}
			const loadDetails = await this.samsaraService.getLoadDetailsForRouteCreation(doId, relayId)
			if (loadDetails.data
				&& loadDetails.data.length > 0
				&& loadDetails.data[0]) {

				for(const loadData of loadDetails.data[0]){
					if (loadData.samsaraToken && loadData.samsaraRouteId){
						const routeUpdates = await this.samsaraService.fetchRoute(loadData.samsaraRouteId, loadData.samsaraToken)
						if (routeUpdates.data && routeUpdates.data.data){
							for(const stopData of routeUpdates.data.data.stops){
								if (stopData.externalIds && stopData.externalIds.id){
									if (stopData.actualArrivalTime){
										const utcTimestamp = tz.utc(stopData.actualArrivalTime);
										const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
										const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
										await this.samsaraService.updateEta(null, stopData.externalIds.id)
										await this.samsaraService.updateArrivedDate(dateTime, stopData.externalIds.id)
									}
									if (stopData.eta){
										const utcTimestamp = tz.utc(stopData.eta);
										const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
										const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
										await this.samsaraService.updateEta(dateTime, stopData.externalIds.id)
									}
									if (stopData.actualDepartureTime){
										const utcTimestamp = tz.utc(stopData.actualDepartureTime);
										const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
										const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
										await this.samsaraService.updateEta(null, stopData.externalIds.id)
										await this.samsaraService.updateLeavedDate(dateTime, stopData.externalIds.id)
									}
								}
							}
						} else if (routeUpdates.data.message){
							const stopData = (loadData.stopDetails ? JSON.parse(`[ ${loadData.stopDetails} ]`) : []);
							for(const stopDetail of stopData){
								const utcTimestamp = tz.utc();
								const pstTimestamp = utcTimestamp.tz('America/Los_Angeles');
								const dateTime = pstTimestamp.format('YYYY-MM-DD HH:mm:ss')
								await this.samsaraService.updateEta(null, stopDetail.id)
								await this.samsaraService.updateArrivedDate(dateTime, stopDetail.id)
								await this.samsaraService.updateLeavedDate(dateTime, stopDetail.id)
							}
						}
					}
				}

			}
			res.send({message :'Successful'})
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async deleteRoute(req: express.Request, res: express.Response): Promise<any>{
		try {

			const urlParts = url.parse(req.url, true);
			let doId = null
			let relayId = null
			if (urlParts.query && urlParts.query.doId){
				doId = urlParts.query.doId
			}
			if (urlParts.query && urlParts.query.relayId){
				relayId = urlParts.query.relayId
			}
			const loadDetails = await this.samsaraService.getRouteIdAndSamsaraToken(doId, relayId)

			if (loadDetails.data
				&& loadDetails.data.length > 0
				&& loadDetails.data[0]) {

				for(const loadData of loadDetails.data[0]){
					if (loadData.samsaraToken && loadData.samsaraRouteId){
						const route = await this.samsaraService.fetchRoute(loadData.samsaraRouteId, loadData.samsaraToken);
						if (route.data && route.data.data){
							if (route.data.data.stops) {
								for (const stop of route.data.data.stops) {
									if (stop.address && stop.address.id) {
										await this.samsaraService.deleteAddress(stop.address.id, loadData.samsaraToken);
									}
								}
							}
							await this.samsaraService.deleteRoute(loadData.samsaraRouteId, loadData.samsaraToken);
							await this.samsaraService.updateRouteId(null, doId, relayId);
						}
					}
				}
				res.send({ message : 'Route Deleted Successfully'})

			} else {
				res.status(500).send({ message : 'Unable to get Load'})
			}

		} catch (error) {
			if(error.response){
				res.status(error.response.status).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	private async calculateRoutData(relayId: any, doId: any, location: any): Promise<any> {
		try {
			const routeRequest = {} as any
			routeRequest.apiKey = this.hereMapsApiKey
			routeRequest.mode = 'fastest;truck'
			if (location != null){

				const latitude = location.latitude
				const longitude = location.longitude
				routeRequest.waypoint0 = `geo!${latitude},${longitude}`
				if (relayId != null){

					const stopLocation = await this.samsaraService.getStopDetailsByRelayId(relayId)
					if (stopLocation.data && stopLocation.data.length > 0){
						let j = 1
						for (let i = 0; i < stopLocation.data.length; i++) {
							if (stopLocation.data[i].latitude != null && stopLocation.data[i].longitude != null){
								routeRequest[`waypoint${j}`] = `geo!${stopLocation.data[i].latitude},${stopLocation.data[i].longitude}`
								j += 1
							}
						}
					}
					const getRouteData = await this.heremapsService.calculateRoute(routeRequest)
					if (getRouteData.data && getRouteData.data.response&& getRouteData.data.response.route){
						return getRouteData.data.response.route
					}else {
						return { message : 'Route Not Found'}
					}
				}else {

					const stopLocationByDoId = await this.samsaraService.getStopDetailsByDoId(doId)
					if (stopLocationByDoId.data && stopLocationByDoId.data.length > 0){
						let j = 1
						for (let i = 0; i < stopLocationByDoId.data.length; i++) {
							if (stopLocationByDoId.data[i].latitude != null && stopLocationByDoId.data[i].longitude != null){
								routeRequest[`waypoint${j}`] = `geo!${stopLocationByDoId.data[i].latitude},${stopLocationByDoId.data[i].longitude}`
								j += 1
							}
						}
					}
					const getRouteData = await this.heremapsService.calculateRoute(routeRequest)
					if (getRouteData.data && getRouteData.data.response && getRouteData.data.response.route){
						return getRouteData.data.response.route
					}else {
						return { message : 'Route Not Found'}
					}
				}
			}else {
				if (relayId != null){
					const stopLocation = await this.samsaraService.getStopDetailsByRelayId(relayId)
					if (stopLocation.data && stopLocation.data.length > 0){
						let j = 0
						for (let i = 0; i < stopLocation.data.length; i++) {
							if (stopLocation.data[i].latitude != null && stopLocation.data[i].longitude != null){
								routeRequest[`waypoint${j}`] = `geo!${stopLocation.data[i].latitude},${stopLocation.data[i].longitude}`
								j += 1
							}
						}
					}
					const getRouteData = await this.heremapsService.calculateRoute(routeRequest)
					if (getRouteData.data && getRouteData.data.response&& getRouteData.data.response.route){
						return getRouteData.data.response.route
					}else {
						return { message : 'Route Not Found'}
					}
				}else {
					const stopLocationByDoId = await this.samsaraService.getStopDetailsByDoId(doId)
					if (stopLocationByDoId.data && stopLocationByDoId.data.length > 0){
						let j = 0
						for (let i = 0; i < stopLocationByDoId.data.length; i++) {
							if (stopLocationByDoId.data[i].latitude != null && stopLocationByDoId.data[i].longitude != null){
								routeRequest[`waypoint${j}`] = `geo!${stopLocationByDoId.data[i].latitude},${stopLocationByDoId.data[i].longitude}`
								j += 1
							}
						}
					}
					const getRouteData = await this.heremapsService.calculateRoute(routeRequest)
					if (getRouteData.data && getRouteData.data.response && getRouteData.data.response.route){
						return getRouteData.data.response.route
					}else {
						return { message : 'Route Not Found'}
					}
				}
			}
		} catch (e) {
			return { message: e.message}
		}
	}

	private async createRouteData(load: any): Promise<any> {
		try {
			const vehicleCurrentLocationRequest = {'vehicleIds': load.samsaraVehicleId}
			const getVehicleCurrentLocation = await this.samsaraService.getVehicleLocation(vehicleCurrentLocationRequest, load.samsaraToken)

			if (getVehicleCurrentLocation.data
				&& getVehicleCurrentLocation.data.data
				&& getVehicleCurrentLocation.data.data[0]
				&& getVehicleCurrentLocation.data.data[0].location
				&& getVehicleCurrentLocation.data.data[0].location.latitude
				&& getVehicleCurrentLocation.data.data[0].location.longitude
				&& getVehicleCurrentLocation.data.data[0].name
				&& getVehicleCurrentLocation.data.data[0].location.reverseGeo
				&& getVehicleCurrentLocation.data.data[0].location.reverseGeo.formattedLocation) {

				const stopsData = [];
				const createAddressRequestForCurrentLocation = {
					'formattedAddress': getVehicleCurrentLocation.data.data[0].location.reverseGeo.formattedLocation,
					'geofence': {
						'circle': {
							'latitude': getVehicleCurrentLocation.data.data[0].location.latitude,
							'longitude': getVehicleCurrentLocation.data.data[0].location.longitude,
							'radiusMeters': 1000
						}
					},
					'latitude': getVehicleCurrentLocation.data.data[0].location.latitude,
					'longitude': getVehicleCurrentLocation.data.data[0].location.longitude,
					'name': `${getVehicleCurrentLocation.data.data[0].name} - Started Location`
				};

				const insertedCurrentAddress = await this.samsaraService.addAddress(createAddressRequestForCurrentLocation, load.samsaraToken);
				if (insertedCurrentAddress.data && insertedCurrentAddress.data.data && insertedCurrentAddress.data.data.id) {
					stopsData.push(
						{
							'addressId': insertedCurrentAddress.data.data.id,
							'scheduledDepartureTime': moment().utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
						}
					);
				}

				const stopData = (load.stopDetails ? JSON.parse(`[ ${load.stopDetails} ]`) : []);
				const stopDetails = stopData.sort((a : any, b : any) => a.stopNumber - b.stopNumber);

				for (const stopDetail of stopDetails) {
					if (stopDetail.address && stopDetail.latitude && stopDetail.longitude && stopDetail.stopNumber
						&& stopDetail.stopType && stopDetail.id && stopDetail.fromDate) {
						const createAddressRequest = {
							'formattedAddress': stopDetail.address,
							'geofence': {
								'circle': {
									'latitude': stopDetail.latitude,
									'longitude': stopDetail.longitude,
									'radiusMeters': 200
								}
							},
							'latitude': stopDetail.latitude,
							'longitude': stopDetail.longitude,
							'name': `${stopDetail.stopNumber} - ${stopDetail.stopType} (${stopDetail.woStop_Id})`
						};
						const insertedAddress = await this.samsaraService.addAddress(createAddressRequest, load.samsaraToken);
						if (insertedAddress.data && insertedAddress.data.data && insertedAddress.data.data.id) {
							stopsData.push(
								{
									'addressId': insertedAddress.data.data.id,
									'externalIds': {
										'id': stopDetail.id ? stopDetail.id.toString() : null
									},
									'scheduledArrivalTime': moment(stopDetail.fromDate).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
								}
							);
						}
					}
				}

				if (stopsData.length > 1) {
					const createRouteRequest = {
						'name': `${getVehicleCurrentLocation.data.data[0].name} - Route`,
						'settings': {
							'routeCompletionCondition': 'arriveLastStop',
							'routeStartingCondition': 'departFirstStop'
						},
						stops: stopsData,
						'vehicleId': load.samsaraVehicleId
					};
					const createdRoute = await this.samsaraService.createRoute(createRouteRequest, load.samsaraToken);
					if (createdRoute.data && createdRoute.data.data && createdRoute.data.data.id) {
						await this.samsaraService.updateRouteId(createdRoute.data.data.id, load.doId, load.relayId);
					}
				}
			}
			return
		} catch (e) {
			return
		}
	}
}

export default EldSyncController;
