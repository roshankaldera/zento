export const INVENTORY_LIST_PATH = "/master/inventory"
export const INVENTORY_NEW_PATH = `${INVENTORY_LIST_PATH}/new`
export const inventoryEditPath = (id: number) =>
  `${INVENTORY_LIST_PATH}/${id}/edit`
