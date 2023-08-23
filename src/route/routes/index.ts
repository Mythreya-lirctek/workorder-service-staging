import apiRoutes from './api';
import accountingroutes from './accounting';
import workorderRoutes from './workorder';
import searchfavourites from './searchfavourites';
import dispatchorderRoutes from './dispatchorder';
import customerorderRoutes from './customerorder';
import availableLoadsRoutes from './availableloads';
import ten99 from './ten99';
import edi from './edi';
import checkhq from './checkhq';
import coratedetail from './coratedetail';
import coAccountingRoutes from './coaccounting';
import uploadRateconLog from './uploadrateconlog';
import nylas from './nylas';
import quickBookRoutes from './quickbooks';
import dat from './dat';
import eldsync from './eldsync';
import loadboard from './loadboard';
import truckstop from './truckstop';
import fourkites from './fourkites';
import cooffers from './cooffers';
import project44 from './project44';
import heremaps from './heremaps';

export const routes = [
	...apiRoutes,
	...accountingroutes,
	...workorderRoutes,
	...searchfavourites,
	...dispatchorderRoutes,
	...customerorderRoutes,
	...availableLoadsRoutes,
	...coAccountingRoutes,
	...ten99,
	...edi,
	...checkhq,
	...coratedetail,
	...uploadRateconLog,
	...nylas,
	...quickBookRoutes,
	...eldsync,
	...dat,
	...loadboard,
	...truckstop,
	...fourkites,
	...cooffers,
	...project44,
	...heremaps
];
