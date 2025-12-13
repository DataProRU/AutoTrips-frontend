export type AcceptanceData = {
    vin: string;
    model: string;
    carPhotos?: File[] | FileList;
    keyPhotos?: File[] | FileList;
    docsPhotos?: File[] | FileList;
    place?: string;
    notes?: string;
    status: string;
};
