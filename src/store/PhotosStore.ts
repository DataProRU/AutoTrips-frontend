import { makeAutoObservable, runInAction } from "mobx";
import PhotosService from "../services/PhotosService";
import { Photo } from "../models/response/Photo";

class PhotosStore {
  photos: Photo[] = [];
  error: string | null = null;
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPhotos(reportId: string, type: string) {
    try {
      runInAction(() => {
        this.loading = true;
        this.error = null;
      });

      const response = await PhotosService.getPhotos(reportId, type);
      
      runInAction(() => {
        this.photos = response.data;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to load photos";
        this.photos = [];
        this.loading = false;
      });
      throw error;
    }
  }

  get photoUrls(): string[] {
    return this.photos.map(photo => photo.image);
  }

  clearPhotos() {
    this.photos = [];
    this.error = null;
    this.loading = false;
  }
}

const photosStore = new PhotosStore();
export default photosStore;