import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  async login({ email, password }) {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }
}
