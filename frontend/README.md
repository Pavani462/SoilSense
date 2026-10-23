# SoilSense Frontend

Professional multi-page React + TypeScript frontend for the SoilSense soil-fertility project.

## Included
- Home, Soil Analysis, Upload Report, Results, What-If, History, How It Works, About
- English / Telugu / Hindi interface
- Fertility, crop recommendation, nutrient guidance and SHAP presentation
- Local analysis history
- Print-to-PDF report action
- Soil report upload/review screen with assisted text extraction for lab values
- Responsive farmer-friendly design

## Run
```bash
npm install
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:8000

## Backend CORS
Apply `BACKEND_CORS_PATCH.txt` to `backend/main.py` so the browser can call FastAPI from localhost:5173.

## Notes
The Upload Report screen deliberately requires verification before values are used. OCR of arbitrary laboratory PDFs/images varies by report layout and units, so unverified extraction should never be sent directly to the model.
