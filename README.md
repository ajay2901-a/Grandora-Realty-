# Grandora Realty website

Frontend: HTML/CSS/JS (`public/`). Backend: Node.js + Express (`server.js`), JSON file storage (`data/`).

## Run
1. Install Node.js 18+
2. `npm install`
3. `ADMIN_KEY=your-secret npm start`  (Windows PowerShell: `$env:ADMIN_KEY="your-secret"; npm start`)
4. Open http://localhost:3000

## API
- GET  /api/properties?type=Residential&q=adyar
- POST /api/enquiries  {name, phone, email, interest, message}
- GET  /api/enquiries   (header `x-admin-key`)
- POST /api/properties  (header `x-admin-key`) {title, type, location, price, details}

Edit `data/properties.json` to change listings. Replace the gradient hero with your photo via `.hero` in `public/style.css`.
