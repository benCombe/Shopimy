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
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}${expires}${secure}`;
  }

  // Get a cookie value by name
  get(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  }

  // Check if a cookie exists
  check(name: string): boolean {
    return this.get(name) !== null;
  }

  // Delete a cookie by setting its expiration date in the past
  delete(name: string, path: string = '/', domain?: string) {
    let domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${encodeURIComponent(name)}=; path=${path}${domainStr}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  }

}

