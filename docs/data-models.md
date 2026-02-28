# Veri Modeli (Referans)

Bu model, mevcut Firestore temelli yapida yeni modulleri tutarli bicimde eklemek icin referans semadir.

## 1) Item ve Katalog

`items`

- `id` string
- `code` string (benzersiz)
- `name` string
- `uom` string
- `itemType` enum: `raw_material | semi_finished | finished | consumable`
- `defaultSupplierId` string?
- `safetyStock` number
- `reorderPoint` number
- `lotPolicy` enum: `lot_for_lot | fixed_order_qty | min_max`
- `fifoLifoPolicy` enum: `fifo | lifo`
- `isSerialTracked` boolean
- `isLotTracked` boolean
- `standardCost` number

## 2) Supplier

`suppliers`

- `id` string
- `code` string
- `name` string
- `leadTimeDays` number
- `paymentTerms` string
- `email` string

## 3) BOM

`boms`

- `id` string
- `parentItemId` string
- `revision` string
- `status` enum: `draft | active | obsolete`
- `effectiveFrom` date
- `effectiveTo` date?

`bomLines`

- `id` string
- `bomId` string
- `componentItemId` string
- `qtyPer` number
- `scrapPct` number
- `sequence` number

## 4) Routing ve Is Merkezi

`workCenters`

- `id` string
- `code` string
- `name` string
- `capacityPerShiftMin` number
- `efficiencyPct` number

`routings`

- `id` string
- `itemId` string
- `revision` string
- `status` enum

`routingOps`

- `id` string
- `routingId` string
- `sequence` number
- `workCenterId` string
- `setupMin` number
- `runMinPerUnit` number

## 5) MPS ve MRP

`mpsBuckets`

- `id` string
- `itemId` string
- `bucketDate` date
- `plannedQty` number

`mrpRuns`

- `id` string
- `runDate` datetime
- `horizonStart` date
- `horizonEnd` date
- `status` enum: `queued | running | completed | failed`
- `triggeredBy` string

`mrpResults`

- `id` string
- `runId` string
- `itemId` string
- `bucketDate` date
- `grossReq` number
- `scheduledReceipts` number
- `projectedOnHand` number
- `netReq` number
- `plannedOrderQty` number
- `plannedReleaseDate` date

## 6) Stok, Lot, Serial

`inventoryBalances`

- `id` string
- `itemId` string
- `locationId` string
- `onHandQty` number
- `allocatedQty` number

`inventoryLots`

- `id` string
- `itemId` string
- `lotNo` string
- `locationId` string
- `qty` number
- `receiptDate` date
- `expiryDate` date?

`inventorySerials`

- `id` string
- `itemId` string
- `serialNo` string
- `status` enum: `in_stock | consumed | scrapped | shipped`
- `locationId` string

`inventoryMovements`

- `id` string
- `itemId` string
- `movementType` enum: `receipt | issue | transfer | adjust`
- `qty` number
- `lotId` string?
- `serialId` string?
- `refType` string
- `refId` string
- `createdAt` datetime

## 7) Satis, Satin Alma, Is Emirleri

`salesOrders`

- `id` string
- `orderNo` string
- `customerId` string
- `dueDate` date
- `status` enum

`purchaseRequisitions`

- `id` string
- `itemId` string
- `requiredDate` date
- `recommendedQty` number
- `sourceMrpRunId` string

`purchaseOrders`

- `id` string
- `poNo` string
- `supplierId` string
- `orderDate` date
- `expectedDate` date
- `status` enum

`workOrders`

- `id` string
- `woNo` string
- `itemId` string
- `qtyPlanned` number
- `qtyProduced` number
- `status` enum
- `startDate` date
- `dueDate` date

## 8) Maliyet

`costSnapshots`

- `id` string
- `itemId` string
- `materialCost` number
- `routingCost` number
- `overheadCost` number
- `totalStandardCost` number
- `calculatedAt` datetime

`workOrderCosts`

- `id` string
- `workOrderId` string
- `actualMaterialCost` number
- `actualLaborCost` number
- `actualOverheadCost` number
- `totalActualCost` number

## 9) Guvenlik ve Audit

`users`

- `id` string
- `role` enum: `planner | warehouse | purchasing | admin | operator`
- `permissions` string[]
- `status` enum

`auditLogs`

- `id` string
- `entityType` string
- `entityId` string
- `action` enum: `create | update | delete | approve | run`
- `before` object?
- `after` object?
- `actorId` string
- `createdAt` datetime

