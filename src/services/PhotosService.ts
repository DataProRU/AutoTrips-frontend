import $api from "../setup/http";

export default class PhotosService {
  static getUsers() {
    return $api.get(`/accounts/users/`);
  }

  static getClients() {
    return $api.get(`/accounts/users/clients/`);
  }

  static getPhotos(reportId: string, type: string) {
    if (type == "docs") {
      return $api.get(`/accounts/users/${reportId}/documents/`);
    }
    return $api.get(`/autotrips/reports/${reportId}/${type}/`);
  }
}
