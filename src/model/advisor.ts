function makeid (n) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < n; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }

export class Advisor {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;

  constructor(
    firstName?: string,
    lastName?: string,
    phoneNumber?: string) {
    this.id = makeid(24);
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
  }
}