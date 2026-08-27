/**
 * Shapes returned by the SmartBill Cloud REST API.
 *
 * Verified against a live `GET /stocks` response for CIF RO7307488:
 * two gestiuni ("MAGAZIN" en detail, "DEPOZIT" en gros) and four fields per
 * product. SmartBill returns HTTP 200 even for application-level failures, so
 * `errorText` is the field that actually decides success.
 */
export type SmartBillStockProduct = {
  productName: string
  productCode: string
  measuringUnit: string
  quantity: number
}

export type SmartBillWarehouse = {
  warehouseName: string
  warehouseType: string
}

export type SmartBillStockEntry = {
  warehouse: SmartBillWarehouse
  products: SmartBillStockProduct[]
}

export type SmartBillStockResponse = {
  errorText: string
  message: string
  number: string
  series: string
  url: string
  list: SmartBillStockEntry[]
}
