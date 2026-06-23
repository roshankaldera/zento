export const SUPPLIER_LIST_PATH = "/master/supplier"
export const SUPPLIER_NEW_PATH = `${SUPPLIER_LIST_PATH}/new`
export const supplierEditPath = (id: number) =>
  `${SUPPLIER_LIST_PATH}/${id}/edit`
