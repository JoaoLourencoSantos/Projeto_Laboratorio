import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_BASEPATH = environment.API_BASEPATH;

  constructor(private http: HttpClient, private router: Router) {}

  auth = async (username, password) => {
    let result: any = { sucess: true, error: null };
    await this.sendPost({ username, password }, '/auth/login/')
      .toPromise()
      .then((response) => {
        console.log(response);

        if (!response.sucess) {
          result.sucess = false;
          result.error = response.message;
        } else {
          this.setSessao({ token: response.access_token, body: response.body });
        }
      })
      .catch((err) => {
        result.sucess = false;
        result.error = 'Erro no servidor';
      });

    return result;
  };

  registerUser = async (name, email, password) => {
    let result: any = { sucess: true, error: null };
    await this.sendPost({ name, email, password }, '/user/')
      .toPromise()
      .then((response) => {
        console.log(response);

        if (!response.sucess) {
          result.sucess = false;
          result.error = response.message;
        } else {
          this.setSessao({ token: response.access_token, body: response.body });
        }
      })
      .catch((err) => {
        result.sucess = false;
        result.error = 'Erro no servidor';
      });

    return result;
  };

  updateUser = async (id, name, email, password) => {
    let result: any = { sucess: true, error: null };

    const body = !password ? { id, name, email } : { id, name, email, password };

    console.log(body);

    await this.sendPut(body, '/user/')
      .toPromise()
      .then((response) => {
        console.log(response);

        if (!response.sucess) {
          result.sucess = false;
          result.error = response.message;
        } else {
          this.setSessao({ token: response.access_token, body: response.body });
        }
      })
      .catch((err) => {
        result.sucess = false;
        result.error = 'Erro no servidor';
      });

    return result;
  };

  sendPost(body, url): Observable<any> {
    return this.http.post<any>(`${this.API_BASEPATH}${url}`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sendPut(body, url): Observable<any> {
    return this.http.put<any>(`${this.API_BASEPATH}${url}`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  setSessao(identificador: any): void {
    localStorage.setItem('lab_user_logged', JSON.stringify(identificador));
  }

  removeSession(): void {
    localStorage.removeItem('lab_user_logged');
    this.router.navigate(['login']);
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem('lab_user_logged')) return true;

    return false;
  }

  getSessao(): any {
    return JSON.parse(localStorage.getItem('lab_user_logged'));
  }
}
