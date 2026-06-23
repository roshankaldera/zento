/** KOT Ingredient Order routes. New (empty create form) is the default page. */
export const KOT_INGREDIENT_BASE_PATH = "/operation/villa/ingredient-order"
/** Default page — opens an empty New (create) form. */
export const KOT_INGREDIENT_NEW_PATH = KOT_INGREDIENT_BASE_PATH
/** List page — the DataTable of ingredient orders. */
export const KOT_INGREDIENT_LIST_PATH = `${KOT_INGREDIENT_BASE_PATH}/list`
/** Update (edit) page for a single ingredient order record. */
export const kotIngredientEditPath = (id: number) =>
  `${KOT_INGREDIENT_BASE_PATH}/${id}/edit`
