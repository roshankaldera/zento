/** Base route for the Inventory Group master feature. */
export const INVENTORY_GROUP_LIST_PATH = "/master/sub-masters/inventory_group"
export const INVENTORY_GROUP_NEW_PATH = `${INVENTORY_GROUP_LIST_PATH}/new`
export const inventoryGroupEditPath = (id: number) =>
  `${INVENTORY_GROUP_LIST_PATH}/${id}/edit`
