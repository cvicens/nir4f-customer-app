function makeid (n) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < n; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }

export class Analysis {
  id: string;
  date: string;
  dm: number; // Dry Matter
  cp: number; // Crude Protein
  dv: number; // D Value
  me: number; // ME
  starch: number;
  sugar: number;
  ndf: number;
  adf: number;
  ph: number;
  la: number; // Lactic Acid
  sharedWith: Array<string>;
  comments: Array<string>;

  constructor(
    date?: string,
    dm?: number, // Dry Matter
    cp?: number, // Crude Protein
    dv?: number, // D Value
    me?: number, // ME
    starch?: number,
    sugar?: number,
    ndf?: number,
    adf?: number,
    ph?: number,
    la?: number) {
    this.id = makeid(24);
    this.date = date;
    this.dm = dm;
    this.cp = cp;
    this.dv = dv;
    this.me = me;
    this.starch = starch;
    this.sugar = sugar;
    this.ndf = ndf;
    this.adf = adf;
    this.ph = ph;
    this.la = la;
    this.sharedWith = new Array<string> ();
    this.comments = new Array<string> ();
  }
}