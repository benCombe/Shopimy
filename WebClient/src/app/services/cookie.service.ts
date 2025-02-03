import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CookieService {

  constructor() {}

  // Set a cookie with a given name, value, and expiration in days
  set(name: string, value: string, days: number, path: string = '/') {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}; path=${path}${expires}`;
  }

  // Get a cookie value by name
  get(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  }

  // Check if a cookie exists
  check(name: string): boolean {
    return this.get(name) !== null;
  }

  // Delete a cookie by setting its expiration date in the past
  delete(name: string, path: string = '/') {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  }

}
