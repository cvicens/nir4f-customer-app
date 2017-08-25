export class Dataset<T> extends Array<T> {
  id: string = null;
  online: boolean = false;

  constructor(id: string, online?: boolean) {
    super();
    this.id = id;
    this.online = online ? online : false;
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