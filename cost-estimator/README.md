# CNC Cost Estimator (Material Quote Module)

This module is a full-stack STEP-based cost estimation app for CNC machining.

## Stack

- Backend: FastAPI + SQLAlchemy + Celery
- Geometry processing: pythonOCC-compatible pipeline with fallback mode
- Queue: Redis + Celery
- DB: PostgreSQL
- File storage: MinIO (S3-compatible, local)
- Frontend: React + TypeScript + three.js (`@react-three/fiber`)
- Containers: Docker Compose

## What it does

1. Upload `.step` / `.stp` files
2. Extract geometry properties:
   - Bounding box
   - Volume / surface area
   - Face / edge counts
   - Hole / bore counts
   - Rotational symmetry heuristic
   - Basic undercut / thread heuristics
3. Determine stock:
   - `round_bar` for rotational parts
   - `rectangular_block` otherwise
   - Configurable allowance per material
   - Nearest standard stock matching
4. Classify operations:
   - CNC Turning / CNC Milling
   - Drilling, Tapping, Boring
   - C-axis Milling
5. Estimate cycle time and cost using formula-based rules
6. Render generated 3D preview model in browser (`glb` output)

## Development Run

From `cost-estimator/`:

```bash
docker compose up --build
```

Endpoints:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000/api/v1`
- MinIO Console: `http://localhost:9001` (`minioadmin` / `minioadmin`)

## Online Deployment

Online kullanimda bu modulu ayri `localhost` portlariyla calistirmak zorunda degilsiniz.

Onerilen yapi:

- Ana uygulama ve Cost Estimator ayni domain altindan yayinlanir
- `cost-estimator/frontend/dist` build'i nginx ile servis edilir
- API istekleri ayni domaindeki `/api/v1` yolundan FastAPI'ye proxy edilir
- CORS ancak farkli domain kullaniliyorsa gerekir

Bu repo icinde ana `docker-compose.yml` ve nginx konfigrasyonu bu same-origin online model icin duzenlenmistir.

## API Highlights

- `POST /api/v1/parts/upload` (`multipart/form-data`)
- `GET /api/v1/jobs/{job_id}`
- `GET /api/v1/parts`
- `GET /api/v1/parts/{part_id}`
- `GET /api/v1/parts/{part_id}/model`
- `GET /api/v1/materials`

## Notes on pythonOCC

- The analysis service attempts a pythonOCC path first.
- If OCC bindings are not available in the runtime, it automatically uses a deterministic fallback geometry estimator so the full workflow remains operational.
- To enforce full OCC extraction in production, include a pythonOCC-enabled base image and OCC runtime libs.
