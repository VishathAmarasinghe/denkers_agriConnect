

import axios, { AxiosInstance } from "axios";

export class APIService {
  private static _instance: AxiosInstance;

  // Initialize the instance statically to avoid re-initializing
  static initialize(baseURL: string) {
    if (!APIService._instance) {
      APIService._instance = axios.create({
        baseURL: baseURL,
        timeout: 5000, // Optional timeout
      });
    }
  }

  // Get the shared axios instance
  public static getInstance(): AxiosInstance {
    if (!APIService._instance) {
      throw new Error("APIService not initialized. Call initialize() first.");
    }
    return APIService._instance;
  }
}
