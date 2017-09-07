export class Dataset<T> {
  id: string = null;
  online: boolean = false;
  initialized: boolean = false;
  data: Array<T> = new Array<T> ();

  constructor(id: string, online?: boolean) {
    this.id = id;
    this.online = online ? online : false;
    this.initialized = false;
  }
}

export class DatasetItem {
  code: string = null;
  data: any = false;
  time: Date = null;

  constructor(id: string, data: any, time?: Date) {
    this.code = id;
    this.data = data;
    this.time = time ? time : new Date();
  }
}