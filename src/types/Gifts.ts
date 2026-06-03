export interface Person {
  id: number;
  name: string;
  birthdayMonth?: number;
  birthdayDay?: number;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewPersonDTO {
  name: string;
  birthdayMonth?: number;
  birthdayDay?: number;
}

export interface UpdatePersonDTO {
  name?: string;
  birthdayMonth?: number;
  birthdayDay?: number;
}

export interface Gift {
  id: number;
  title: string;
  link?: string;
  giftFor: string;
  event?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftWithPersonId extends Gift {
  personId: number;
}

export interface GiftFilters {
  statusId?: number;
  eventId?: number;
  title?: string;
  link?: string;
}

export interface NewGiftDTO {
  title: string;
  link?: string;
  personId: number;
  event?: string;
  status?: string;
}

export interface UpdateGiftDTO {
  title?: string;
  link?: string;
  giftFor?: number;
  event?: string;
  status?: string;
}

export interface GiftStatus {
  id: number;
  name: string;
  color?: string;
}

export interface Event {
  id: number;
  name: string;
  color?: string;
}

export interface GiftFormData {
  title: string;
  link: string;
  personId: number;
  event: string;
  status: string;
}

export interface PersonFormData {
  name: string;
  birthdayMonth: number | '';
  birthdayDay: number | '';
}
