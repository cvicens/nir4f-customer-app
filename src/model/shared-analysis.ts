function makeid (n) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < n; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }

export class SharedAnalysis {
  id: string;
  date: string;
  analisysId: string;
  userId: string;
  advisorId: string;
  enabled: boolean;

  constructor(
    analisysId: string,
    userId: string,
    advisorId: string) {
    this.id = makeid(24);
    this.analisysId = analisysId;
    this.userId = userId;
    this.advisorId = advisorId;
    this.enabled = true;
  }
}