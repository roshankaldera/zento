/** Base route for the Crop master feature. */
export const CROP_LIST_PATH = "/master/sub-masters/crop"
export const CROP_NEW_PATH = `${CROP_LIST_PATH}/new`
export const cropEditPath = (id: number) => `${CROP_LIST_PATH}/${id}/edit`
