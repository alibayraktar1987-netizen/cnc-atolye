# CNC Workshop MRP Master Blueprint

Bu dokuman, projeyi sifirdan kuruyormus gibi tam kapsamli MRP + MES + kalite + entegrasyon gereksinimini tek yerde toplar.

## 1) Core Product Modules

1. Master Data
- Item/part catalog
- Multi-level BOM + revision + effectivity
- Routing + operation + work center
- Machine registry (brand/protocol/capability)
- Tool library
- Supplier and customer master
- Unit of measure, scrap codes, downtime codes

2. Demand and Order Management
- Sales order intake
- Forecast management
- Work order creation from demand
- Priority, due date, customer SLA

3. MPS and MRP Core
- Time-bucketed MPS
- MRP run engine (gross/net requirements)
- Safety stock, reorder point, lot sizing rules
- Material reservation per work order
- Shortage detection and exception list

4. Purchasing
- Purchase requisition generation
- PO lifecycle (draft/approved/sent/received)
- Supplier lead-time and delivery performance
- Expedite/de-expedite suggestions

5. Inventory and Warehouse
- Multi-location stock
- Lot tracking + serial tracking
- FIFO/LIFO issue policy
- Stock movements (receipt/issue/transfer/adjustment)
- Cycle counting and stock aging

6. Scheduling and Capacity
- Finite capacity planning by machine/shift
- Auto sequencing (due date + priority + setup minimization)
- Gantt with drag-and-drop what-if simulation
- Planned vs actual comparison

7. Shop Floor Execution (MES)
- Dispatch list by machine/operator
- Real-time machine status and counters
- Downtime capture with reason codes
- Alarm timeline and escalation
- Shift close and production confirmation

8. Quality and Traceability
- Part genealogy (WO-machine-operator-program-version-time)
- In-process/final inspection records
- Scrap and rework tracking with cost impact
- FAI workflow
- Document attachments (drawing/setup/CMM report)

9. Tool Management
- Tool assignment to operation/program
- Tool life monitoring (cycles/time)
- Low-life prediction and alerts
- Presetter import (optional)

10. Costing
- Material + machine + labor + overhead model
- Planned vs actual order cost
- Cost per part
- Scrap/rework cost analysis

11. Reporting and KPI
- Daily/weekly/monthly production summary
- OEE and utilization trends
- On-time delivery KPI
- Top downtime reasons Pareto
- Scrap trend by part/customer
- Export to Excel/PDF + scheduled distribution

12. Platform Services
- RBAC + audit log
- REST API for all core entities
- Notification service (email/SMS/gateway)
- Localization (TR/EN)
- On-prem deployment and backup/restore

## 2) Machine Connectivity Layer

1. Supported connectivity
- Fanuc: FOCAS2 and/or MTConnect
- Siemens: OPC-UA
- Heidenhain: LSV2 or OPC-UA
- Generic: MTConnect or MQTT

2. Collected telemetry
- Status, active program, spindle load, feed override
- Cycle elapsed time, part counter
- Active alarms + history
- Tool life and tool number
- Operator ID (available if controller provides)

3. Data pipeline behavior
- Default polling: 10s (configurable)
- Edge buffering and reconnect sync
- UTC + machine-local timestamps
- Data quality flags (missing/stale/invalid)

## 3) Target Technical Architecture

1. Frontend
- React PWA (desktop + tablet + mobile browser)

2. Backend
- FastAPI (primary) or Node.js (alternative)
- Modular monolith first, service split later

3. Data
- PostgreSQL (transactional)
- TimescaleDB (time-series)
- MinIO/NAS (documents and NC files)
- Redis (optional cache/queue/realtime fanout)

4. Runtime
- On-prem Docker deployment
- Air-gapped operation support
- IPC-based edge agents for machine protocol adapters

## 4) Non-Functional Targets

1. Capacity
- Minimum 50 concurrent machines

2. Performance
- Main dashboard refresh under 2 seconds

3. Reliability
- Offline continuity for shop floor during temporary outages
- Buffered data replay without loss

4. Retention
- Minimum 5-year data retention

5. Security
- Session hardening, least privilege RBAC, full auditability

## 5) Delivery Roadmap (Recommended)

Detayli V2 teslim plani icin:
- `docs/roadmap-v2.md`

1. Phase A: Foundation
- Auth, RBAC, audit, localization, master data skeleton

2. Phase B: Core Transactions
- Sales orders, work orders, inventory core, purchasing core

3. Phase C: MRP Engine
- MPS, MRP run, shortage management, reservation

4. Phase D: Scheduling + MES
- Capacity planning, Gantt, dispatch, downtime and OEE

5. Phase E: Quality + Tool + Costing
- Traceability, inspection, tool life, cost modules

6. Phase F: Integrations + Hardening
- ERP/CAM integrations, reporting automation, performance tuning
- Not: Dis entegrasyon modulu guncel kapsamda "sonraya birakildi"

## 6) Definition of Done (Product Level)

1. End-to-end flow works:
- Sales order -> MRP -> Purchasing/work order -> Production -> Quality -> Shipment/closure

2. Traceability complete:
- Any part can be traced to machine/operator/program/tool/inspection

3. Planning accuracy:
- Capacity and material constraints reflected in schedule

4. Operations readiness:
- Plant can run with temporary network/server interruption
