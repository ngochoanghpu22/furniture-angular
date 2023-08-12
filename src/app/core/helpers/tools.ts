import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

export const AvailableIcons: string[] = [
	'car', 'plane', 'coffee', 'building',
	'computer-classic',
	'hotel', 'bed',
	'tv', 'umbrella-beach',
	'book', 'hospital', 'store',
	'archive', 'backpack', 'bus-alt',
	'ethernet', 'fax', 'times-circle'
];

export const AvailableColors: string[] = [
	'#029C56', '#DAC6FA', '#FFF033', '#98DEEA',
	'#F55B1D', '#FEB2CD', '#c81c1c', '#03dac5',
	'#7f39fb', '#4dd6cb', '#90c644', '#a83f80'
];

export const IconOfficeColor: string = '#98DEEA';

export function moveItemToFirstById(list: any[], itemId: string | null): any[] {
	const item = list.find(x => x.id === itemId);
	const rest = list.filter(x => x.id !== itemId);
	if (item) {
		rest.unshift(item);
	}
	return rest;
}

export const addOrUpdateList = (list: any[], item: any) => {
	const index = list.findIndex(x => x.id == item.id);
	if (index < 0)
		list.push(item);
	else
		list[index] = item;
	list = [...list];
}


export function CapacityGreaterThanAllowedLoadValidator() {
	return (group: FormGroup): ValidationErrors | null => {
		const capacityCtr = group.controls.capacity;
		const allowedLoadCtr = group.controls.allowedLoad;

		if (capacityCtr.value == null || allowedLoadCtr.value == null) {
			return null;
		}

		let hasError = capacityCtr.value < allowedLoadCtr.value;
		const error = hasError ? { CapacityGreaterThanAllowedLoad: hasError } : null;

		capacityCtr.setErrors(error);
		allowedLoadCtr.setErrors(error);

		return hasError ? error : null;
	}
}

export const capacityAllowedLoadValidator = (c: AbstractControl): ValidationErrors | null => {
	const capacity = c.get('capacity')?.value || 0;
	const allowedLoad = c.get('allowedLoad')?.value || 0;
	if (allowedLoad > capacity) {
		return {
			allowedLoadGreaterThanCapacity: true
		}
	}
	return null;
}

/**
 * Add access point Url to path of image
 * @param path 
 * @param accessPointUrl 
 * @returns 
 */
export const toApiPath = (path: string, accessPointUrl: string): string => {
	return path?.indexOf('/api') >= 0
		? `${accessPointUrl}${path}`
		: path;
}

export function newGuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function emptyGuid() {
	return '00000000-0000-0000-0000-000000000000';
}