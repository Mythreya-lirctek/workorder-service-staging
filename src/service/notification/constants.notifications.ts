export enum WebNotificationsType {
	Company=1,
	USER=2

}
export enum WebModificationType{
	UserInActive=-1,
	CompanyInActive=-1,
	UserChanges=1,
	CompanyChanges=1
}

export enum MobileNotificationsType {
	UserInActive=-1,
	LoadBoard_Loads=21
}

export enum MobileModificationType{
	UserInActive=-1,
	LoadBoard_Loads_LoadPosted=1,
	LoadBoard_Loads_LoadCounterOffer=2,
	LoadBoard_Loads_LoadAccepted=3,
	LoadBoard_Loads_LoadInactive=4

}

export enum Devices{
	iOS='iOS',
	Android='Android',
	Web='Web'
}