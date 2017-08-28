export class Session {
  objectId: string;
  day: number;
  title: string;
  slug: string;
  location: string;
  startTime: string;
  endTime: string;
  hasDetails: boolean;
  allDay: boolean;
  sortTime: number;
  displayTime: string;

  constructor(
  objectId: string,
  day: number,
  title: string,
  slug: string,
  location: string,
  startTime: string,
  endTime: string,
  hasDetails: boolean,
  allDay: boolean,
  sortTime: number,
  displayTime: string) {
    
  }
}