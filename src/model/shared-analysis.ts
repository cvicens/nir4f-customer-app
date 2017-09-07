import { Analysis } from './analysis';

function makeid (n) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < n; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }

export class SharedAnalysis {
  id: string;
  date: Date;
  analisysId: string;
  userId: string;
  username: string;
  advisorId: string;
  advisorName: string;
  analysis: Analysis;
  enabled: boolean;
  answered: boolean;
  score: number;
  
  constructor(
    analisysId: string,
    userId: string,
    username: string,
    advisorId: string,
    advisorName: string,
    analysis: Analysis) {
    this.id = makeid(24);
    this.date = new Date();
    this.analisysId = analisysId;
    this.userId = userId;
    this.username = username;
    this.advisorId = advisorId;
    this.advisorName = advisorName;
    this.analysis = analysis
    this.enabled = true;
    this.answered = false;
    this.score = (analysis.dv + analysis.me + analysis.adf )/ analysis.ndf;
  }
}